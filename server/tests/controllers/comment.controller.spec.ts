import mongoose from 'mongoose';
import supertest from 'supertest';
import { CommentResponse } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as commentUtil from '../../services/comment.service';
import * as databaseUtil from '../../utils/database.util';
import CommunityModel from '../../models/communities.model';
import UserModel from '../../models/users.model';
import userNotificationManager from '../../services/userNotificationManager';
import grantAchievementToUser from '../../services/achievement.service';
import getUpdatedRank from '../../utils/userstat.util';
import CommentModel from '../../models/comments.model';
import { populateDocument } from '../../utils/database.util';

const saveCommentSpy = commentUtil.saveComment as jest.Mock;
const findUserSpy = jest.spyOn(UserModel, 'findOne');
findUserSpy.mockResolvedValue({
  _id: new mongoose.Types.ObjectId(),
  username: 'dummyUserId',
  score: 0,
  ranking: 'Newbie',
  questionsAsked: 0,
  save: jest.fn().mockResolvedValue(true),
});
(commentUtil.saveComment as jest.Mock).mockResolvedValue({
  _id: new mongoose.Types.ObjectId(),
  text: 'Mock comment text',
  commentBy: 'dummyUserId',
  commentDateTime: new Date(),
  upVotes: [],
  downVotes: [],
});
const mockNotify = jest.fn();
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

const addCommentSpy = jest.spyOn(commentUtil, 'addComment');
const popDocSpy = jest.spyOn(databaseUtil, 'populateDocument');

const populateDocumentSpy = populateDocument as jest.Mock;

jest.mock('../../services/comment.service', () => ({
  __esModule: true,
  saveComment: jest.fn(),
  addComment: jest.fn(),
  addVoteToComment: jest.fn(),
  deleteCommentById: jest.fn(),
}));

jest.mock('../../utils/userstat.util', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('Newcomer Newbie'),
}));

jest.mock('../../services/achievement.service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((_id, achievement) => Promise.resolve(achievement)),
}));

jest.spyOn(UserModel, 'updateOne').mockResolvedValue({
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0,
  upsertedId: null,
});

