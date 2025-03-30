import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Comment,
  AddCommentRequest,
  FakeSOSocket,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseAnswer,
  DeleteCommentRequest,
  CommentVoteRequest,
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
    (req.body.type === 'question' || req.body.type === 'answer') &&
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

          await userNotificationManager.notifySpecificOnlineUsers(
            communityQuestion.title,
            [(populatedDoc as PopulatedDatabaseQuestion).askedBy],
            'Comments on my Questions',
            `Someone commented on your question in ${communityQuestion.title}. Check it out!`,
          );
        }
      }

      socket.emit('commentUpdate', {
        result: populatedDoc as PopulatedDatabaseQuestion | PopulatedDatabaseAnswer,
        type,
      });
      res.json(comFromDb);
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
        } else if (wasDownvoted) {
          voterDelta = +2;
          recipientDelta = +6;
        } else {
          voterDelta = +1;
          recipientDelta = +3;
        }
      } else if (wasDownvoted) {
        voterDelta = +1;
        recipientDelta = +1;
      } else if (wasUpvoted) {
        voterDelta = -2;
        recipientDelta = -6;
      } else {
        voterDelta = -1;
        recipientDelta = -1;
      }

      if (voter._id.equals(recipient._id)) {
        voter.score += voterDelta + recipientDelta;
        voter.ranking = getUpdatedRank(voter.score);
        await voter.save();
      } else {
        voter.score += voterDelta;
        recipient.score += recipientDelta;
        voter.ranking = getUpdatedRank(voter.score);
        recipient.ranking = getUpdatedRank(recipient.score);
        await voter.save();
        await recipient.save();
      }

      socket.emit('commentVoteUpdate', {
        cid,
        upVotes: result.upVotes,
        downVotes: result.downVotes,
      });

      res.json({
        success: true,
        vote: type,
        voterScore: voter.score,
        recipientScore: recipient.score,
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
  router.post('/upvoteComment', upvoteComment);
  router.post('/downvoteComment', downvoteComment);

  return router;
};

export default commentController;
