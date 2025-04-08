import mongoose from 'mongoose';
import AnswerModel from '../../models/answers.model';
import QuestionModel from '../../models/questions.model';
import {
  saveAnswer,
  addAnswerToQuestion,
  deleteAnswerById,
  addVoteToAnswer,
} from '../../services/answer.service';
import { DatabaseAnswer, DatabaseQuestion, VoteResponse } from '../../types/types';
import { QUESTIONS, ans1, ans4 } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const mockAnswer = {
  text: 'This is a test answer',
  ansBy: 'dummyUserId',
  ansDateTime: new Date('2024-06-06'),
  comments: [],
  upVotes: [],
  downVotes: [],
};
const mockDBAnswer = {
  ...mockAnswer,
  _id: new mongoose.Types.ObjectId(),
};

describe('Answer model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveAnswer', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    test('saveAnswer should return the saved answer', async () => {
      mockingoose(AnswerModel, 'create').toReturn(mockDBAnswer);

      const result = (await saveAnswer(mockAnswer)) as DatabaseAnswer;

      expect(result._id).toBeDefined();
      expect(result.text).toEqual(mockAnswer.text);
      expect(result.ansBy).toEqual(mockAnswer.ansBy);
      expect(result.ansDateTime).toEqual(mockAnswer.ansDateTime);
      expect(result.upVotes).toEqual(mockAnswer.upVotes);
      expect(result.downVotes).toEqual(mockAnswer.downVotes);
    });

    test('saveAnswer should return an object with error if create throws an error', async () => {
      jest.spyOn(AnswerModel, 'create').mockRejectedValueOnce(new Error('error'));

      const result = await saveAnswer(mockAnswer);

      expect(result).toEqual({ error: 'Error when saving an answer' });
    });
  });

  describe('deleteAnswerById', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    test('deleteAnswerById should return the deleted answer', async () => {
      jest.spyOn(AnswerModel, 'findByIdAndDelete').mockResolvedValueOnce(mockDBAnswer);

      const result = await deleteAnswerById(mockDBAnswer._id.toString());

      expect(result).toMatchObject(mockDBAnswer);
    });

    test('deleteAnswerById should return an object with error if findByIdAndDelete throws an error', async () => {
      jest.spyOn(AnswerModel, 'findByIdAndDelete').mockRejectedValueOnce(new Error('error'));

      const result = await deleteAnswerById(mockDBAnswer._id.toString());

      expect(result).toEqual({ error: 'Error when deleting an answer' });
    });
  });

  describe('addAnswerToQuestion', () => {
    test('addAnswerToQuestion should return the updated question', async () => {
      const question: DatabaseQuestion = QUESTIONS.filter(
        q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
      )[0];

      jest
        .spyOn(QuestionModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...question, answers: [...question.answers, ans4._id] });

      const result = (await addAnswerToQuestion(
        '65e9b5a995b6c7045a30d823',
        ans4,
      )) as DatabaseQuestion;

      expect(result.answers.length).toEqual(4);
      expect(result.answers).toContain(ans4._id);
    });

    test('addAnswerToQuestion should return an object with error if findOneAndUpdate throws an error', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'findOneAndUpdate');

      const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

      expect(result).toHaveProperty('error');
    });

    test('addAnswerToQuestion should return an object with error if findOneAndUpdate returns null', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

      const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

      expect(result).toHaveProperty('error');
    });

    test('addAnswerToQuestion should throw an error if a required field is missing in the answer', async () => {
      const invalidAnswer: Partial<DatabaseAnswer> = {
        text: 'This is an answer text',
        ansBy: 'user123', // Missing ansDateTime
      };

      const qid = 'validQuestionId';

      expect(addAnswerToQuestion(qid, invalidAnswer as DatabaseAnswer)).resolves.toEqual({
        error: 'Error when adding answer to question',
      });
    });
  });

  describe('addVoteToAnswer', () => {
    test('addVoteToAnswer should add an upvote to the answer when the voteType is upvote', async () => {
      const voteType = 'upvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';

      const updatedAnswer = {
        ...mockDBAnswer,
        upVotes: [...mockDBAnswer.upVotes, username],
      };

      mockingoose(AnswerModel).toReturn(updatedAnswer, 'findOneAndUpdate');

      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);

      expect(result).toEqual({
        msg: 'Answer upvoted successfully',
        upVotes: [username],
        downVotes: [],
      });
    });

    test('addVoteToAnswer should add a downvote to the answer when the voteType is downvote', async () => {
      const voteType = 'downvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';

      const updatedAnswer = {
        ...mockDBAnswer,
        downVotes: [...mockDBAnswer.downVotes, username],
      };

      mockingoose(AnswerModel).toReturn(updatedAnswer, 'findOneAndUpdate');

      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);

      expect(result).toEqual({
        msg: 'Answer downvoted successfully',
        upVotes: [],
        downVotes: [username],
      });
    });

    test('addVoteToAnswer should remove an upvote from the answer when the user has already upvoted', async () => {
      const voteType = 'upvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';
      const updatedAnswer = {
        ...mockDBAnswer,
        upVotes: [],
      };
      mockingoose(AnswerModel).toReturn(updatedAnswer, 'findOneAndUpdate');
      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);
      expect(result).toEqual({
        msg: 'Upvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });

    test('addVoteToAnswer should remove a downvote from the answer when the user has already downvoted', async () => {
      const voteType = 'downvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';
      const updatedAnswer = {
        ...mockDBAnswer,
        downVotes: [],
      };
      mockingoose(AnswerModel).toReturn(updatedAnswer, 'findOneAndUpdate');
      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);
      expect(result).toEqual({
        msg: 'Downvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });

    test('addVoteToAnswer should return an error message if the answer is not found', async () => {
      const voteType = 'upvote';
      const aid = 'invalidAnswerId';
      const username = 'testUser';

      mockingoose(AnswerModel).toReturn(null, 'findOneAndUpdate');

      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);

      expect(result).toEqual({ error: 'Answer not found!' });
    });

    test('addVoteToAnswer should return an error object if an error occurs during the operation', async () => {
      const voteType = 'upvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';

      mockingoose(AnswerModel).toReturn(new Error('error'), 'findOneAndUpdate');
      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);

      expect(result).toEqual({
        error: 'Error when adding upvote to answer',
      });
    });

    test('addVoteToAnswer should return an error object if an error occurs during the downVote Type', async () => {
      const voteType = 'downvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';

      mockingoose(AnswerModel).toReturn(new Error('error'), 'findOneAndUpdate');
      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);

      expect(result).toEqual({
        error: 'Error when adding downvote to answer',
      });
    });

    test('addVoteToAnswer should return empty list when upVotes and downVotes are not defined', async () => {
      const mockResponse = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-06'),
        comments: [],
        upvotes: null,
        downvotes: undefined,
      };

      const voteType = 'upvote';
      const aid = mockDBAnswer._id.toString();
      const username = 'testUser';

      mockingoose(AnswerModel).toReturn(mockResponse, 'findOneAndUpdate');
      const result: VoteResponse = await addVoteToAnswer(aid, username, voteType);
      expect(result).toEqual({
        msg: 'Upvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });
  });
});