const deleteCommentByIdSpy = jest.spyOn(commentUtil, 'deleteCommentById');
describe('POST /addComment', () => {
  it('should add a new comment to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
      upVotes: [],
      downVotes: [],
    };

    (commentUtil.saveComment as jest.Mock).mockResolvedValueOnce(mockComment);
    addCommentSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [],
      comments: [mockComment._id],
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
      answers: [],
      comments: [mockComment],
      reportedBy: [],
    });

    const findOneSpyCommunity = jest.spyOn(CommunityModel, 'findOne');
    findOneSpyCommunity.mockResolvedValueOnce(null);

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body.answer.comments).toEqual([
      expect.objectContaining({
        _id: validCid.toString(),
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: mockComment.commentDateTime.toISOString(),
        upVotes: [],
        downVotes: [],
      }),
    ]);

    expect(response.body.unlockedAchievements).toEqual([]);
  });

  it('should add a new comment to the answer', async () => {
    const validAid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validAid.toString(),
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
        upVotes: [],
        downVotes: [],
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
      upVotes: [],
      downVotes: [],
    };

    (commentUtil.saveComment as jest.Mock).mockResolvedValueOnce(mockComment);

    addCommentSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment._id],
      upVotes: [],
      downVotes: [],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validCid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment],
      upVotes: [],
      downVotes: [],
    });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body.answer.comments).toEqual([
      expect.objectContaining({
        _id: validCid.toString(),
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: mockComment.commentDateTime.toISOString(),
        upVotes: [],
        downVotes: [],
      }),
    ]);

    expect(response.body.unlockedAchievements).toEqual([]);
  });

  it('should return bad request error if id property missing', async () => {
    const mockReqBody = {
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if type property is missing', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      comment: {
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if type property is not `question` or `answer` ', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'invalidType',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if comment text property is missing', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if text property of comment is empty', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'comment',
      comment: {
        text: '',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid comment body');
  });

  it('should return bad request error if commentBy property missing', async () => {
    const mockReqBody = {
      id: 'dummyQuestionId',
      type: 'question',
      com: {
        text: 'This is a test comment',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if commentDateTime property missing', async () => {
    const mockReqBody = {
      id: 'dummyQuestionId',
      type: 'comment',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/comment/addComment');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if qid is not a valid ObjectId', async () => {
    const mockReqBody = {
      id: 'invalidObjectId',
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid ID format');
  });

  it('should return database error in response if `addComment` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
      upVotes: [],
      downVotes: [],
    };

    (commentUtil.saveComment as jest.Mock).mockResolvedValueOnce(mockComment);

    addCommentSpy.mockResolvedValueOnce({
      error: 'Error when adding comment',
    });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding comment: Error when adding comment');
  });

  it('should return 500 if saveComment returns an error', async () => {
    const qid = new mongoose.Types.ObjectId();
    const commentInput = {
      id: qid.toString(),
      type: 'question',
      comment: {
        text: 'Test comment with save error',
        commentBy: 'dummyUser',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    saveCommentSpy.mockResolvedValueOnce({ error: 'Failed to save comment' });

    const response = await supertest(app).post('/comment/addComment').send(commentInput);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding comment: Failed to save comment');
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
  'Self-vote triggers rank-up from $currentRank to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should grant ${achievement} on self upvote`, async () => {
      const userId = new mongoose.Types.ObjectId();
      const commentId = new mongoose.Types.ObjectId();

      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
        _id: commentId,
        commentBy: 'testUser',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      const mockUser = {
        _id: userId,
        username: 'testUser',
        score: 90,
        ranking: currentRank,
        upVotesGiven: 0,
        downVotesGiven: 0,
        save: jest.fn(),
        equals: (id: mongoose.Types.ObjectId) => id.equals(userId),
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValue(mockUser);
      (getUpdatedRank as jest.Mock).mockReturnValue(newRank);

      (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
        upVotes: ['testUser'],
        downVotes: [],
      });

      const response = await supertest(app)
        .post('/comment/upvoteComment')
        .send({ cid: commentId.toString(), username: 'testUser' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
    });
  },
);

it('should unlock Diligent Reviewer when voter reaches 5 upVotesGiven', async () => {
  const cid = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
    _id: new mongoose.Types.ObjectId().toString(),
    commentBy: 'voterUser',
    upVotes: [],
    downVotes: [],
    save: jest.fn(),
  });

  const mockUser = {
    _id: userId,
    username: 'voterUser',
    score: 10,
    ranking: 'Common Contributor',
    upVotesGiven: 4,
    downVotesGiven: 0,
    save: jest.fn(),
    equals: () => true,
  };

  jest.spyOn(UserModel, 'findOne').mockResolvedValue(mockUser);
  (getUpdatedRank as jest.Mock).mockReturnValue('Common Contributor');

  (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
    upVotes: ['voterUser'],
    downVotes: [],
  });

  const response = await supertest(app)
    .post('/comment/upvoteComment')
    .send({ cid: cid.toString(), username: 'voterUser' });

  expect(response.status).toBe(200);
  expect(response.body.unlockedAchievements).toEqual(expect.arrayContaining(['Diligent Reviewer']));
  expect(grantAchievementToUser).toHaveBeenCalledWith(userId.toString(), 'Diligent Reviewer');
});

describe.each(ASCENSION_CASES)(
  'Recipient rank-up from $currentRank to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} when recipient gets enough votes`, async () => {
      const cid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId().toString(),
        commentBy: 'recipientUser',
        upVotes: [],
        downVotes: [],
        save: jest.fn(),
      });

      const mockVoter = {
        _id: voterId,
        username: 'voterUser',
        score: 30,
        ranking: 'Common Contributor',
        upVotesGiven: 2,
        downVotesGiven: 0,
        save: jest.fn(),
        equals: () => false,
      };

      const mockRecipient = {
        _id: recipientId,
        username: 'recipientUser',
        score: 90,
        ranking: currentRank,
        save: jest.fn(),
      };

      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockVoter)
        .mockResolvedValueOnce(mockRecipient);

      (getUpdatedRank as jest.Mock)
        .mockReturnValueOnce('Common Contributor') // voter
        .mockReturnValueOnce(newRank); // recipient

      (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
        upVotes: ['voterUser'],
        downVotes: [],
      });

      const response = await supertest(app)
        .post('/comment/upvoteComment')
        .send({ cid: cid.toString(), username: 'voterUser' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(recipientId.toString(), achievement);
    });
  },
);

