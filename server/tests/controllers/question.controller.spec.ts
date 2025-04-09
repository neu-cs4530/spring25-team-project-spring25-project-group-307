import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as questionUtil from '../../services/question.service';
import * as tagUtil from '../../services/tag.service';
import * as userUtil from '../../services/user.service';
import * as databaseUtil from '../../utils/database.util';

import {
  Answer,
  DatabaseQuestion,
  DatabaseTag,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  Question,
  SafeDatabaseUser,
  Tag,
  VoteResponse,
} from '../../types/types';

import getUpdatedRank from '../../utils/userstat.util';
import UserModel from '../../models/users.model';
import grantAchievementToUser from '../../services/achievement.service';
import QuestionModel from '../../models/questions.model';

const addVoteToQuestionSpy = jest.spyOn(questionUtil, 'addVoteToQuestion');
const getQuestionsByOrderSpy: jest.SpyInstance = jest.spyOn(questionUtil, 'getQuestionsByOrder');
const filterQuestionsBySearchSpy: jest.SpyInstance = jest.spyOn(
  questionUtil,
  'filterQuestionsBySearch',
);
const getUserByUsernameSpy: jest.SpyInstance = jest.spyOn(userUtil, 'getUserByUsername');
const addReportToQuestionSpy: jest.SpyInstance = jest.spyOn(questionUtil, 'addReportToQuestion');
const removeReportFromQuestionSpy: jest.SpyInstance = jest.spyOn(
  questionUtil,
  'removeReportFromQuestion',
);

jest.mock('../../utils/userstat.util', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../services/achievement.service', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation((_id: string, achievement: string) => Promise.resolve(achievement)),
}));

const tag1: Tag = {
  name: 'tag1',
  description: 'tag1 description',
};

const dbTag1: DatabaseTag = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
  ...tag1,
};

const tag2: Tag = {
  name: 'tag2',
  description: 'tag2 description',
};

const dbTag2: DatabaseTag = {
  _id: new mongoose.Types.ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  ...tag2,
};

const mockQuestion: Question = {
  title: 'New Question Title',
  text: 'New Question Text',
  tags: [tag1, tag2],
  answers: [],
  askedBy: 'question3_user',
  askDateTime: new Date('2024-06-06'),
  views: [],
  upVotes: [],
  downVotes: [],
  comments: [],
  reportedBy: [],
};

const mockDatabaseQuestion: DatabaseQuestion = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6fe'),
  title: 'New Question Title',
  text: 'New Question Text',
  tags: [dbTag1._id, dbTag2._id],
  answers: [],
  askedBy: 'question3_user',
  askDateTime: new Date('2024-06-06'),
  views: [],
  upVotes: [],
  downVotes: [],
  comments: [],
  reportedBy: [],
};

const mockPopulatedQuestion: PopulatedDatabaseQuestion = {
  ...mockDatabaseQuestion,
  tags: [dbTag1, dbTag2],
  answers: [],
  comments: [],
};

const ans1: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'Answer 1 Text',
  ansBy: 'answer1_user',
  ansDateTime: new Date('2024-06-09'), // The mock date is string type but in the actual implementation it is a Date type
  comments: [],
  upVotes: [],
  downVotes: [],
};

const ans2: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'Answer 2 Text',
  ansBy: 'answer2_user',
  ansDateTime: new Date('2024-06-10'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

const ans3: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'Answer 3 Text',
  ansBy: 'answer3_user',
  ansDateTime: new Date('2024-06-11'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

const ans4: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'Answer 4 Text',
  ansBy: 'answer4_user',
  ansDateTime: new Date('2024-06-14'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

jest.mock('../../models/users.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockImplementation(({ username }) => {
      if (['new-user', 'some-user', 'original-author', 'question2_user'].includes(username)) {
        return {
          _id: new mongoose.Types.ObjectId('65e9b5a995b6c7045a30d823'),
          username,
          score: 10,
          ranking: 'Beginner',
          questionsAsked: 2,
          save: jest.fn().mockResolvedValue({}),
        };
      }
      return null;
    }),
    updateOne: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../models/questions.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn().mockResolvedValue({
      _id: '65e9b5a995b6c7045a30d823',
      askedBy: 'original-author',
      upVotes: [],
      downVotes: [],
      save: jest.fn().mockResolvedValue({}),
    }),
  },
}));

