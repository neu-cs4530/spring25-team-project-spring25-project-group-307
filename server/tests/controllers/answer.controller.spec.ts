import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { AnswerResponse } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as answerUtil from '../../services/answer.service';
import * as databaseUtil from '../../utils/database.util';
import UserModel from '../../models/users.model';
import CommunityModel from '../../models/communities.model';
import * as achievementService from '../../services/achievement.service';

import userNotificationManager from '../../services/userNotificationManager';
import * as questionService from '../../services/question.service';
import * as commentUtil from '../../services/comment.service';
import getUpdatedRank from '../../utils/userstat.util';
import AnswerModel from '../../models/answers.model';

const saveAnswerSpy = answerUtil.saveAnswer as jest.Mock;
const addAnswerToQuestionSpy = answerUtil.addAnswerToQuestion as jest.Mock;
const popDocSpy = jest.spyOn(databaseUtil, 'populateDocument');

const mockNotify = jest.fn();

jest.mock('../../services/answer.service', () => ({
  __esModule: true,
  saveAnswer: jest.fn(),
  addAnswerToQuestion: jest.fn(),
  addVoteToAnswer: jest.fn().mockResolvedValue({
    upVotes: ['voterUser'],
    downVotes: [],
  }),
  deleteAnswerById: jest.fn(),
}));

jest.spyOn(userNotificationManager, 'getInstance').mockReturnValue({
  notifySpecificOnlineUsers: mockNotify,
  notifyOnlineUsersInCommunity: jest.fn(),
  getLoggedInUsers: jest.fn().mockReturnValue([]),
  getUserSocketByUsername: jest.fn().mockReturnValue(null),
  addInitialConnection: jest.fn(),
  updateConnectionUserLogin: jest.fn(),
  removeConnection: jest.fn(),
  _socketIdToUser: new Map(),
  _socketIdToSocket: new Map(),
} as unknown as ReturnType<typeof userNotificationManager.getInstance>);

jest.mock('../../services/achievement.service', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation((_id: string, achievement: string) => Promise.resolve(achievement)),
}));

