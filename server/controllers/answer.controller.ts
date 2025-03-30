import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Answer,
  AddAnswerRequest,
  FakeSOSocket,
  PopulatedDatabaseAnswer,
  VoteRequest,
} from '../types/types';
import { addAnswerToQuestion, saveAnswer } from '../services/answer.service';
import { populateDocument } from '../utils/database.util';
import UserModel from '../models/users.model';
import AnswerModel from '../models/answers.model';
import getUpdatedRank from '../utils/userstat.util';

const answerController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const isRequestValid = (req: AddAnswerRequest): boolean => !!req.body.qid && !!req.body.ans;

  const isAnswerValid = (ans: Answer): boolean => !!ans.text && !!ans.ansBy && !!ans.ansDateTime;

  const addAnswer = async (req: AddAnswerRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!isAnswerValid(req.body.ans)) {
      res.status(400).send('Invalid answer');
      return;
    }

    const { qid } = req.body;
    const ansInfo: Answer = req.body.ans;

    try {
      const savedAnswer = await saveAnswer(ansInfo);
      if ('error' in savedAnswer) throw new Error(savedAnswer.error);

      const linked = await addAnswerToQuestion(qid, savedAnswer);
      if ('error' in linked) throw new Error(linked.error);

      const populatedAns = await populateDocument(savedAnswer._id.toString(), 'answer');
      if ('error' in populatedAns) throw new Error(populatedAns.error);

      const user = await UserModel.findOne({ username: ansInfo.ansBy });
      if (user) {
        const newScore = user.score + 10;
        const newRank = getUpdatedRank(newScore);
        const newResponsesGiven = (user.responsesGiven ?? 0) + 1;

        await UserModel.updateOne(
          { username: ansInfo.ansBy },
          { $set: { score: newScore, ranking: newRank, responsesGiven: newResponsesGiven } },
        );
      }

      socket.emit('answerUpdate', {
        qid: new ObjectId(qid),
        answer: populatedAns as PopulatedDatabaseAnswer,
      });

      res.json(savedAnswer);
    } catch (err) {
      res.status(500).send(`Error when adding answer: ${(err as Error).message}`);
    }
  };

  const voteAnswer = async (
    req: VoteRequest,
    res: Response,
    type: 'upvote' | 'downvote',
  ): Promise<void> => {
    const { qid: aid, username } = req.body;

    if (!aid || !username) {
      res.status(400).send('Missing aid or username');
      return;
    }

    try {
      const answer = await AnswerModel.findById(aid);
      if (!answer) {
        res.status(404).send('Answer not found');
        return;
      }

      const voter = await UserModel.findOne({ username });
      const recipient = await UserModel.findOne({ username: answer.ansBy });

      if (!voter || !recipient) {
        res.status(404).send('User not found');
        return;
      }

      const wasUpvoted = answer.upVotes.includes(username);
      const wasDownvoted = answer.downVotes.includes(username);

      answer.upVotes = answer.upVotes.filter(u => u !== username);
      answer.downVotes = answer.downVotes.filter(u => u !== username);

      let voterDelta = 0;
      let recipientDelta = 0;

      if (type === 'upvote') {
        if (wasUpvoted) {
          voterDelta = -1;
          recipientDelta = -10;
        } else if (wasDownvoted) {
          voterDelta = +2;
          recipientDelta = +15;
          answer.upVotes.push(username);
        } else {
          voterDelta = +1;
          recipientDelta = +10;
          answer.upVotes.push(username);
        }
      } else if (wasDownvoted) {
        voterDelta = +1;
        recipientDelta = +5;
      } else if (wasUpvoted) {
        voterDelta = -2;
        recipientDelta = -15;
        answer.downVotes.push(username);
      } else {
        voterDelta = -1;
        recipientDelta = -5;
        answer.downVotes.push(username);
      }

      await answer.save();

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

      socket.emit('answerVoteUpdate', {
        qid: aid,
        upVotes: answer.upVotes,
        downVotes: answer.downVotes,
      });

      res.json({
        success: true,
        vote: type,
        voterScore: voter.score,
        recipientScore: recipient.score,
      });
    } catch (err) {
      res.status(500).send(`Voting on answer failed: ${(err as Error).message}`);
    }
  };

  const upvoteAnswer = async (req: VoteRequest, res: Response) => voteAnswer(req, res, 'upvote');
  const downvoteAnswer = async (req: VoteRequest, res: Response) =>
    voteAnswer(req, res, 'downvote');

  router.post('/addAnswer', addAnswer);
  router.post('/upvoteAnswer', upvoteAnswer);
  router.post('/downvoteAnswer', downvoteAnswer);

  return router;
};

export default answerController;
