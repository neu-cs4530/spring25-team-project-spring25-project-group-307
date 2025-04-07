import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Question,
  FindQuestionRequest,
  FindQuestionByIdRequest,
  AddQuestionRequest,
  VoteRequest,
  FakeSOSocket,
  PopulatedDatabaseQuestion,
  GetCommunityQuestionRequest,
  CommunityResponse,
} from '../types/types';
import {
  addVoteToQuestion,
  fetchAndIncrementQuestionViewsById,
  filterQuestionsByAskedBy,
  filterQuestionsBySearch,
  getQuestionsByOrder,
  saveQuestion,
  getCommunityQuestion,
  deleteQuestionById,
  addReportToQuestion,
  removeReportFromQuestion,
  getPopulatedQuestionById,
} from '../services/question.service';
import { processTags } from '../services/tag.service';
import { populateDocument } from '../utils/database.util';
import grantAchievementToUser from '../services/achievement.service';
import QuestionModel from '../models/questions.model';
import UserModel from '../models/users.model';
import getUpdatedRank from '../utils/userstat.util';
import { getUserByUsername } from '../services/user.service';

const questionController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Retrieves a list of questions filtered by a search term and ordered by a specified criterion.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The FindQuestionRequest object containing the query parameters `order` and `search`.
   * @param res The HTTP response object used to send back the filtered list of questions.
   *
   * @returns A Promise that resolves to void.
   */
  const getQuestionsByFilter = async (req: FindQuestionRequest, res: Response): Promise<void> => {
    const { order } = req.query;
    const { search } = req.query;
    const { askedBy } = req.query;

    try {
      let qlist: PopulatedDatabaseQuestion[] = await getQuestionsByOrder(order);

      // Filter by askedBy if provided
      if (askedBy) {
        qlist = filterQuestionsByAskedBy(qlist, askedBy);
      }

      // Filter by search keyword and tags
      const resqlist: PopulatedDatabaseQuestion[] = filterQuestionsBySearch(qlist, search);
      res.json(resqlist);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching questions by filter: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching questions by filter`);
      }
    }
  };

  /**
   * Retrieves a question by its unique ID, and increments the view count for that question.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The FindQuestionByIdRequest object containing the question ID as a parameter.
   * @param res The HTTP response object used to send back the question details.
   *
   * @returns A Promise that resolves to void.
   */
  const getQuestionByIdRoute = async (
    req: FindQuestionByIdRequest,
    res: Response,
  ): Promise<void> => {
    const { qid } = req.params;
    const { username } = req.query;

    if (!ObjectId.isValid(qid)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    if (username === undefined) {
      res.status(400).send('Invalid username requesting question.');
      return;
    }

    try {
      const q = await fetchAndIncrementQuestionViewsById(qid, username);

      if ('error' in q) {
        throw new Error('Error while fetching question by id');
      }

      socket.emit('viewsUpdate', q);
      res.json(q);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching question by id: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching question by id`);
      }
    }
  };

  /**
   * Validates the question object to ensure it contains all the necessary fields.
   *
   * @param question The question object to validate.
   *
   * @returns `true` if the question is valid, otherwise `false`.
   */
  const isQuestionBodyValid = (question: Question): boolean =>
    question.title !== undefined &&
    question.title !== '' &&
    question.text !== undefined &&
    question.text !== '' &&
    question.tags !== undefined &&
    question.tags.length > 0 &&
    question.askedBy !== undefined &&
    question.askedBy !== '' &&
    question.askDateTime !== undefined &&
    question.askDateTime !== null;

  /**
   * Adds a new question to the database. The question is first validated and then saved.
   * If the tags are invalid or saving the question fails, the HTTP response status is updated.
   *
   * @param req The AddQuestionRequest object containing the question data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addQuestion = async (req: AddQuestionRequest, res: Response): Promise<void> => {
    if (!isQuestionBodyValid(req.body)) {
      res.status(400).send('Invalid question body');
      return;
    }

    const question: Question = req.body;

    try {
      const questionswithtags = {
        ...question,
        tags: await processTags(question.tags),
      };

      if (questionswithtags.tags.length === 0) {
        throw new Error('Invalid tags');
      }

      const unlocked: string[] = [];
      const result = await saveQuestion(questionswithtags);

      if ('error' in result) {
        throw new Error(result.error);
      }

      // Populates the fields of the question that was added, and emits the new object
      const populatedQuestion = await populateDocument(result._id.toString(), 'question');

      if ('error' in populatedQuestion) {
        throw new Error(populatedQuestion.error);
      }

      // Award score and update rank
      const user = await UserModel.findOne({ username: question.askedBy });
      if (user) {
        const newScore = user.score + 5;
        const newRank = getUpdatedRank(newScore);
        const newQuestionsAsked = user.questionsAsked + 1;
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
          { username: question.askedBy },
          { $set: { score: newScore, ranking: newRank, questionsAsked: newQuestionsAsked } },
        );
      }
      socket.emit('questionUpdate', populatedQuestion as PopulatedDatabaseQuestion);

      res.json({ question: populatedQuestion, unlockedAchievements: unlocked });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when saving question: ${err.message}`);
      }
    }
  };

  /**
   * Deletes a question from the database. The question is identified by its unique ID.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req the HTTP request object containing the question ID as a parameter.
   * @param res the HTTP response object used to send back the result of the operation.
   *
   * @returns a Promise that resolves to void.
   */
  const deleteQuestion = async (req: FindQuestionByIdRequest, res: Response): Promise<void> => {
    const { qid } = req.params;

    if (!ObjectId.isValid(qid)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    try {
      const result = await deleteQuestionById(qid);

      if ('error' in result) {
        throw new Error(result.error);
      }

      res.json(result);
    } catch (err: unknown) {
      res.status(500).send(`Error when deleting question`);
    }
  };

  /**
   * Helper function to handle upvoting or downvoting a question.
   *
   * @param req The VoteRequest object containing the question ID and the username.
   * @param res The HTTP response object used to send back the result of the operation.
   * @param type The type of vote to perform (upvote or downvote).
   *
   * @returns A Promise that resolves to void.
   */
  const voteQuestion = async (
    req: VoteRequest,
    res: Response,
    type: 'upvote' | 'downvote',
  ): Promise<void> => {
    if (!req.body.qid || !req.body.username) {
      res.status(400).send('Invalid request');
      return;
    }

    const { qid, username } = req.body;
    const unlocked: string[] = [];

    try {
      const question = await QuestionModel.findById(qid);
      if (!question) {
        res.status(404).send('Question not found');
        return;
      }

      const voter = await UserModel.findOne({ username });
      const recipient = await UserModel.findOne({ username: question.askedBy });

      if (!voter || !recipient) {
        res.status(404).send('User not found');
        return;
      }

      const wasUpvoted = question.upVotes.includes(username);
      const wasDownvoted = question.downVotes.includes(username);

      question.upVotes = question.upVotes.filter(u => u !== username);
      question.downVotes = question.downVotes.filter(u => u !== username);

      const result = await addVoteToQuestion(qid, username, type);
      if ('error' in result) {
        throw new Error(result.error);
      }

      let voterDelta = 0;
      let recipientDelta = 0;
      if (type === 'upvote') {
        // const updatedQuestion = await QuestionModel.findById(qid);
        // if (updatedQuestion && updatedQuestion.upVotes.length === 5) {
        // const a = await grantAchievementToUser(recipient._id.toString(), 'Community Favorite');
        // if (a) unlocked.push(a);
        // }

        if (wasUpvoted) {
          voterDelta = -1;
          recipientDelta = -5;
          voter.upVotesGiven -= 1;
        } else if (wasDownvoted) {
          voterDelta = +2;
          recipientDelta = +7;
          voter.upVotesGiven += 1;
          voter.downVotesGiven -= 1;
        } else {
          // First time upvote
          voterDelta = +1;
          recipientDelta = +5;
          voter.upVotesGiven += 1;
        }
      } else if (type === 'downvote') {
        if (wasDownvoted) {
          // Cancel downvote
          voterDelta = +1;
          recipientDelta = +2;
          voter.downVotesGiven -= 1;
        } else if (wasUpvoted) {
          // From upvote → downvote
          voterDelta = -2;
          recipientDelta = -7;
          voter.upVotesGiven -= 1;
          voter.downVotesGiven += 1;
        } else {
          // First time downvote
          voterDelta = -1;
          recipientDelta = -2;
          voter.downVotesGiven += 1;
        }
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
      } else {
        voter.score += voterDelta;
        recipient.score += recipientDelta;

        voter.ranking = getUpdatedRank(voter.score);
        recipient.ranking = getUpdatedRank(recipient.score);

        await voter.save();
        await recipient.save();

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

      // Emit the updated vote counts to all connected clients
      socket.emit('voteUpdate', { qid, upVotes: result.upVotes, downVotes: result.downVotes });
      res.json({
        answer: {
          msg: `${type} successful`,
          upVotes: result.upVotes,
          downVotes: result.downVotes,
        },
        unlockedAchievements: unlocked,
      });
    } catch (err) {
      res.status(500).send(`Error when ${type}ing: ${(err as Error).message}`);
    }
  };

  /**
   * Handles upvoting a question. The request must contain the question ID (qid) and the username.
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The VoteRequest object containing the question ID and the username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const upvoteQuestion = async (req: VoteRequest, res: Response): Promise<void> => {
    voteQuestion(req, res, 'upvote');
  };

  /**
   * Handles downvoting a question. The request must contain the question ID (qid) and the username.
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The VoteRequest object containing the question ID and the username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const downvoteQuestion = async (req: VoteRequest, res: Response): Promise<void> => {
    voteQuestion(req, res, 'downvote');
  };

  /**
   * Handles retrieving the community a question is part of.
   * If the question is not part of a community, `null` is returned.
   */
  const getCommunityQuestionRoute = async (
    req: GetCommunityQuestionRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const community: CommunityResponse = await getCommunityQuestion(req.params.qid);
      if ('error' in community) {
        throw new Error(community.error);
      }
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when getting community question: ${(error as Error).message}`);
    }
  };

  const addReportToQuestionRoute = async (
    req: FindQuestionByIdRequest,
    res: Response,
  ): Promise<void> => {
    const { qid } = req.params;
    const { username } = req.body;

    try {
      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw new Error('User not found');
      }

      const result = await addReportToQuestion(qid, user._id.toString());

      if ('error' in result) {
        throw new Error(result.error);
      }

      res.json(result);
    } catch (err) {
      res.status(500).send(`Error when reporting question: ${(err as Error).message}`);
    }
  };

  const removeReportFromQuestionRoute = async (
    req: FindQuestionByIdRequest,
    res: Response,
  ): Promise<void> => {
    const { qid } = req.params;
    const { username } = req.body;

    try {
      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw new Error('User not found');
      }

      const result = await removeReportFromQuestion(qid, user._id.toString());

      if ('error' in result) {
        throw new Error(result.error);
      }

      res.json(result);
    } catch (err) {
      res.status(500).send(`Error when removing report from question: ${(err as Error).message}`);
    }
  };

  const getPublicQuestionRoute = async (
    req: GetCommunityQuestionRequest,
    res: Response,
  ): Promise<void> => {
    const { qid } = req.params;

    try {
      // Fetch the question by ID
      const question = await getPopulatedQuestionById(qid.toString());

      if (!question || 'error' in question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      // Check if the question is part of a community
      const community = await getCommunityQuestion(qid);

      if ('error' in community) {
        // If the question is not part of a community, return the question
        res.json(question);
        return;
      }

      // If the community is private, return null
      if (community.isPrivate) {
        res.json(null);
        return;
      }

      // If the community is public, return the question
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router
  router.get('/getQuestion', getQuestionsByFilter);
  router.get('/getQuestionById/:qid', getQuestionByIdRoute);
  router.post('/addQuestion', addQuestion);
  router.delete('/deleteQuestion/:qid', deleteQuestion);
  router.post('/upvoteQuestion', upvoteQuestion);
  router.post('/downvoteQuestion', downvoteQuestion);
  router.get('/getCommunityQuestion/:qid', getCommunityQuestionRoute);
  router.post('/addReportToQuestion/:qid', addReportToQuestionRoute);
  router.post('/removeReportFromQuestion/:qid', removeReportFromQuestionRoute);
  router.get('/getPublicQuestion/:qid', getPublicQuestionRoute);

  return router;
};

export default questionController;
