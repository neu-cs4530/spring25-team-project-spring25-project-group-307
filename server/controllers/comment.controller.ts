import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Comment,
  AddCommentRequest,
  CommentVoteRequest,
  FakeSOSocket,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseAnswer,
  DeleteCommentRequest,
  PopulatedDatabaseComment,
  GetCommentRequest,
} from '../types/types';
import {
  addComment,
  deleteCommentById,
  saveComment,
  addVoteToComment,
} from '../services/comment.service';
import getUpdatedRank from '../utils/userstat.util';
import CommentModel from '../models/comments.model';
import grantAchievementToUser from '../services/achievement.service';
import { populateDocument } from '../utils/database.util';
import { getCommunityQuestion } from '../services/question.service';
import UserNotificationManager from '../services/userNotificationManager';
import UserModel from '../models/users.model';

const commentController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddCommentRequest): boolean =>
    !!req.body.id &&
    !!req.body.type &&
    (req.body.type === 'question' || req.body.type === 'answer' || req.body.type === 'comment') &&
    !!req.body.comment &&
    req.body.comment.text !== undefined &&
    req.body.comment.commentBy !== undefined &&
    req.body.comment.commentDateTime !== undefined;

  /**
   * Checkes if the provided delete comment request contains the required fields.
   *
   * @param req The request object containing the comment ID.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isDeleteRequestValid = (req: DeleteCommentRequest): boolean => !!req.params.cid;

  /**
   * Checks if the provided get comment request contains the required fields.
   * @param req The request object containing the comment ID.
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isGetRequestValid = (req: GetCommentRequest): boolean => !!req.params.cid;

  /**
   * Validates the comment object to ensure it is not empty.
   *
   * @param comment The comment to validate.
   *
   * @returns `true` if the coment is valid, otherwise `false`.
   */
  const isCommentValid = (comment: Comment): boolean =>
    comment.text !== undefined &&
    comment.text !== '' &&
    comment.commentBy !== undefined &&
    comment.commentBy !== '' &&
    comment.commentDateTime !== undefined &&
    comment.commentDateTime !== null;

  /**
   * Handles adding a new comment to the specified question or answer. The comment is first validated and then saved.
   * If the comment is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddCommentRequest object containing the comment data.
   * @param res The HTTP response object used to send back the result of the operation.
   * @param type The type of the comment, either 'question' or 'answer'.
   *
   * @returns A Promise that resolves to void.
   */
  const addCommentRoute = async (req: AddCommentRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const id = req.body.id as string;

    if (!ObjectId.isValid(id)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    const { comment, type } = req.body;
    const unlocked: string[] = [];

    if (!isCommentValid(comment)) {
      res.status(400).send('Invalid comment body');
      return;
    }

    try {
      const comFromDb = await saveComment(comment);

      if ('error' in comFromDb) {
        throw new Error(comFromDb.error);
      }

      const status = await addComment(id, type, comFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error);
      }

      // Populates the fields of the question or answer that this comment
      // was added to, and emits the updated object
      const populatedDoc = await populateDocument(id, type);

      if (populatedDoc && 'error' in populatedDoc) {
        throw new Error(populatedDoc.error);
      }

      // notify users
      if (type === 'question') {
        const communityQuestion = await getCommunityQuestion(status._id);
        if (!('error' in communityQuestion)) {
          const userNotificationManager = UserNotificationManager.getInstance();

          userNotificationManager.notifySpecificOnlineUsers(
            communityQuestion.title,
            [(populatedDoc as PopulatedDatabaseQuestion).askedBy],
            'Comments on my Questions',
            `Someone commented on your question in ${communityQuestion.title}. Check it out!`,
            id,
          );
        }
      }

      const user = await UserModel.findOne({ username: comment.commentBy });
      if (user) {
        const newScore = user.score + 3;
        const newRank = getUpdatedRank(newScore);
        const currentRank = user?.ranking;
        if (currentRank !== newRank && newRank === 'Common Contributor') {
          const a = await grantAchievementToUser(user._id.toString(), 'Ascension I');
          if (a) unlocked.push(a);
        }
        if (currentRank !== newRank && newRank === 'Skilled Solver') {
          const a = await grantAchievementToUser(user._id.toString(), 'Ascension II');
          if (a) unlocked.push(a);
        }
        if (currentRank !== newRank && newRank === 'Expert Explorer') {
          const a = await grantAchievementToUser(user._id.toString(), 'Ascension III');
          if (a) unlocked.push(a);
        }
        if (currentRank !== newRank && newRank === 'Mentor Maven') {
          const a = await grantAchievementToUser(user._id.toString(), 'Ascension IV');
          if (a) unlocked.push(a);
        }
        if (currentRank !== newRank && newRank === 'Master Maverick') {
          const a = await grantAchievementToUser(user._id.toString(), 'Ascension V');
          if (a) unlocked.push(a);
        }
        if (user.questionsAsked === 0) {
          const a = await grantAchievementToUser(user._id.toString(), 'First Step');
          if (a) unlocked.push(a);
        }
        if (user.questionsAsked === 4) {
          const a = await grantAchievementToUser(user._id.toString(), 'Curious Thinker');
          if (a) unlocked.push(a);
        }
        await UserModel.updateOne(
          { username: comment.commentBy },
          { $set: { score: newScore, ranking: newRank } },
        );
      }

      socket.emit('commentUpdate', {
        result: populatedDoc as
          | PopulatedDatabaseQuestion
          | PopulatedDatabaseAnswer
          | PopulatedDatabaseComment,
        type,
      });
      res.json({ ...comFromDb, unlockedAchievements: unlocked });
    } catch (err: unknown) {
      res.status(500).send(`Error when adding comment: ${(err as Error).message}`);
    }
  };

  /**
   * Handles deleting a comment from the database.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const deleteComment = async (req: DeleteCommentRequest, res: Response): Promise<void> => {
    if (!isDeleteRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { cid } = req.params;

    try {
      const comment = await deleteCommentById(cid);
      if (!comment) {
        throw new Error('failed to delete comment');
      }
      res.json(comment);
    } catch (error) {
      res.status(500).send(`Error when deleting comment: ${(error as Error).message}`);
    }
  };

  /**
   * Handles retrieving a populated database comment.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const getCommentByIdRoute = async (req: GetCommentRequest, res: Response): Promise<void> => {
    if (!isGetRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { cid } = req.params;

    try {
      const comment = await populateDocument(cid, 'comment');
      if (!comment) {
        throw new Error('Failed to retrieve comment');
      }
      res.json(comment);
    } catch (error) {
      res.status(500).send(`Error when retrieving comment: ${(error as Error).message}`);
    }
  };

  /**
   * voting for a comment.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @param type The type of voting.
   * @returns A Promise that resolves to void.
   */

  const voteComment = async (
    req: CommentVoteRequest,
    res: Response,
    type: 'upvote' | 'downvote',
  ): Promise<void> => {
    if (!req.body.cid || !req.body.username) {
      res.status(400).send('Invalid vote request');
      return;
    }

    const { cid, username } = req.body;
    const unlocked: string[] = [];

    try {
      const comment = await CommentModel.findById(cid);
      if (!comment) {
        res.status(404).send('Comment not found');
        return;
      }

      const voter = await UserModel.findOne({ username });
      const recipient = await UserModel.findOne({ username: comment.commentBy });

      if (!voter || !recipient) {
        res.status(404).send('User not found');
        return;
      }

      const wasUpvoted = comment.upVotes.includes(username);
      const wasDownvoted = comment.downVotes.includes(username);

      comment.upVotes = comment.upVotes.filter(u => u !== username);
      comment.downVotes = comment.downVotes.filter(u => u !== username);

      const result = await addVoteToComment(cid, username, type);
      if ('error' in result) throw new Error(result.error);

      let voterDelta = 0;
      let recipientDelta = 0;

      if (type === 'upvote') {
        if (wasUpvoted) {
          voterDelta = -1;
          recipientDelta = -3;
          voter.upVotesGiven -= 1;
        } else if (wasDownvoted) {
          voterDelta = +2;
          recipientDelta = +6;
          voter.upVotesGiven += 1;
          voter.downVotesGiven -= 1;
        } else {
          voterDelta = +1;
          recipientDelta = +3;
          voter.upVotesGiven += 1;
        }
      } else if (wasDownvoted) {
        voterDelta = +1;
        recipientDelta = +1;
        voter.downVotesGiven -= 1;
      } else if (wasUpvoted) {
        voterDelta = -2;
        recipientDelta = -6;
        voter.upVotesGiven -= 1;
        voter.downVotesGiven += 1;
      } else {
        voterDelta = -1;
        recipientDelta = -1;
        voter.downVotesGiven += 1;
      }

      if (voter.upVotesGiven === 5) {
        const a = await grantAchievementToUser(voter._id.toString(), 'Diligent Reviewer');
        if (a) unlocked.push(a);
      }

      const voterRankBefore = voter.ranking;
      const recipientRankBefore = recipient.ranking;

      if (voter._id.equals(recipient._id)) {
        voter.score += voterDelta + recipientDelta;
        voter.ranking = getUpdatedRank(voter.score);
        await voter.save();
        if (voterRankBefore !== voter.ranking) {
          if (voter.ranking === 'Common Contributor') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension I');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Skilled Solver') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension II');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Expert Explorer') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension III');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Mentor Maven') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension IV');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Master Maverick') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension V');
            if (a) unlocked.push(a);
          }
        }
      } else {
        voter.score += voterDelta;
        recipient.score += recipientDelta;
        voter.ranking = getUpdatedRank(voter.score);
        recipient.ranking = getUpdatedRank(recipient.score);

        // Rank-up achievements (recipient)

        if (voterRankBefore !== voter.ranking) {
          if (voter.ranking === 'Common Contributor') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension I');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Skilled Solver') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension II');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Expert Explorer') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension III');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Mentor Maven') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension IV');
            if (a) unlocked.push(a);
          } else if (voter.ranking === 'Master Maverick') {
            const a = await grantAchievementToUser(voter._id.toString(), 'Ascension V');
            if (a) unlocked.push(a);
          }
        }

        if (recipientRankBefore !== recipient.ranking) {
          if (recipient.ranking === 'Common Contributor') {
            const a = await grantAchievementToUser(recipient._id.toString(), 'Ascension I');
            if (a) unlocked.push(a);
          } else if (recipient.ranking === 'Skilled Solver') {
            const a = await grantAchievementToUser(recipient._id.toString(), 'Ascension II');
            if (a) unlocked.push(a);
          } else if (recipient.ranking === 'Expert Explorer') {
            const a = await grantAchievementToUser(recipient._id.toString(), 'Ascension III');
            if (a) unlocked.push(a);
          } else if (recipient.ranking === 'Mentor Maven') {
            const a = await grantAchievementToUser(recipient._id.toString(), 'Ascension IV');
            if (a) unlocked.push(a);
          } else if (recipient.ranking === 'Master Maverick') {
            const a = await grantAchievementToUser(recipient._id.toString(), 'Ascension V');
            if (a) unlocked.push(a);
          }
        }
      }
      await voter.save();
      await recipient.save();

      socket.emit('commentVoteUpdate', {
        cid,
        upVotes: result.upVotes,
        downVotes: result.downVotes,
      });

      res.json({
        answer: {
          msg: `${type} successful`,
          upVotes: result.upVotes,
          downVotes: result.downVotes,
        },
        unlockedAchievements: unlocked,
      });
    } catch (err) {
      res.status(500).send(`Error when ${type}ing comment: ${(err as Error).message}`);
    }
  };

  /**
   * Handles upvoting a comment. The request must contain the answer ID (aid) and the username.
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The VoteRequest object containing the answer ID and the username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const upvoteComment = async (req: CommentVoteRequest, res: Response): Promise<void> => {
    voteComment(req, res, 'upvote');
  };

  /**
   * Handles downvoting a comment. The request must contain the question ID (qid) and the username.
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The VoteRequest object containing the question ID and the username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const downvoteComment = async (req: CommentVoteRequest, res: Response): Promise<void> => {
    voteComment(req, res, 'downvote');
  };

  router.post('/addComment', addCommentRoute);
  router.delete('/deleteComment/:cid', deleteComment);
  router.get('/getComment/:cid', getCommentByIdRoute);
  router.post('/upvoteComment', upvoteComment);
  router.post('/downvoteComment', downvoteComment);

  return router;
};

export default commentController;