describe('DELETE /comment/deleteComment/:cid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if cid param is missing or invalid', async () => {
    const response = await supertest(app).delete('/comment/deleteComment/%20');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 200 and deleted comment object if successful', async () => {
    const cid = new mongoose.Types.ObjectId().toString();
    const mockComment = {
      _id: new mongoose.Types.ObjectId(),
      text: 'Deleted comment',
      commentBy: 'user123',
      commentDateTime: new Date(),
      upVotes: [],
      downVotes: [],
    };

    deleteCommentByIdSpy.mockResolvedValueOnce(mockComment);

    const response = await supertest(app).delete(`/comment/deleteComment/${cid}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        text: 'Deleted comment',
        commentBy: 'user123',
        commentDateTime: expect.any(String),
        upVotes: expect.any(Array),
        downVotes: expect.any(Array),
      }),
    );
    expect(deleteCommentByIdSpy).toHaveBeenCalledWith(cid);
  });

  it('should return 500 if comment not found (null)', async () => {
    const cid = new mongoose.Types.ObjectId().toString();

    deleteCommentByIdSpy.mockResolvedValueOnce(null as unknown as CommentResponse);

    const response = await supertest(app).delete(`/comment/deleteComment/${cid}`);

    expect(response.status).toBe(500);
    expect(response.text).toMatch(/failed to delete comment/);
  });

  it('should return 500 if deleteCommentById throws an error', async () => {
    const cid = new mongoose.Types.ObjectId().toString();

    deleteCommentByIdSpy.mockRejectedValueOnce(new Error('DB crash'));

    const response = await supertest(app).delete(`/comment/deleteComment/${cid}`);

    expect(response.status).toBe(500);
    expect(response.text).toMatch(/Error when deleting comment: DB crash/);
  });
});

describe('GET /comment/getComment/:cid', () => {
  it('should return 400 if cid param is missing or invalid', async () => {
    const response = await supertest(app).get('/comment/getComment/%20'); // invalid cid
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return 200 and the comment if successful', async () => {
    const cid = new mongoose.Types.ObjectId().toString();

    const mockComment = {
      _id: cid,
      text: 'Mock comment text',
      commentBy: 'userABC',
      commentDateTime: new Date().toISOString(),
      upVotes: [],
      downVotes: [],
    };

    populateDocumentSpy.mockResolvedValueOnce(mockComment);

    const response = await supertest(app).get(`/comment/getComment/${cid}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: cid,
        text: 'Mock comment text',
        commentBy: 'userABC',
        commentDateTime: expect.any(String),
        upVotes: expect.any(Array),
        downVotes: expect.any(Array),
      }),
    );
    expect(populateDocumentSpy).toHaveBeenCalledWith(cid, 'comment');
  });

  it('should return 500 if comment is null', async () => {
    const cid = new mongoose.Types.ObjectId().toString();

    populateDocumentSpy.mockResolvedValueOnce(null);

    const response = await supertest(app).get(`/comment/getComment/${cid}`);

    expect(response.status).toBe(500);
    expect(response.text).toMatch(/Failed to retrieve comment/);
  });

  it('should return 500 if populateDocument throws an error', async () => {
    const cid = new mongoose.Types.ObjectId().toString();

    populateDocumentSpy.mockRejectedValueOnce(new Error('DB read error'));

    const response = await supertest(app).get(`/comment/getComment/${cid}`);

    expect(response.status).toBe(500);
    expect(response.text).toMatch(/Error when retrieving comment: DB read error/);
  });
});

describe('POST /comment/upvoteComment and /comment/downvoteComment', () => {
  const cid = new mongoose.Types.ObjectId();
  const voterId = new mongoose.Types.ObjectId();
  const recipientId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if request body is invalid', async () => {
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: '', username: '' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid vote request');
  });

  it('should return 404 if comment is not found', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce(null);

    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(404);
    expect(response.text).toBe('Comment not found');
  });

  it('should return 404 if user is not found', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
      ansBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(null) // voter is null
      .mockResolvedValueOnce(null); // recipient won't be queried, but needed to prevent hanging

    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should upvote an comment and unlock achievement', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: ['voterUser'],
      downVotes: [],
    });
    jest.spyOn(CommentModel, 'countDocuments').mockResolvedValueOnce(10); // triggers Ambitious Reviewer

    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(response.body.unlockedAchievements).toContain('Diligent Reviewer');
  });

  it('should downvote an comment and update user scores', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: ['voterUser'],
    });
    const response = await supertest(app)
      .post('/comment/downvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
  });
});

