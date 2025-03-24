import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import { Answer, AddAnswerRequest, FakeSOSocket, PopulatedDatabaseAnswer } from '../types/types';
import { addAnswerToQuestion, saveAnswer } from '../services/answer.service';
import { populateDocument } from '../utils/database.util';
import UserModel from '../models/users.model';
import getUpdatedRank from '../utils/user.util';

const answerController = (socket: FakeSOSocket) => {
  const router = express.Router();

  function isRequestValid(req: AddAnswerRequest): boolean {
    return !!req.body.qid && !!req.body.ans;
  }

  function isAnswerValid(ans: Answer): boolean {
    return !!ans.text && !!ans.ansBy && !!ans.ansDateTime;
  }

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
      const ansFromDb = await saveAnswer(ansInfo);

      if ('error' in ansFromDb) {
        throw new Error(ansFromDb.error as string);
      }

      const status = await addAnswerToQuestion(qid, ansFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      const populatedAns = await populateDocument(ansFromDb._id.toString(), 'answer');

      if (populatedAns && 'error' in populatedAns) {
        throw new Error(populatedAns.error);
      }

      const user = await UserModel.findOne({ username: ansInfo.ansBy });
      let updatedRank: string | undefined;

      if (user) {
        const oldRank = user.ranking;
        const newScore = user.score + 10;
        const newRank = getUpdatedRank(newScore);
        const newResponsesGiven = (user.responsesGiven ?? 0) + 1;

        await UserModel.updateOne(
          { username: ansInfo.ansBy },
          {
            $set: {
              score: newScore,
              ranking: newRank,
              responsesGiven: newResponsesGiven,
            },
          },
        );

        if (oldRank !== newRank) {
          updatedRank = newRank;
        }
      }

      // Emit socket update
      socket.emit('answerUpdate', {
        qid: new ObjectId(qid),
        answer: populatedAns as PopulatedDatabaseAnswer,
      });

      // Respond with the answer + optional updated rank
      res.json({
        ...ansFromDb,
        ...(updatedRank && { updatedRank }),
      });
    } catch (err) {
      res.status(500).send(`Error when adding answer: ${(err as Error).message}`);
    }
  };

  router.post('/addAnswer', addAnswer);

  return router;
};

export default answerController;