jest.mock('../../utils/userstat.util', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.spyOn(questionService, 'getCommunityQuestion').mockResolvedValue({
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

describe('POST /addAnswer', () => {
  it('should add a new answer to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
      upVotes: [],
      downVotes: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
      reportedBy: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
      reportedBy: [],
    });

    const findOneSpy = jest.spyOn(UserModel, 'findOne');
    findOneSpy.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      username: 'dummyUserId',
      score: 0,
      ranking: 'Newcomer Newbie',
      responsesGiven: 0,
    });
    jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    const findOneSpyCommunity = jest.spyOn(CommunityModel, 'findOne');
    findOneSpyCommunity.mockResolvedValueOnce(null);

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validAid.toString(),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: mockAnswer.ansDateTime.toISOString(),
      comments: [],
      upVotes: [],
      downVotes: [],
      unlockedAchievements: ['Helpful Mind'],
    });
  });

  it('should return bad request error if answer text property is missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if request body has qid property missing', async () => {
    const mockReqBody = {
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansBy property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansDateTime property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/answer/addAnswer');

    expect(response.status).toBe(400);
  });

  it('should return database error in response if saveAnswer method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    saveAnswerSpy.mockResolvedValueOnce({ error: 'Error when saving an answer' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if update question method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
      upVotes: [],
      downVotes: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if `populateDocument` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
      upVotes: [],
      downVotes: [],
    };

    const mockQuestion = {
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
      reportedBy: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);
    popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should grant Ascension I achievement when user ranking is updated to Common Contributor', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    // Mock DB answer object
    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
      upVotes: [],
      downVotes: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
      reportedBy: [],
    });

    popDocSpy.mockResolvedValueOnce(mockAnswer);

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      username: 'dummyUserId',
      score: 0, // old score
      ranking: 'Newcomer Newbie', // old rank
      responsesGiven: 0,
    });

    jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    (getUpdatedRank as jest.Mock).mockReturnValue('Common Contributor');

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body.unlockedAchievements).toContain('Ascension I');
    expect(achievementService.default).toHaveBeenCalledWith(expect.any(String), 'Ascension I');
  });
  it('should grant Problem Solver achievement when user has 4 previous responses', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();

    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'Fifth answer',
        ansBy: 'problemSolverUser',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'Fifth answer',
      ansBy: 'problemSolverUser',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
      upVotes: [],
      downVotes: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'Problem Solving Q',
      text: 'Some question',
      tags: [],
      askedBy: 'problemSolverUser',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
      reportedBy: [],
    });

    popDocSpy.mockResolvedValueOnce(mockAnswer);

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      username: 'problemSolverUser',
      score: 100,
      ranking: 'Skilled Solver',
      responsesGiven: 4, // This is what triggers the achievement
    });

    jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    (getUpdatedRank as jest.Mock).mockReturnValue('Skilled Solver');

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body.unlockedAchievements).toContain('Problem Solver');
    expect(achievementService.default).toHaveBeenCalledWith(expect.any(String), 'Problem Solver');
  });

  it('should set responsesGiven to 1 if it was undefined', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();

    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'Testing responsesGiven increment',
        ansBy: 'newUser',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: mockReqBody.ans.text,
      ansBy: mockReqBody.ans.ansBy,
      ansDateTime: mockReqBody.ans.ansDateTime,
      comments: [],
      upVotes: [],
      downVotes: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    addAnswerToQuestionSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'Test Q',
      text: 'Test content',
      tags: [],
      askedBy: 'newUser',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
      reportedBy: [],
    });

    popDocSpy.mockResolvedValueOnce(mockAnswer);

    const updateSpy = jest.spyOn(UserModel, 'updateOne');

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      username: 'newUser',
      score: 0,
      ranking: 'Newcomer Newbie',
      responsesGiven: undefined,
    });

    jest.spyOn(UserModel, 'updateOne').mockResolvedValueOnce({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    (getUpdatedRank as jest.Mock).mockReturnValue('Newcomer Newbie');
    jest.spyOn(CommunityModel, 'findOne').mockResolvedValueOnce(null);
    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledWith(
      { username: 'newUser' },
      expect.objectContaining({
        $set: expect.objectContaining({ responsesGiven: 1 }),
      }),
    );
  });
});

const ASCENSION_CASES = [
  { currentRank: 'Newcomer Newbie', newRank: 'Common Contributor', achievement: 'Ascension I' },
  { currentRank: 'Common Contributor', newRank: 'Skilled Solver', achievement: 'Ascension II' },
  { currentRank: 'Skilled Solver', newRank: 'Expert Explorer', achievement: 'Ascension III' },
  { currentRank: 'Expert Explorer', newRank: 'Mentor Maven', achievement: 'Ascension IV' },
  { currentRank: 'Mentor Maven', newRank: 'Master Maverick', achievement: 'Ascension V' },
];

describe.each(ASCENSION_CASES)(
  'Rank transition to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should grant ${achievement} when user rank changes from ${currentRank} to ${newRank}`, async () => {
      const validQid = new mongoose.Types.ObjectId();
      const validAid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        qid: validQid,
        ans: {
          text: 'Testing rank achievement',
          ansBy: 'rankUser',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const mockAnswer = {
        _id: validAid,
        text: 'Testing rank achievement',
        ansBy: 'rankUser',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
        upVotes: [],
        downVotes: [],
      };

      saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

      addAnswerToQuestionSpy.mockResolvedValueOnce({
        _id: validQid,
        title: 'Some Q',
        text: 'Q text',
        askedBy: 'rankUser',
        askDateTime: new Date('2024-06-03'),
        tags: [],
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [mockAnswer._id],
        comments: [],
        reportedBy: [],
      });

      popDocSpy.mockResolvedValueOnce(mockAnswer);

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        username: 'rankUser',
        score: 100, // not relevant for logic since getUpdatedRank is mocked
        ranking: currentRank,
        responsesGiven: 1,
      });

      jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });

      (getUpdatedRank as jest.Mock).mockReturnValue(newRank);

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(achievementService.default).toHaveBeenCalledWith(expect.any(String), achievement);
    });
  },
);