describe('POST /comment/upvoteComment and /comment/downvoteComment— voteComment logic', () => {
  const cid = new mongoose.Types.ObjectId();
  const voterId = new mongoose.Types.ObjectId();
  const recipientId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if cid or username is missing', async () => {
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: '', username: '' });
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid vote request');
  });

  it('should return 404 if comment is not found', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce(null);
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });
    expect(response.status).toBe(404);
    expect(response.text).toBe('Comment not found');
  });

  it('should return 404 if voter is not found', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should handle upvoting: first time upvote', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: ['voterUser'],
      downVotes: [],
    });
    jest.spyOn(CommentModel, 'countDocuments').mockResolvedValue(1);
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });
    expect(response.status).toBe(200);
  });

  it('should handle upvoting: was previously downvoted', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: ['voterUser'],
      downVotes: [],
    });
    jest.spyOn(CommentModel, 'countDocuments').mockResolvedValue(1);
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });
    expect(response.status).toBe(200);
  });

  it('should handle downvoting: was previously upvoted', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: ['voterUser'],
    });
    const response = await supertest(app)
      .post('/comment/downvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });
    expect(response.status).toBe(200);
  });

  it('should return 500 if addVoteToComment throws an error', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({ error: 'DB error' });
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });
    expect(response.status).toBe(500);
    expect(response.text).toMatch(/Error when upvoteing comment: DB error/);
  });

  it('should remove upvote if already upvoted (wasUpvoted)', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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

    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: [],
    });

    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
  });

  it('should remove downvote if already downvoted (wasDownvoted)', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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

    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: [],
    });

    const response = await supertest(app)
      .post('/comment/downvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
  });

  it('should downvote for the first time', async () => {
    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
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

    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: [],
      downVotes: ['voterUser'],
    });

    const response = await supertest(app)
      .post('/comment/downvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
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

    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
      commentBy: 'selfVoter',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest
      .spyOn(UserModel, 'findOne')
      .mockResolvedValueOnce(mockUser) // voter
      .mockResolvedValueOnce(mockUser); // recipient is the same

    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Common Contributor');
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: ['selfVoter'],
      downVotes: [],
      wasUpvoted: false,
      wasDownvoted: false,
      message: 'Vote registered',
    });
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'selfVoter' });

    expect(response.status).toBe(200);
    expect(grantAchievementToUser).toHaveBeenCalledWith(userId.toString(), 'Ascension I');
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

    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
      commentBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);

    (getUpdatedRank as jest.Mock).mockReturnValueOnce('Common Contributor'); // voter's new rank
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: ['selfVoter'],
      downVotes: [],
      wasUpvoted: false,
      wasDownvoted: false,
      message: 'Vote registered',
    });
    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(grantAchievementToUser).toHaveBeenCalledWith(voterId.toString(), 'Ascension I');
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

    jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
      _id: cid,
      commentBy: 'recipientUser',
      upVotes: [],
      downVotes: [],
      save: jest.fn(),
    });

    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(voter).mockResolvedValueOnce(recipient);
    (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
      upVotes: ['selfVoter'],
      downVotes: [],
      wasUpvoted: false,
      wasDownvoted: false,
      message: 'Vote registered',
    });
    (getUpdatedRank as jest.Mock)
      .mockReturnValueOnce('Newcomer Newbie') // voter's rank stays
      .mockReturnValueOnce('Common Contributor'); // recipient ranks up

    const response = await supertest(app)
      .post('/comment/upvoteComment')
      .send({ cid: cid.toString(), username: 'voterUser' });

    expect(response.status).toBe(200);
    expect(grantAchievementToUser).toHaveBeenCalledWith(recipientId.toString(), 'Ascension I');
  });
});

describe.each(ASCENSION_CASES)(
  'Self-voting rank-up from $previousRank to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} if user upvotes own comment and ranks up`, async () => {
      const id = new mongoose.Types.ObjectId();
      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
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
      (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
        upVotes: ['user123'],
        downVotes: [],
      });

      const response = await supertest(app)
        .post('/comment/upvoteComment')
        .send({ cid: id.toString(), username: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(id.toString(), achievement);
    });
  },
);

describe.each(ASCENSION_CASES)(
  'Recipient rank-up from $previousRank to $newRank',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} if recipient gets enough votes to rank up`, async () => {
      const cid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
        _id: cid,
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

      (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
        upVotes: ['voterUser'],
        downVotes: [],
      });

      const response = await supertest(app)
        .post('/comment/upvoteComment')
        .send({ cid: cid.toString(), username: 'voterUser' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(recipientId.toString(), achievement);
    });
  },
);

describe.each(ASCENSION_CASES)(
  'Voter rank-up from $previousRank to $newRank after voting on another comment',
  ({ currentRank, newRank, achievement }) => {
    it(`should unlock ${achievement} for the voter`, async () => {
      const cid = new mongoose.Types.ObjectId();
      const voterId = new mongoose.Types.ObjectId();
      const recipientId = new mongoose.Types.ObjectId();

      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce({
        _id: cid,
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
      (commentUtil.addVoteToComment as jest.Mock).mockResolvedValueOnce({
        upVotes: ['voterUser'],
        downVotes: [],
      });

      // Mock rank update logic
      (getUpdatedRank as jest.Mock)
        .mockReturnValueOnce(newRank) // voter's new rank
        .mockReturnValueOnce('Common Contributor'); // recipient remains same

      // Send the vote
      const response = await supertest(app)
        .post('/comment/upvoteComment')
        .send({ cid: cid.toString(), username: 'voterUser' });

      expect(response.status).toBe(200);
      expect(response.body.unlockedAchievements).toContain(achievement);
      expect(grantAchievementToUser).toHaveBeenCalledWith(voterId.toString(), achievement);
    });
  },
);
