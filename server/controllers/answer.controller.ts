import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Answer,
  AddAnswerRequest,
  FakeSOSocket,
  PopulatedDatabaseAnswer,
  DeleteAnswerRequest,
} from '../types/types';
import { addAnswerToQuestion, deleteAnswerById, saveAnswer } from '../services/answer.service';
import { populateDocument } from '../utils/database.util';
import UserModel from '../models/users.model';
import getUpdatedRank from '../utils/userstat.util';
import { getCommunityQuestion } from '../services/question.service';
import UserNotificationManager from '../services/userNotificationManager';

const answerController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isRequestValid(req: AddAnswerRequest): boolean {
    return !!req.body.qid && !!req.body.ans;
  }

  /**
   * Checks if the provided delete answer request contains the required fields.
   *
   * @param req The request object containing the answer ID.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isDeleteRequestValid(req: DeleteAnswerRequest): boolean {
    return !!req.params.aid;
  }

  /**
   * Checks if the provided answer contains the required fields.
   *
   * @param ans The answer object to validate.
   *
   * @returns `true` if the answer is valid, otherwise `false`.
   */
  function isAnswerValid(ans: Answer): boolean {
    return !!ans.text && !!ans.ansBy && !!ans.ansDateTime;
  }

  /**
   * Adds a new answer to a question in the database. The answer request and answer are
   * validated and then saved. If successful, the answer is associated with the corresponding
   * question. If there is an error, the HTTP response's status is updated.
   *
   * @param req The AnswerRequest object containing the question ID and answer data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
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

      if (user) {
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
      }

      const communityQuestion = await getCommunityQuestion(status._id);
      if (!('error' in communityQuestion)) {
        const userNotificationManager = UserNotificationManager.getInstance();
        userNotificationManager.notifySpecificOnlineUsers(
          communityQuestion.title,
          [status.askedBy],
          'Answers to my Questions',
          `Your question in ${communityQuestion.title} has a new answer. Check it out!`,
          qid,
        );
      }
      // Populates the fields of the answer that was added and emits the new object
      socket.emit('answerUpdate', {
        qid: new ObjectId(qid),
        answer: populatedAns as PopulatedDatabaseAnswer,
      });
      res.json(ansFromDb);
    } catch (err) {
      res.status(500).send(`Error when adding answer: ${(err as Error).message}`);
    }
  };

  /**
   * Deletes an answer from the database.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const deleteAnswer = async (req: DeleteAnswerRequest, res: Response): Promise<void> => {
    if (!isDeleteRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { aid } = req.params;

    try {
      const answer = await deleteAnswerById(aid);
      if (!answer) {
        throw new Error('failed to delete answer');
      }
      res.json(answer);
    } catch (error) {
      res.status(500).send(`Error when deleting answer: ${(error as Error).message}`);
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router.
  router.post('/addAnswer', addAnswer);
  router.delete('/deleteAnswer/:aid', deleteAnswer);

  return router;
};

export default answerController;