const deleteAnswerByIdSpy = answerUtil.deleteAnswerById as jest.Mock;
describe('DELETE /deleteAnswer/:aid', () => {
  it('should return 400 if aid param is empty or just whitespace', async () => {
    const response = await supertest(app).delete('/answer/deleteAnswer/%20'); // space as aid

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 200 and deleted answer when successful', async () => {
    const mockAnswerId = new mongoose.Types.ObjectId().toString();
    const mockAnswer = {
      _id: new mongoose.Types.ObjectId(mockAnswerId),
      text: 'Deleted answer',
      ansBy: 'user123',
      ansDateTime: new Date(),
      upVotes: [],
      downVotes: [],
      comments: [],
    };

    deleteAnswerByIdSpy.mockResolvedValueOnce(mockAnswer);

    const response = await supertest(app).delete(`/answer/deleteAnswer/${mockAnswerId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ _id: mockAnswerId }));
    expect(deleteAnswerByIdSpy).toHaveBeenCalledWith(mockAnswerId);
  });

  it('should return 500 if deleteAnswerById returns null', async () => {
    const mockAnswerId = new mongoose.Types.ObjectId().toString();
    deleteAnswerByIdSpy.mockResolvedValueOnce(null as unknown as AnswerResponse);

    const response = await supertest(app).delete(`/answer/deleteAnswer/${mockAnswerId}`);

    expect(response.status).toBe(500);
    expect(response.text).toMatch(/failed to delete answer/);
  });

  it('should return 500 if deleteAnswerById throws an error', async () => {
    const mockAnswerId = new mongoose.Types.ObjectId().toString();
    deleteAnswerByIdSpy.mockRejectedValueOnce(new Error('DB crashed'));

    const response = await supertest(app).delete(`/answer/deleteAnswer/${mockAnswerId}`);

    expect(response.status).toBe(500);
    expect(response.text).toMatch(/Error when deleting answer: DB crashed/);
  });
});

describe('POST /answer/upvoteAnswer and /answer/downvoteAnswer', () => {
  const aid = new mongoose.Types.ObjectId();
  const voterId = new mongoose.Types.ObjectId();
  const recipientId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if request body is invalid', async () => {
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: '', username: '' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 404 if answer is not found', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce(null);

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(404);
    expect(response.text).toBe('Answer not found');
  });

  it('should return 404 if user is not found', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(null) // voter is null
      .mockResolvedValueOnce(null); // recipient won't be queried, but needed to prevent hanging

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should upvote an answer and unlock achievement', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 0,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 4,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Common Contributor',
        save: jest.fn(),
      });

    jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(10); // triggers Ambitious Reviewer

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(response.body.answer.upVotes).toContain('voterUser');
    expect(response.body.unlockedAchievements).toContain('Diligent Reviewer');
  });

  it('should downvote an answer and update user scores', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: ['voterUser'],
      downVotes: [],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 0,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 1,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Common Contributor',
        save: jest.fn(),
      });
    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: ['voterUser'],
    });
    const response = await supertest(app)
      .post('/answer/downvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toContain('voterUser');
    expect(response.body.answer.upVotes).not.toContain('voterUser');
    expect(response.body.answer.msg).toBe('downvote successful');
  });
});

describe('POST /answer/upvoteAnswer and /answer/downvoteAnswer — voteAnswer logic', () => {
  const aid = new mongoose.Types.ObjectId();
  const voterId = new mongoose.Types.ObjectId();
  const recipientId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if aid or username is missing', async () => {
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: '', username: '' });
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 404 if answer is not found', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce(null);
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });
    expect(response.status).toBe(404);
    expect(response.text).toBe('Answer not found');
  });

  it('should return 404 if voter is not found', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
    });
    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(null) // voter
      .mockResolvedValueOnce({
        // recipient (still needed to avoid hanging in controller)
        _id: new mongoose.Types.ObjectId(),
        username: 'recipientUser',
        score: 0,
        ranking: 'Newcomer Newbie',
        save: jest.fn(),
      });
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should handle upvoting: first time upvote', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });
    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 10,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 0,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Common Contributor',
        save: jest.fn(),
      });
    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: ['voterUser'],
      downVotes: [],
    });
    jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValue(1);
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });
    expect(response.status).toBe(200);
    expect(response.body.answer.upVotes).toContain('voterUser');
  });

  it('should handle upvoting: was previously downvoted', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: ['voterUser'],
      save: jest.fn(),
    });
    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 0,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 0,
        downVotesGiven: 1,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 90,
        ranking: 'Newcomer Newbie',
        save: jest.fn(),
      });
    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: ['voterUser'],
      downVotes: [],
    });
    jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValue(1);
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });
    expect(response.status).toBe(200);
    expect(response.body.answer.upVotes).toContain('voterUser');
  });

  it('should handle downvoting: was previously upvoted', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: ['voterUser'],
      downVotes: [],
      save: jest.fn(),
    });
    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 50,
        ranking: 'Common Contributor',
        upVotesGiven: 1,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 60,
        ranking: 'Common Contributor',
        save: jest.fn(),
      });
    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: ['voterUser'],
    });
    const response = await supertest(app)
      .post('/answer/downvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });
    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toContain('voterUser');
    expect(response.body.answer.upVotes).not.toContain('voterUser');
  });

  it('should return 500 if addVoteToAnswer throws an error', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });
    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 10,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 0,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 10,
        ranking: 'Newcomer Newbie',
        save: jest.fn(),
      });
    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({ error: 'DB error' });
    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });
    expect(response.status).toBe(500);
    expect(response.text).toMatch(/Error when upvoteing answer: DB error/);
  });

  it('should remove upvote if already upvoted (wasUpvoted)', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: ['voterUser'],
      downVotes: [],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 10,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 1,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Newcomer Newbie',
        save: jest.fn(),
      });

    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: [],
    });

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(response.body.answer.upVotes).toEqual([]);
  });

  it('should remove downvote if already downvoted (wasDownvoted)', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: ['voterUser'],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 10,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 0,
        downVotesGiven: 1,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Newcomer Newbie',
        save: jest.fn(),
      });

    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: [],
    });

    const response = await supertest(app)
      .post('/answer/downvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toEqual([]);
  });

  it('should downvote for the first time', async () => {
    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce({
        _id: voterId,
        username: 'voterUser',
        score: 10,
        ranking: 'Newcomer Newbie',
        upVotesGiven: 0,
        downVotesGiven: 0,
        save: jest.fn(),
      })
      .mockResolvedValueOnce({
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Newcomer Newbie',
        save: jest.fn(),
      });

    (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: ['voterUser'],
    });

    const response = await supertest(app)
      .post('/answer/downvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(response.body.answer.downVotes).toContain('voterUser');
  });

  it('should grant Ascension achievement when self-upvote causes rank-up', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockUser = {
      _id: userId,
      username: 'selfVoter',
      score: 90,
      ranking: 'Newcomer Newbie',
      upVotesGiven: 0,
      downVotesGiven: 0,
      save: jest.fn(),
      equals: (id: mongoose.Types.ObjectId) => id.equals(userId),
    };

    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'selfVoter',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(mockUser) // voter
      .mockResolvedValueOnce(mockUser); // recipient is the same

    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Common Contributor');

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'selfVoter' });

    expect(response.status).toBe(200);
    expect(achievementService.default).toHaveBeenCalledWith(userId.toString(), 'Ascension I');
    expect(response.body.unlockedAchievements).toContain('Ascension I');
  });

  it('should grant Ascension achievement to voter on rank-up', async () => {
    const voter = {
      _id: voterId,
      username: 'voterUser',
      score: 90,
      ranking: 'Newcomer Newbie',
      upVotesGiven: 4,
      downVotesGiven: 0,
      save: jest.fn(),
      equals: (id: mongoose.Types.ObjectId) => false,
    };

    const recipient = {
      _id: recipientId,
      username: 'recipientUser',
      score: 100,
      ranking: 'Common Contributor',
      save: jest.fn(),
    };

    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);

    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Common Contributor'); // voter's new rank

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(achievementService.default).toHaveBeenCalledWith(voterId.toString(), 'Ascension I');
  });

  it('should grant Ascension achievement to recipient on rank-up', async () => {
    const voter = {
      _id: voterId,
      username: 'voterUser',
      score: 30,
      ranking: 'Newcomer Newbie',
      upVotesGiven: 1,
      downVotesGiven: 0,
      save: jest.fn(),
      equals: (id: mongoose.Types.ObjectId) => false,
    };

    const recipient = {
      _id: recipientId,
      username: 'recipientUser',
      score: 90,
      ranking: 'Newcomer Newbie',
      save: jest.fn(),
    };

    jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
      _id: aid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);

    (getUpdatedRank as jest.Mock)
      .mockReturnValueOnce('Newcomer Newbie') // voter's rank stays
      .mockReturnValueOnce('Common Contributor'); // recipient ranks up

    const response = await supertest(app)
      .post('/answer/upvoteAnswer')
      .send({ aid: aid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(achievementService.default).toHaveBeenCalledWith(recipientId.toString(), 'Ascension I');
  });
});

describe.each(ASCENSION_CASES)(
  'Self-voting rank-up from $previousRank to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} if user upvotes own answer and ranks up`, async () => {
      const id = new mongoose.Types.ObjectId();
      jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
        _id: id,
        ansBy: 'user123',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      const mockUser = {
        _id: id,
        username: 'user123',
        score: 90,
        ranking: currentRank,
        upVotesGiven: 0,
        downVotesGiven: 0,
        save: jest.fn(),
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValue(mockUser);

      (getUpdatedRank as jest.Mock).mockReturnValue(newRank);
      (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
        upVotes: ['user123'],
        downVotes: [],
      });

      const response = await supertest(app)
        .post('/answer/upvoteAnswer')
        .send({ aid: id.toString(), username: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(achievementService.default).toHaveBeenCalledWith(id.toString(), achievement);
    });
  },
);

describe.each(ASCENSION_CASES)(
  'Recipient rank-up from $previousRank to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} if recipient gets enough votes to rank up`, async () => {
      const aid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
        _id: aid,
        ansBy: 'recipientUser',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce({
          _id: voterId,
          username: 'voterUser',
          score: 80,
          ranking: 'Common Contributor',
          upVotesGiven: 1,
          downVotesGiven: 0,
          save: jest.fn(),
        })
        .mockResolvedValueOnce({
          _id: recipientId,
          username: 'recipientUser',
          score: 100,
          ranking: currentRank,
          save: jest.fn(),
        });

      (getUpdatedRank as jest.Mock)
        .mockReturnValueOnce('Common Contributor') // voter's new rank (unchanged)
        .mockReturnValueOnce(newRank); // recipient's new rank

      (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
        upVotes: ['voterUser'],
        downVotes: [],
      });

      const response = await supertest(app)
        .post('/answer/upvoteAnswer')
        .send({ aid: aid.toString(), username: 'voterUser' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(achievementService.default).toHaveBeenCalledWith(recipientId.toString(), achievement);
    });
  },
);

describe.each(ASCENSION_CASES)(
  'Voter rank-up from $previousRank to $newRank after voting on another answer',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} for the voter`, async () => {
      const aid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce({
        _id: aid,
        ansBy: 'recipientUser',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      // Mock the voter and recipient
      const voter = {
        _id: voterId,
        username: 'voterUser',
        score: 80,
        ranking: currentRank,
        upVotesGiven: 2,
        downVotesGiven: 0,
        save: jest.fn(),
        equals: (id: mongoose.Types.ObjectId) => false, // not self-vote
      };

      const recipient = {
        _id: recipientId,
        username: 'recipientUser',
        score: 100,
        ranking: 'Common Contributor',
        save: jest.fn(),
      };

      // Mock user lookups
      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(voter)
        .mockResolvedValueOnce(recipient);

      // Mock vote application
      (answerUtil.addVoteToAnswer as jest.Mock).mockResolvedValueOnce({
        upVotes: ['voterUser'],
        downVotes: [],
      });

      // Mock rank update logic
      (getUpdatedRank as jest.Mock)
        .mockReturnValueOnce(newRank) // voter's new rank
        .mockReturnValueOnce('Common Contributor'); // recipient remains same

      // Send the vote
      const response = await supertest(app)
        .post('/answer/upvoteAnswer')
        .send({ aid: aid.toString(), username: 'voterUser' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(achievementService.default).toHaveBeenCalledWith(voterId.toString(), achievement);
    });
  },
);