const MOCK_POPULATED_QUESTIONS: PopulatedDatabaseQuestion[] = [
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Question 1 Title',
    text: 'Question 1 Text',
    tags: [dbTag1],
    answers: [ans1],
    askedBy: 'question1_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new mongoose.Types.ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Question 2 Title',
    text: 'Question 2 Text',
    tags: [dbTag2],
    answers: [ans2, ans3],
    askedBy: 'question2_user',
    askDateTime: new Date('2024-06-04'),
    views: ['question1_user', 'question2_user', 'question3_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new mongoose.Types.ObjectId('34e9b58910afe6e94fc6e99f'),
    title: 'Question 3 Title',
    text: 'Question 3 Text',
    tags: [dbTag1, dbTag2],
    answers: [ans4],
    askedBy: 'question3_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question3_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
];

const simplifyQuestion = (question: PopulatedDatabaseQuestion) => ({
  ...question,
  _id: question._id.toString(), // Converting ObjectId to string
  tags: question.tags.map(tag => ({ ...tag, _id: tag._id.toString() })), // Converting tag ObjectId
  answers: question.answers.map(answer => ({
    ...answer,
    _id: answer._id.toString(),
    ansDateTime: (answer as Answer).ansDateTime.toISOString(),
  })), // Converting answer ObjectId
  askDateTime: question.askDateTime.toISOString(),
});

const simplifyDatabaseQuestion = (question: DatabaseQuestion) => ({
  ...question,
  _id: question._id.toString(), // Converting ObjectId to string
  tags: question.tags.map(tag => tag.toString()), // Converting tag ObjectId
  answers: question.answers.map(answer => answer.toString()), // Converting answer ObjectId
  comments: question.comments.map(comment => comment.toString()), // Converting comment ObjectId
  reportedBy: question.reportedBy.map(user => user.toString()), // Converting user ObjectId
  askDateTime: question.askDateTime.toISOString(),
});

const EXPECTED_QUESTIONS = MOCK_POPULATED_QUESTIONS.map(question => simplifyQuestion(question));

describe('Test questionController', () => {
  describe('POST /addQuestion', () => {
    it('should add a new question', async () => {
      jest.spyOn(tagUtil, 'processTags').mockResolvedValue([dbTag1, dbTag2]);
      jest.spyOn(questionUtil, 'saveQuestion').mockResolvedValueOnce(mockDatabaseQuestion);
      jest.spyOn(databaseUtil, 'populateDocument').mockResolvedValueOnce(mockPopulatedQuestion);

      // Making the request
      const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body.question).toEqual(simplifyQuestion(mockPopulatedQuestion));
      expect(response.body.unlockedAchievements).toEqual([]);
    });

    it('should return 500 if error occurs in `saveQuestion` while adding a new question', async () => {
      jest.spyOn(tagUtil, 'processTags').mockResolvedValue([dbTag1, dbTag2]);
      jest
        .spyOn(questionUtil, 'saveQuestion')
        .mockResolvedValueOnce({ error: 'Error while saving question' });

      // Making the request
      const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

      // Asserting the response
      expect(response.status).toBe(500);
    });

    it('should return 500 if error occurs in `saveQuestion` while adding a new question', async () => {
      jest.spyOn(tagUtil, 'processTags').mockResolvedValue([dbTag1, dbTag2]);
      jest.spyOn(questionUtil, 'saveQuestion').mockResolvedValueOnce(mockDatabaseQuestion);
      jest
        .spyOn(databaseUtil, 'populateDocument')
        .mockResolvedValueOnce({ error: 'Error while populating' });

      // Making the request
      const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

      // Asserting the response
      expect(response.status).toBe(500);
    });

    it('should return 500 if tag ids could not be retrieved', async () => {
      jest.spyOn(tagUtil, 'processTags').mockResolvedValue([]);

      // Making the request
      const response = await supertest(app).post('/question/addQuestion').send(mockQuestion);

      // Asserting the response
      expect(response.status).toBe(500);
    });

    it('should return bad request if question title is empty string', async () => {
      // Making the request
      const response = await supertest(app)
        .post('/question/addQuestion')
        .send({ ...mockQuestion, title: '' });

      // Asserting the response
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid question body');
    });

    it('should return bad request if question text is empty string', async () => {
      // Making the request
      const response = await supertest(app)
        .post('/question/addQuestion')
        .send({ ...mockQuestion, text: '' });

      // Asserting the response
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid question body');
    });

    it('should return bad request if tags are empty', async () => {
      // Making the request
      const response = await supertest(app)
        .post('/question/addQuestion')
        .send({ ...mockQuestion, tags: [] });

      // Asserting the response
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid question body');
    });

    it('should return bad request if askedBy is empty string', async () => {
      // Making the request
      const response = await supertest(app)
        .post('/question/addQuestion')
        .send({ ...mockQuestion, askedBy: '' });

      // Asserting the response
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid question body');
    });

    it('should ensure only unique tags are added', async () => {
      // Mock request body with duplicate tags
      const mockQuestionDuplicates: Question = {
        // _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6fe'),
        title: 'New Question Title',
        text: 'New Question Text',
        tags: [dbTag1, dbTag1, dbTag2, dbTag2], // Duplicate tags
        answers: [],
        askedBy: 'question3_user',
        askDateTime: new Date('2024-06-06'),
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        reportedBy: [],
      };

      const result: PopulatedDatabaseQuestion = {
        ...mockQuestionDuplicates,
        _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6fe'),
        tags: [dbTag1, dbTag2], // Duplicate tags
        answers: [],
        comments: [],
      };

      // Set up the mock to resolve with unique tags
      jest.spyOn(tagUtil, 'processTags').mockResolvedValue([dbTag1, dbTag2]);
      jest.spyOn(questionUtil, 'saveQuestion').mockResolvedValueOnce({
        ...result,
        tags: [dbTag1._id, dbTag2._id], // Ensure only unique tags are saved,
        answers: [],
        comments: [],
      });

      jest.spyOn(databaseUtil, 'populateDocument').mockResolvedValueOnce(result);

      // Making the request
      const response = await supertest(app)
        .post('/question/addQuestion')
        .send(mockQuestionDuplicates);

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body.question).toEqual(simplifyQuestion(mockPopulatedQuestion));
      expect(response.body.unlockedAchievements).toEqual([]);
    });
  });

  describe('POST /upvoteQuestion', () => {
    it('should upvote a question successfully', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
        username: 'new-user',
      };

      const mockResponse = {
        msg: 'Question upvoted successfully',
        upVotes: ['new-user'],
        downVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/question/upvoteQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.status).toBe(200);
      expect(response.body.answer.upVotes).toContain('new-user'); // or appropriate username
    });

    it('should cancel the upvote successfully', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
        username: 'some-user',
      };

      const mockFirstResponse = {
        msg: 'Question upvoted successfully',
        upVotes: ['some-user'],
        downVotes: [],
      };

      const mockSecondResponse = {
        msg: 'Upvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockFirstResponse);

      const firstResponse = await supertest(app).post('/question/upvoteQuestion').send(mockReqBody);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.answer.upVotes).toContain('some-user'); // or appropriate username

      addVoteToQuestionSpy.mockResolvedValueOnce(mockSecondResponse);

      const secondResponse = await supertest(app)
        .post('/question/upvoteQuestion')
        .send(mockReqBody);
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.answer).toBeDefined();
      expect(secondResponse.body.answer.upVotes).toEqual([]);
      expect(secondResponse.body.unlockedAchievements).toEqual(expect.any(Array));
    });

    it('should handle upvote and then downvote by the same user', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
        username: 'new-user',
      };

      // First upvote the question
      let mockResponseWithBothVotes: VoteResponse = {
        msg: 'Question upvoted successfully',
        upVotes: ['new-user'],
        downVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockResponseWithBothVotes);

      let response = await supertest(app).post('/question/upvoteQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.answer.upVotes).toContain('new-user');

      // Now downvote the question
      mockResponseWithBothVotes = {
        msg: 'Question downvoted successfully',
        downVotes: ['new-user'],
        upVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockResponseWithBothVotes);

      response = await supertest(app).post('/question/downvoteQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.answer).toBeDefined();
      expect(response.body.answer.upVotes).toEqual([]);
      expect(response.body.unlockedAchievements).toEqual(expect.any(Array));
    });

    it('should return bad request error if the request had qid missing', async () => {
      const mockReqBody = {
        username: 'some-user',
      };

      const response = await supertest(app).post(`/question/upvoteQuestion`).send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return bad request error if the request had username missing', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
      };

      const response = await supertest(app).post(`/question/upvoteQuestion`).send(mockReqBody);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /downvoteQuestion', () => {
    it('should downvote a question successfully', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
        username: 'new-user',
      };

      const mockResponse = {
        msg: 'Question upvoted successfully',
        downVotes: ['new-user'],
        upVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/question/downvoteQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.answer).toBeDefined();
      expect(response.body.unlockedAchievements).toEqual(expect.any(Array));
    });

    it('should cancel the downvote successfully', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
        username: 'some-user',
      };

      const mockFirstResponse = {
        msg: 'Question downvoted successfully',
        upVotes: [],
        downVotes: ['some-user'],
      };

      const mockSecondResponse = {
        msg: 'Dwonvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockFirstResponse);

      const firstResponse = await supertest(app)
        .post('/question/downvoteQuestion')
        .send(mockReqBody);
      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.unlockedAchievements).toEqual(expect.any(Array));

      addVoteToQuestionSpy.mockResolvedValueOnce(mockSecondResponse);

      const secondResponse = await supertest(app)
        .post('/question/downvoteQuestion')
        .send(mockReqBody);

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.answer).toBeDefined();
      expect(secondResponse.body.unlockedAchievements).toEqual(expect.any(Array));
    });

    it('should handle downvote and then upvote by the same user', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
        username: 'new-user',
      };

      // First downvote the question
      let mockResponse: VoteResponse = {
        msg: 'Question downvoted successfully',
        downVotes: ['new-user'],
        upVotes: [],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockResponse);

      let response = await supertest(app).post('/question/downvoteQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.answer).toBeDefined();
      expect(response.body.unlockedAchievements).toEqual(expect.any(Array));

      // Then upvote the question
      mockResponse = {
        msg: 'Question upvoted successfully',
        downVotes: [],
        upVotes: ['new-user'],
      };

      addVoteToQuestionSpy.mockResolvedValueOnce(mockResponse);

      response = await supertest(app).post('/question/upvoteQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.answer).toBeDefined();
      expect(response.body.answer.upVotes).toContain('new-user'); // or appropriate username
      expect(response.body.unlockedAchievements).toEqual(expect.any(Array));
    });

    it('should return bad request error if the request had qid missing', async () => {
      const mockReqBody = {
        username: 'some-user',
      };

      const response = await supertest(app).post(`/question/downvoteQuestion`).send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return bad request error if the request had username missing', async () => {
      const mockReqBody = {
        qid: '65e9b5a995b6c7045a30d823',
      };

      const response = await supertest(app).post(`/question/downvoteQuestion`).send(mockReqBody);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /getQuestionById/:qid', () => {
    it('should return a question object in the response when the question id is passed as request parameter', async () => {
      // Mock request parameters
      const mockReqParams = {
        qid: '65e9b5a995b6c7045a30d823',
      };
      const mockReqQuery = {
        username: 'question3_user',
      };

      const populatedFindQuestion = MOCK_POPULATED_QUESTIONS.filter(
        q => q._id.toString() === mockReqParams.qid,
      )[0];

      // Provide mock question data
      jest
        .spyOn(questionUtil, 'fetchAndIncrementQuestionViewsById')
        .mockResolvedValueOnce(populatedFindQuestion);

      // Making the request
      const response = await supertest(app).get(
        `/question/getQuestionById/${mockReqParams.qid}?username=${mockReqQuery.username}`,
      );

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyQuestion(populatedFindQuestion));
    });

    it('should not return a question object with a duplicated user in the views if the user is viewing the same question again', async () => {
      // Mock request parameters
      const mockReqParams = {
        qid: '65e9b5a995b6c7045a30d823',
      };
      const mockReqQuery = {
        username: 'question2_user',
      };

      const populatedFindQuestion = MOCK_POPULATED_QUESTIONS.filter(
        q => q._id.toString() === mockReqParams.qid,
      )[0];

      // Provide mock question data
      jest
        .spyOn(questionUtil, 'fetchAndIncrementQuestionViewsById')
        .mockResolvedValueOnce(populatedFindQuestion);

      // Making the request
      const response = await supertest(app).get(
        `/question/getQuestionById/${mockReqParams.qid}?username=${mockReqQuery.username}`,
      );

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyQuestion(populatedFindQuestion));
    });

    it('should return bad request error if the question id is not in the correct format', async () => {
      // Mock request parameters
      const mockReqParams = {
        qid: 'invalid id',
      };
      const mockReqQuery = {
        username: 'question2_user',
      };

      // Making the request
      const response = await supertest(app).get(
        `/question/getQuestionById/${mockReqParams.qid}?username=${mockReqQuery.username}`,
      );

      // Asserting the response
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid ID format');
    });

    it('should return bad request error if the username is not provided', async () => {
      // Mock request parameters
      const mockReqParams = {
        qid: '65e9b5a995b6c7045a30d823',
      };

      // Making the request
      const response = await supertest(app).get(`/question/getQuestionById/${mockReqParams.qid}`);

      // Asserting the response
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid username requesting question.');
    });

    it('should return database error if the question id is not found in the database', async () => {
      // Mock request parameters
      const mockReqParams = {
        qid: '65e9b5a995b6c7045a30d823',
      };
      const mockReqQuery = {
        username: 'question2_user',
      };

      jest
        .spyOn(questionUtil, 'fetchAndIncrementQuestionViewsById')
        .mockResolvedValueOnce({ error: 'Failed to get question.' });

      // Making the request
      const response = await supertest(app).get(
        `/question/getQuestionById/${mockReqParams.qid}?username=${mockReqQuery.username}`,
      );

      // Asserting the response
      expect(response.status).toBe(500);
      expect(response.text).toBe(
        'Error when fetching question by id: Error while fetching question by id',
      );
    });

    it('should return bad request error if an error occurs when fetching and updating the question', async () => {
      // Mock request parameters
      const mockReqParams = {
        qid: '65e9b5a995b6c7045a30d823',
      };
      const mockReqQuery = {
        username: 'question2_user',
      };

      jest
        .spyOn(questionUtil, 'fetchAndIncrementQuestionViewsById')
        .mockResolvedValueOnce({ error: 'Error when fetching and updating a question' });

      // Making the request
      const response = await supertest(app).get(
        `/question/getQuestionById/${mockReqParams.qid}?username=${mockReqQuery.username}`,
      );

      // Asserting the response
      expect(response.status).toBe(500);
      expect(response.text).toBe(
        'Error when fetching question by id: Error while fetching question by id',
      );
    });
  });

  describe('GET /getQuestion', () => {
    it('should return the result of filterQuestionsBySearch as response even if request parameters of order and search are absent', async () => {
      getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_POPULATED_QUESTIONS);
      filterQuestionsBySearchSpy.mockReturnValueOnce(MOCK_POPULATED_QUESTIONS);
      // Making the request
      const response = await supertest(app).get('/question/getQuestion');

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(EXPECTED_QUESTIONS);
    });

    it('should return the result of filterQuestionsBySearch as response for an order and search criteria in the request parameters', async () => {
      // Mock request query parameters
      const mockReqQuery = {
        order: 'dummyOrder',
        search: 'dummySearch',
      };

      getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_POPULATED_QUESTIONS);
      filterQuestionsBySearchSpy.mockReturnValueOnce(MOCK_POPULATED_QUESTIONS);

      // Making the request
      const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual(EXPECTED_QUESTIONS);
    });

    it('should return error if getQuestionsByOrder throws an error', async () => {
      // Mock request query parameters
      const mockReqQuery = {
        order: 'dummyOrder',
        search: 'dummySearch',
      };
      getQuestionsByOrderSpy.mockRejectedValueOnce(new Error('Error fetching questions'));
      // Making the request
      const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

      // Asserting the response
      expect(response.status).toBe(500);
    });

    it('should return error if filterQuestionsBySearch throws an error', async () => {
      // Mock request query parameters
      const mockReqQuery = {
        order: 'dummyOrder',
        search: 'dummySearch',
      };
      getQuestionsByOrderSpy.mockResolvedValueOnce(MOCK_POPULATED_QUESTIONS);
      filterQuestionsBySearchSpy.mockImplementationOnce(() => {
        throw new Error('Error filtering questions');
      });
      // Making the request
      const response = await supertest(app).get('/question/getQuestion').query(mockReqQuery);

      // Asserting the response
      expect(response.status).toBe(500);
    });
  });

  describe('POST /addReportToQuestion', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should add a report to a question successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser: SafeDatabaseUser = {
        _id: userId,
        username: 'guest',
        dateJoined: new Date(),
        ranking: '',
        score: 0,
        achievements: [],
        questionsAsked: 0,
        responsesGiven: 0,
        commentsMade: 0,
        savedQuestions: [],
        nimGameWins: 0,
        upVotesGiven: 0,
        downVotesGiven: 0,
      };

      const question = mockDatabaseQuestion;

      const mockResponse = {
        ...question,
        askDateTime: question.askDateTime,
        reportedBy: [userId],
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUser);
      addReportToQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .post(`/question/addReportToQuestion/${question._id.toString()}`)
        .send({ username: mockUser.username });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyDatabaseQuestion(mockResponse));
    });

    it('should return bad request error if the request had qid missing', async () => {
      const mockReqBody = {
        username: 'some-user',
      };

      const response = await supertest(app).post(`/question/addReportToQuestion`).send(mockReqBody);

      expect(response.status).toBe(404);
    });

    it('should return bad request error if the request had username missing', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {};

      const response = await supertest(app)
        .post(`/question/addReportToQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(400);
    });
    it('should return error if getUserByUsername throws an error', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'some-user',
      };

      getUserByUsernameSpy.mockRejectedValueOnce(new Error('Error fetching user'));

      const response = await supertest(app)
        .post(`/question/addReportToQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });
    it('should return error if addReportToQuestion throws an error', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'guest',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({});
      addReportToQuestionSpy.mockRejectedValueOnce(new Error('Error adding report'));

      const response = await supertest(app)
        .post(`/question/addReportToQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });
    it('should return error if the question is not found', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'guest',
      };

      const mockUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'guest',
        dateJoined: new Date(),
        ranking: '',
        score: 0,
        achievements: [],
        questionsAsked: 0,
        responsesGiven: 0,
        commentsMade: 0,
        savedQuestions: [],
        nimGameWins: 0,
        upVotesGiven: 0,
        downVotesGiven: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUser);
      addReportToQuestionSpy.mockResolvedValueOnce({ error: 'Question not found' });

      const response = await supertest(app)
        .post(`/question/addReportToQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when reporting question: Question not found');
    });
    it('should return error if the user is not found', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'some-user',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'User not found' });

      const response = await supertest(app)
        .post(`/question/addReportToQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when reporting question: User not found');
    });
  });
  describe('POST /removeReportFromQuestion', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should remove a report from a question successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser: SafeDatabaseUser = {
        _id: userId,
        username: 'guest',
        dateJoined: new Date(),
        ranking: '',
        score: 0,
        achievements: [],
        questionsAsked: 0,
        responsesGiven: 0,
        commentsMade: 0,
        savedQuestions: [],
        nimGameWins: 0,
        upVotesGiven: 0,
        downVotesGiven: 0,
      };

      const question = mockDatabaseQuestion;

      const mockResponse = {
        ...question,
        askDateTime: question.askDateTime,
        reportedBy: [],
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUser);
      removeReportFromQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion/${question._id.toString()}`)
        .send({ username: mockUser.username });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(simplifyDatabaseQuestion(mockResponse));
    });
    it('should return bad request error if the request had qid missing', async () => {
      const mockReqBody = {
        username: 'some-user',
      };
      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion`)
        .send(mockReqBody);
      expect(response.status).toBe(404);
    });
    it('should return bad request error if the request had username missing', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {};
      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion/${qid.toString()}`)
        .send(mockReqBody);
      expect(response.status).toBe(400);
    });
    it('should return error if getUserByUsername throws an error', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'some-user',
      };

      getUserByUsernameSpy.mockRejectedValueOnce(new Error('Error fetching user'));

      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });
    it('should return error if removeReportFromQuestion throws an error', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'guest',
      };

      getUserByUsernameSpy.mockResolvedValueOnce({});
      removeReportFromQuestionSpy.mockRejectedValueOnce(new Error('Error removing report'));

      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
    });
    it('should return error if the question is not found', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'guest',
      };

      const mockUser: SafeDatabaseUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'guest',
        dateJoined: new Date(),
        ranking: '',
        score: 0,
        achievements: [],
        questionsAsked: 0,
        responsesGiven: 0,
        commentsMade: 0,
        savedQuestions: [],
        nimGameWins: 0,
        upVotesGiven: 0,
        downVotesGiven: 0,
      };

      getUserByUsernameSpy.mockResolvedValueOnce(mockUser);
      removeReportFromQuestionSpy.mockResolvedValueOnce({ error: 'Question not found' });

      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion/${qid.toString()}`)
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when removing report from question: Question not found');
    });
    it('should return error if the user is not found', async () => {
      const qid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: 'some-user',
      };
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'User not found' });
      const response = await supertest(app)
        .post(`/question/removeReportFromQuestion/${qid.toString()}`)
        .send(mockReqBody);
      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when removing report from question: User not found');
    });
  });
});

const ASCENSION_CASES = [
  {
    currentRank: 'Newcomer Newbie',
    newRank: 'Common Contributor',
    achievement: 'Ascension I',
    score: 100,
  },
  {
    currentRank: 'Common Contributor',
    newRank: 'Skilled Solver',
    achievement: 'Ascension II',
    score: 200,
  },
  {
    currentRank: 'Skilled Solver',
    newRank: 'Expert Explorer',
    achievement: 'Ascension III',
    score: 300,
  },
  {
    currentRank: 'Expert Explorer',
    newRank: 'Mentor Maven',
    achievement: 'Ascension IV',
    score: 400,
  },
  {
    currentRank: 'Mentor Maven',
    newRank: 'Master Maverick',
    achievement: 'Ascension V',
    score: 500,
  },
];

it('should unlock Curious Thinker when user asks their 5th question', async () => {
  const userId = new mongoose.Types.ObjectId();
  const qid = new mongoose.Types.ObjectId();
  const username = 'question-streaker';

  const mockReqBody = {
    title: 'Another Great Question',
    text: 'Why do birds suddenly appear?',
    tags: [{ name: 'biology', description: 'bird stuff' }],
    askedBy: username,
    askDateTime: new Date(),
    views: [],
    upVotes: [],
    downVotes: [],
    answers: [],
    comments: [],
    reportedBy: [],
  };

  const dbTag = {
    _id: new mongoose.Types.ObjectId(),
    name: 'biology',
    description: 'bird stuff',
  };

  jest.spyOn(tagUtil, 'processTags').mockResolvedValueOnce([dbTag]);

  jest.spyOn(questionUtil, 'saveQuestion').mockResolvedValueOnce({
    ...mockReqBody,
    _id: qid,
    tags: [dbTag._id],
  });

  jest.spyOn(databaseUtil, 'populateDocument').mockResolvedValueOnce({
    ...mockReqBody,
    _id: qid,
    tags: [dbTag],
    answers: [],
    comments: [],
  });

  jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce({
    _id: userId,
    username,
    score: 80,
    ranking: 'Skilled Solver',
    questionsAsked: 4, // This is the trigger point for "Curious Thinker"
  });

  jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
    acknowledged: true,
    matchedCount: 1,
    modifiedCount: 1,
    upsertedCount: 0,
    upsertedId: null,
  });

  (getUpdatedRank as jest.Mock).mockReturnValue('Skilled Solver');
  (grantAchievementToUser as jest.Mock).mockImplementation((_id, ach) => Promise.resolve(ach));

  const response = await supertest(app).post('/question/addQuestion').send(mockReqBody);

  expect(response.status).toBe(200);
  expect(response.body.unlockedAchievements).toContain('Curious Thinker');
  expect(grantAchievementToUser).toHaveBeenCalledWith(userId.toString(), 'Curious Thinker');
});

describe('DELETE /question/deleteQuestion/:qid', () => {
  const validQid = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a question successfully', async () => {
    const mockDeleted: DatabaseQuestion = {
      _id: new mongoose.Types.ObjectId('65e9b5a995b6c7045a30d823'),
      title: 'Deleted Question',
      text: 'This question has been deleted.',
      tags: [],
      answers: [],
      comments: [],
      reportedBy: [],
      askedBy: 'test-user',
      askDateTime: new Date('2024-06-06'),
      views: [],
      upVotes: [],
      downVotes: [],
    };

    jest.spyOn(questionUtil, 'deleteQuestionById').mockResolvedValueOnce(mockDeleted);

    const response = await supertest(app).delete(`/question/deleteQuestion/${validQid}`);

    expect(response.status).toBe(200);
  });

  it('should return 400 for invalid qid format', async () => {
    const invalidQid = 'not-a-valid-object-id';

    const response = await supertest(app).delete(`/question/deleteQuestion/${invalidQid}`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid ID format');
  });

  it('should return 500 if deleteQuestionById returns an error', async () => {
    jest
      .spyOn(questionUtil, 'deleteQuestionById')
      .mockResolvedValueOnce({ error: 'Question not found' });

    const response = await supertest(app).delete(`/question/deleteQuestion/${validQid}`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when deleting question');
  });

  it('should return 500 if an unexpected error occurs', async () => {
    jest.spyOn(questionUtil, 'deleteQuestionById').mockRejectedValueOnce(new Error('Boom'));

    const response = await supertest(app).delete(`/question/deleteQuestion/${validQid}`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when deleting question');
  });
});

describe('POST /question/upvoteQuestion + downvoteQuestion', () => {
  const qid = new mongoose.Types.ObjectId();
  const uid = new mongoose.Types.ObjectId();
  const username = 'voter-user';
  const questionAuthor = 'author-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = (name: string, score = 50, rank = 'Newcomer Newbie', up = 0, down = 0) => ({
    _id: uid,
    username: name,
    score,
    ranking: rank,
    upVotesGiven: up,
    downVotesGiven: down,
    save: jest.fn(),
    equals: (id: mongoose.Types.ObjectId) => id.equals(uid),
  });

  it('should handle first time upvote and unlock Ascension I for self-vote rank-up', async () => {
    const user = mockUser(username, 95, 'Newcomer Newbie', 4, 0);
    const updatedRank = 'Common Contributor';

    jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce({
      ...mockQuestion,
      askedBy: username, // self-vote
      upVotes: [],
      downVotes: [],
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(user) // voter
      .mockResolvedValueOnce(user); // recipient (same)

    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'Question upvoted successfully',
      upVotes: [username],
      downVotes: [],
    });

    (getUpdatedRank as jest.Mock).mockReturnValueOnce(updatedRank);

    const res = await supertest(app).post('/question/upvoteQuestion').send({
      qid: qid.toString(),
      username,
    });

    expect(res.status).toBe(200);
    expect(res.body.unlockedAchievements).toContain('Ascension I');
    expect(res.body.unlockedAchievements).toContain('Diligent Reviewer');
  });

  it('should handle upvote cancellation and revert scores', async () => {
    const voter = mockUser(username, 60, 'Common Contributor', 5, 0);
    const recipient = mockUser(questionAuthor, 80, 'Common Contributor');

    jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce({
      ...mockQuestion,
      upVotes: [username],
      downVotes: [],
    });

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);

    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'Upvote cancelled successfully',
      upVotes: [],
      downVotes: [],
    });

    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Common Contributor');
    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Common Contributor');

    const res = await supertest(app).post('/question/upvoteQuestion').send({
      qid: qid.toString(),
      username,
    });

    expect(res.status).toBe(200);
    expect(res.body.unlockedAchievements).toEqual(expect.any(Array));
  });

  it('should switch downvote to upvote and unlock Diligent Reviewer at 5 upvotes', async () => {
    const voter = mockUser(username, 90, 'Skilled Solver', 4, 1);
    const recipient = mockUser(questionAuthor, 90, 'Skilled Solver');

    jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce({
      ...mockQuestion,
      upVotes: [],
      downVotes: [username],
    });

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);

    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'Question upvoted successfully',
      upVotes: [username],
      downVotes: [],
    });

    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Skilled Solver');
    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Skilled Solver');

    const res = await supertest(app).post('/question/upvoteQuestion').send({
      qid: qid.toString(),
      username,
    });

    expect(res.status).toBe(200);
    expect(res.body.unlockedAchievements).toContain('Diligent Reviewer');
  });

  it('should handle invalid qid or username', async () => {
    const res = await supertest(app).post('/question/upvoteQuestion').send({ username });
    expect(res.status).toBe(400);

    const res2 = await supertest(app).post('/question/upvoteQuestion').send({ qid });
    expect(res2.status).toBe(400);
  });

  it('should return 404 if question not found', async () => {
    jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(null);
    const res = await supertest(app).post('/question/upvoteQuestion').send({ qid, username });
    expect(res.status).toBe(404);
  });

  it('should return 404 if user not found', async () => {
    jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(mockQuestion);
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);
    const res = await supertest(app).post('/question/upvoteQuestion').send({ qid, username });
    expect(res.status).toBe(404);
  });
});

it('should return 500 if addVoteToQuestion returns an error', async () => {
  const qid = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  const username = 'voter-user';

  const mockVoter = {
    _id: userId,
    username,
    score: 50,
    ranking: 'Newcomer Newbie',
    upVotesGiven: 0,
    downVotesGiven: 0,
    save: jest.fn(),
    equals: (id: mongoose.Types.ObjectId) => id.equals(userId),
  };

  const mockRecipient = {
    _id: new mongoose.Types.ObjectId(),
    username: 'recipient-user',
    score: 50,
    ranking: 'Newcomer Newbie',
    upVotesGiven: 0,
    downVotesGiven: 0,
    save: jest.fn(),
    equals: () => false,
  };

  jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(mockQuestion);

  jest
    .spyOn(UserModel, 'findOne')
    .mockResolvedValueOnce(mockVoter) // voter
    .mockResolvedValueOnce(mockRecipient); // recipient

  jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
    error: 'Simulated voting failure',
  });

  const res = await supertest(app).post('/question/upvoteQuestion').send({
    qid: qid.toString(),
    username,
  });

  expect(res.status).toBe(500);
  expect(res.text).toContain('Simulated voting failure');
});

describe('POST /question/downvoteQuestion', () => {
  const qid = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  const mockReqBody = { qid: qid.toString(), username: 'voter-user' };

  const createMockUser = (overrides = {}) => ({
    _id: userId,
    username: 'voter-user',
    score: 100,
    ranking: 'Common Contributor',
    upVotesGiven: 1,
    downVotesGiven: 0,
    save: jest.fn(),
    equals: (id: mongoose.Types.ObjectId) => id.equals(userId),
    ...overrides,
  });

  beforeEach(() => {
    (getUpdatedRank as jest.Mock).mockReturnValue('Common Contributor');
    (grantAchievementToUser as jest.Mock).mockImplementation((_id, ach) => Promise.resolve(ach));
    jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });
  });

  it('handles first-time downvote', async () => {
    const question = {
      _id: qid,
      askedBy: 'recipient-user',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    };

    const voter = createMockUser();
    const recipient = createMockUser({
      username: 'recipient-user',
      _id: new mongoose.Types.ObjectId(),
    });

    jest.spyOn(QuestionModel, 'findById').mockResolvedValue(question as Partial<DatabaseQuestion>);
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);
    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'downvote successful',
      upVotes: [],
      downVotes: ['voter-user'],
    });

    const response = await supertest(app).post('/question/downvoteQuestion').send(mockReqBody);
    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toContain('voter-user');
  });

  it('cancels a previous downvote', async () => {
    const question = {
      _id: qid,
      askedBy: 'recipient-user',
      upVotes: [],
      downVotes: ['voter-user'],
      save: jest.fn(),
    };

    const voter = createMockUser({ downVotesGiven: 1 });
    const recipient = createMockUser({
      username: 'recipient-user',
      _id: new mongoose.Types.ObjectId(),
    });

    jest.spyOn(QuestionModel, 'findById').mockResolvedValue(question as Partial<DatabaseQuestion>);
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);
    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'downvote cancelled successfully',
      upVotes: [],
      downVotes: [],
    });

    const response = await supertest(app).post('/question/downvoteQuestion').send(mockReqBody);
    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toEqual([]);
  });

  it('handles switching from upvote to downvote', async () => {
    const question = {
      _id: qid,
      askedBy: 'recipient-user',
      upVotes: ['voter-user'],
      downVotes: [],
      save: jest.fn(),
    };

    const voter = createMockUser({ upVotesGiven: 1, downVotesGiven: 0 });
    const recipient = createMockUser({
      username: 'recipient-user',
      _id: new mongoose.Types.ObjectId(),
    });

    jest.spyOn(QuestionModel, 'findById').mockResolvedValue(question as Partial<DatabaseQuestion>);
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);
    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'downvoted successfully',
      upVotes: [],
      downVotes: ['voter-user'],
    });

    const response = await supertest(app).post('/question/downvoteQuestion').send(mockReqBody);
    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toContain('voter-user');
    expect(response.body.answer.upVotes).toEqual([]);
  });
});

describe.each(ASCENSION_CASES)(
  'Rank transition for upvote',
  ({ currentRank: from, newRank: to, achievement }) => {
    it(`should unlock ${achievement} for voter rank-up`, async () => {
      const qid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      const mockReq = { qid: qid.toString(), username: 'voter-user' };

      // Question initially with no votes
      jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce({
        _id: qid,
        askedBy: 'recipient-user',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      const mockVoter = {
        _id: voterId,
        username: 'voter-user',
        score: 94,
        ranking: from,
        upVotesGiven: 4,
        downVotesGiven: 0,
        save: jest.fn(),
        equals: (id: mongoose.Types.ObjectId) => id.equals(voterId),
      };

      const mockRecipient = {
        _id: recipientId,
        username: 'recipient-user',
        score: 100,
        ranking: 'Skilled Solver',
        save: jest.fn(),
        equals: (id: mongoose.Types.ObjectId) => id.equals(recipientId),
      };

      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockVoter)
        .mockResolvedValueOnce(mockRecipient);

      jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });

      jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
        msg: 'upvote successful',
        upVotes: ['voter-user'],
        downVotes: [],
      });

      (getUpdatedRank as jest.Mock).mockReturnValueOnce(to); // new rank for voter
      (getUpdatedRank as jest.Mock).mockReturnValueOnce('Skilled Solver'); // same for recipient

      const response = await supertest(app).post('/question/upvoteQuestion').send(mockReq);

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(voterId.toString(), achievement);
    });

    it(`should unlock ${achievement} for recipient rank-up`, async () => {
      const qid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      const mockReq = { qid: qid.toString(), username: 'voter-user' };

      // Question initially with no votes
      jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce({
        _id: qid,
        askedBy: 'recipient-user',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      const mockVoter = {
        _id: voterId,
        username: 'voter-user',
        score: 100,
        ranking: 'Skilled Solver',
        upVotesGiven: 4,
        downVotesGiven: 0,
        save: jest.fn(),
        equals: (id: mongoose.Types.ObjectId) => id.equals(voterId),
      };

      const mockRecipient = {
        _id: recipientId,
        username: 'recipient-user',
        score: 94,
        ranking: from,
        save: jest.fn(),
        equals: (id: mongoose.Types.ObjectId) => id.equals(recipientId),
      };

      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockVoter)
        .mockResolvedValueOnce(mockRecipient);

      jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });

      jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
        msg: 'upvote successful',
        upVotes: ['voter-user'],
        downVotes: [],
      });

      (getUpdatedRank as jest.Mock).mockReturnValueOnce('Skilled Solver'); // voter stays same
      (getUpdatedRank as jest.Mock).mockReturnValueOnce(to); // recipient ranks up

      const response = await supertest(app).post('/question/upvoteQuestion').send(mockReq);

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(recipientId.toString(), achievement);
    });
  },
);

describe.each([
  { currentRank: 'Common Contributor', newRank: 'Skilled Solver', achievement: 'Ascension II' },
  { currentRank: 'Skilled Solver', newRank: 'Expert Explorer', achievement: 'Ascension III' },
  { currentRank: 'Expert Explorer', newRank: 'Mentor Maven', achievement: 'Ascension IV' },
  { currentRank: 'Mentor Maven', newRank: 'Master Maverick', achievement: 'Ascension V' },
])('Self-vote rank-up: $currentRank → $newRank', ({ currentRank, newRank, achievement }) => {
  it(`should grant ${achievement} when voter self-upvotes to reach ${newRank}`, async () => {
    const qid = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const mockReqBody = {
      qid: qid.toString(),
      username: 'self-voter',
    };

    const mockUser = {
      _id: userId,
      username: 'self-voter',
      score: 95, // Initial score, will reach threshold after delta
      ranking: currentRank,
      upVotesGiven: 4,
      downVotesGiven: 0,
      save: jest.fn(),
      equals: (id: mongoose.Types.ObjectId) => id.equals(userId),
    };

    // Mocks
    jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(mockQuestion);
    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(mockUser) // voter
      .mockResolvedValueOnce(mockUser); // recipient (same as voter)
    jest.spyOn(questionUtil, 'addVoteToQuestion').mockResolvedValueOnce({
      msg: 'upvote successful',
      upVotes: ['self-voter'],
      downVotes: [],
    });

    // Mock rank change
    (getUpdatedRank as jest.Mock).mockReturnValueOnce(newRank);
    (grantAchievementToUser as jest.Mock).mockImplementation((_id, ach) => Promise.resolve(ach));

    const response = await supertest(app).post('/question/upvoteQuestion').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body.unlockedAchievements).toContain(achievement);
    expect(grantAchievementToUser).toHaveBeenCalledWith(expect.any(String), achievement);
  });
});

describe('GET /question/getCommunityQuestion/:qid', () => {
  it('should return community info if successful', async () => {
    jest.spyOn(questionUtil, 'getCommunityQuestion').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      title: 'Test Community',
      description: 'A test community',
      isPrivate: false,
      admins: [],
      moderators: [],
      members: [],
      questions: [],
      pinnedQuestions: [],
      tags: [],
    });

    const res = await supertest(app).get('/question/getCommunityQuestion/qid1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Community');
  });

  it('should return 500 if service throws error', async () => {
    jest.spyOn(questionUtil, 'getCommunityQuestion').mockResolvedValueOnce({ error: 'DB error' });

    const res = await supertest(app).get('/question/getCommunityQuestion/qid1');
    expect(res.status).toBe(500);
    expect(res.text).toMatch(/Error when getting community question/);
  });
});

describe.each(ASCENSION_CASES)(
  'Rank transition from $currentRank to $newRank',
  ({ currentRank, newRank, achievement, score }) => {
    it(`should unlock ${achievement} when score increases to reach ${newRank}`, async () => {
      const userId = new mongoose.Types.ObjectId();
      const qid = new mongoose.Types.ObjectId();
      const username = 'rank-user';

      const mockReqBody = {
        title: 'Test Title',
        text: 'Test Text',
        tags: [{ name: 'test', description: 'test tag' }],
        askedBy: username,
        askDateTime: new Date('2024-06-06'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [],
        comments: [],
        reportedBy: [],
      };

      const dbTag = { _id: new mongoose.Types.ObjectId(), name: 'test', description: 'test tag' };

      jest.spyOn(tagUtil, 'processTags').mockResolvedValueOnce([dbTag]);
      jest.spyOn(questionUtil, 'saveQuestion').mockResolvedValueOnce({
        ...mockReqBody,
        _id: qid,
        tags: [dbTag._id],
      });

      jest.spyOn(databaseUtil, 'populateDocument').mockResolvedValueOnce({
        ...mockReqBody,
        _id: qid,
        tags: [dbTag],
        answers: [],
        comments: [],
      });

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce({
        _id: userId,
        username,
        score,
        ranking: currentRank,
        questionsAsked: 1,
      });

      jest.spyOn(UserModel, 'updateOne').mockResolvedValueOnce({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });

      (getUpdatedRank as jest.Mock).mockReturnValueOnce(newRank);

      const response = await supertest(app).post('/question/addQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(userId.toString(), achievement);
    });
  },
);
