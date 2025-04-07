import mongoose from 'mongoose';
import supertest from 'supertest';
import { DatabaseQuestion, DatabaseTag, Tag } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as communityUtil from '../../services/community.service';
import * as questionUtil from '../../services/question.service';
import * as tagUtil from '../../services/tag.service';
import UserNotificationManager from '../../services/userNotificationManager';

const getCommunitiesSpy = jest.spyOn(communityUtil, 'getCommunities');
const getCommunitiesBySearchSpy = jest.spyOn(communityUtil, 'getCommunitiesBySearch');
const getCommunitiesByTagSpy = jest.spyOn(communityUtil, 'getCommunitiesByTag');
const getCommunitiesByUserSpy = jest.spyOn(communityUtil, 'getCommunitiesByUser');
const addCommunitySpy = jest.spyOn(communityUtil, 'addCommunity');
const processTagsSpy = jest.spyOn(tagUtil, 'processTags');
const joinCommunitySpy = jest.spyOn(communityUtil, 'joinCommunity');
const leaveCommunitySpy = jest.spyOn(communityUtil, 'leaveCommunity');
const getCommunityByIdSpy = jest.spyOn(communityUtil, 'getCommunityById');
const addQuestionToCommunitySpy = jest.spyOn(communityUtil, 'addQuestionToCommunity');
const getQuestionByIdSpy = jest.spyOn(questionUtil, 'getQuestionById');
const removeQuestionFromCommunitySpy = jest.spyOn(communityUtil, 'removeQuestionFromCommunity');
const updateUserRoleSpy = jest.spyOn(communityUtil, 'updateUserRole');
const addUserToCommunitySpy = jest.spyOn(communityUtil, 'addUserToCommunity');
const pinQuestionSpy = jest.spyOn(communityUtil, 'pinQuestion');
const unpinQuestionSpy = jest.spyOn(communityUtil, 'unpinQuestion');
const getTagsForCommunitySpy = jest.spyOn(communityUtil, 'getTagsForCommunity');
const getAllCommunityTagsSpy = jest.spyOn(communityUtil, 'getAllCommunityTags');

const community1 = {
  _id: new mongoose.Types.ObjectId('65e9b5a995b6c7045a30d823'),
  title: 'Community 1',
  description: 'Description 1',
  isPrivate: false,
  admins: [],
  moderators: [],
  members: [],
  pinnedQuestions: [],
  questions: [],
  tags: [],
};

const community2 = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
  title: 'Community 2',
  description: 'Description 2',
  isPrivate: true,
  admins: [],
  moderators: [],
  members: [],
  pinnedQuestions: [],
  questions: [],
  tags: [],
};

const community3 = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  title: 'Community 3',
  description: 'Description 3',
  isPrivate: false,
  admins: [],
  moderators: [],
  members: [],
  pinnedQuestions: [],
  questions: [],
  tags: [],
};

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

const COMMUNITIES = [community1, community2, community3];

describe('Test communityController', () => {
  describe('GET /getCommunities', () => {
    it('should return all communities', async () => {
      getCommunitiesSpy.mockResolvedValue(COMMUNITIES);

      const response = await supertest(app).get('/community/getCommunities');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(COMMUNITIES)));
    });

    it('should return an empty array if no communities are found', async () => {
      getCommunitiesSpy.mockResolvedValue([]);

      const response = await supertest(app).get('/community/getCommunities');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an error if there is a server error', async () => {
      getCommunitiesSpy.mockRejectedValue(new Error('Server error'));

      const response = await supertest(app).get('/community/getCommunities');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getCommunitiesBySearch/:search', () => {
    it('should return communities matching the search term', async () => {
      getCommunitiesBySearchSpy.mockResolvedValue(COMMUNITIES.slice(0, 1));

      const searchTerm = 'Community 1';
      const response = await supertest(app).get(`/community/getCommunitiesBySearch/${searchTerm}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(JSON.parse(JSON.stringify(COMMUNITIES[0])));
    });

    it('should return an empty array if no communities match the search term', async () => {
      getCommunitiesBySearchSpy.mockResolvedValue([]);

      const searchTerm = 'Nonexistent Community';
      const response = await supertest(app).get(`/community/getCommunitiesBySearch/${searchTerm}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an error if there is a server error', async () => {
      getCommunitiesBySearchSpy.mockRejectedValue(new Error('Server error'));

      const searchTerm = 'Community';
      const response = await supertest(app).get(`/community/getCommunitiesBySearch/${searchTerm}`);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /getCommunitiesByTags', () => {
    it('should return communities matching the tags', async () => {
      getCommunitiesByTagSpy.mockResolvedValue(COMMUNITIES.slice(0, 2));

      const tags = { tags: ['tag1', 'tag2'] }; // Represent tags as a JSON object
      const response = await supertest(app).post(`/community/getCommunitiesByTags`).send(tags);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual(JSON.parse(JSON.stringify(COMMUNITIES[0])));
      expect(response.body[1]).toEqual(JSON.parse(JSON.stringify(COMMUNITIES[1])));
    });

    it('should return an empty array if no communities match the tags', async () => {
      getCommunitiesByTagSpy.mockResolvedValue([]);

      const tags = { tags: ['nonExistantTag'] };
      const response = await supertest(app).post(`/community/getCommunitiesByTags`).send(tags);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an error if there is a server error', async () => {
      getCommunitiesByTagSpy.mockRejectedValue(new Error('Server error'));

      const tags = { tags: ['tag1', 'tag2'] };
      const response = await supertest(app).post(`/community/getCommunitiesByTags`).send(tags);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getCommunitiesByUser/:username', () => {
    it('should return communities for the given user', async () => {
      getCommunitiesByUserSpy.mockResolvedValue(COMMUNITIES.slice(0, 1));

      const username = 'user1';
      const response = await supertest(app).get(`/community/getCommunitiesByUser/${username}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(JSON.parse(JSON.stringify(COMMUNITIES[0])));
    });

    it('should return an empty array if no communities are found for the user', async () => {
      getCommunitiesByUserSpy.mockResolvedValue([]);

      const username = 'nonExistantUser';
      const response = await supertest(app).get(`/community/getCommunitiesByUser/${username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return an error if there is a server error', async () => {
      getCommunitiesByUserSpy.mockRejectedValue(new Error('Server error'));

      const username = 'user1';
      const response = await supertest(app).get(`/community/getCommunitiesByUser/${username}`);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /saveCommunity', () => {
    it('should save a community successfully', async () => {
      const newCommunity = {
        title: 'New Community',
        description: 'This is a new community',
        isPrivate: false,
        admins: [],
        moderators: [],
        members: [],
        pinnedQuestions: [],
        questions: [],
        tags: [dbTag1, dbTag2],
      };

      addCommunitySpy.mockResolvedValue(community1);
      processTagsSpy.mockResolvedValue([dbTag1, dbTag2]);

      const response = await supertest(app).post('/community/saveCommunity').send(newCommunity);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return status 400 if the community is invalid', async () => {
      const invalidCommunity = {
        title: '',
        description: 'This is a new community',
        isPrivate: false,
        admins: [],
        moderators: [],
        members: [],
        pinnedQuestions: [],
        questions: [],
        tags: [dbTag1, dbTag2],
      };
      addCommunitySpy.mockResolvedValue(null);
      processTagsSpy.mockResolvedValue([dbTag1, dbTag2]);
      const response = await supertest(app).post('/community/saveCommunity').send(invalidCommunity);
      expect(response.status).toBe(400);
    });

    it('should return status 500 if there is a server error', async () => {
      const newCommunity = {
        title: 'New Community',
        description: 'This is a new community',
        isPrivate: false,
        admins: [],
        moderators: [],
        members: [],
        pinnedQuestions: [],
        questions: [],
        tags: [dbTag1, dbTag2],
      };

      addCommunitySpy.mockRejectedValue(new Error('Server error'));
      processTagsSpy.mockResolvedValue([dbTag1, dbTag2]);

      const response = await supertest(app).post('/community/saveCommunity').send(newCommunity);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /joinCommunity', () => {
    it('should allow a user to join a community', async () => {
      const communityTitle = 'Community 1';
      const username = 'user1';

      const mockRequest = {
        title: communityTitle,
        username,
      };

      joinCommunitySpy.mockResolvedValue(community1);

      const response = await supertest(app).post(`/community/joinCommunity`).send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return status 400 if the request body does not have a title', async () => {
      const mockRequest = { username: 'user1' };
      const response = await supertest(app).post(`/community/joinCommunity`).send(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if the request body does not have a username', async () => {
      const mockRequest = { title: 'Community 1' };
      const response = await supertest(app).post(`/community/joinCommunity`).send(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should return status 500 if there is a server error', async () => {
      const communityTitle = 'Community 1';
      const username = 'user1';

      const mockRequest = {
        title: communityTitle,
        username,
      };

      joinCommunitySpy.mockRejectedValue(new Error('Server error'));

      const response = await supertest(app).post(`/community/joinCommunity`).send(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should return status 500 if there is not a community with the given title', async () => {
      const communityTitle = 'Community 1';
      const username = 'user1';
      const mockRequest = {
        title: communityTitle,
        username,
      };
      joinCommunitySpy.mockResolvedValue(null);
      const response = await supertest(app).post(`/community/joinCommunity`).send(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('POST /leaveCommunity', () => {
    it('should allow a user to leave a community', async () => {
      const communityTitle = 'Community 1';
      const username = 'user1';

      const mockRequest = {
        title: communityTitle,
        username,
      };

      leaveCommunitySpy.mockResolvedValue(community1);

      const response = await supertest(app).post(`/community/leaveCommunity`).send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return status 400 if the request body does not have a title', async () => {
      const mockRequest = { username: 'user1' };
      const response = await supertest(app).post(`/community/leaveCommunity`).send(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should return status 400 if the request body does not have a username', async () => {
      const mockRequest = { title: 'Community 1' };
      const response = await supertest(app).post(`/community/leaveCommunity`).send(mockRequest);
      expect(response.status).toBe(400);
    });

    it('should return status 500 if there is a server error', async () => {
      const communityTitle = 'Community 1';
      const username = 'user1';

      const mockRequest = {
        title: communityTitle,
        username,
      };

      leaveCommunitySpy.mockRejectedValue(new Error('Server error'));

      const response = await supertest(app).post(`/community/leaveCommunity`).send(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should return status 500 if there is not a community with the given title', async () => {
      const communityTitle = 'Community 1';
      const username = 'user1';
      const mockRequest = {
        title: communityTitle,
        username,
      };
      leaveCommunitySpy.mockResolvedValue(null);
      const response = await supertest(app).post(`/community/leaveCommunity`).send(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('GET /getCommunityById/:id', () => {
    it('should return the community with the given ID', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      getCommunityByIdSpy.mockResolvedValue(community1);
      const response = await supertest(app).get(`/community/getCommunityById/${communityId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      getCommunityByIdSpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app).get(`/community/getCommunityById/${communityId}`);
      expect(response.status).toBe(500);
    });
  });

  describe('POST /community/addQuestionToCommunity', () => {
    let addQuestionSpy: jest.SpyInstance;
    let getQuestionSpy: jest.SpyInstance;
    let notifySpy: jest.SpyInstance;

    beforeEach(() => {
      addQuestionSpy = addQuestionToCommunitySpy.mockResolvedValue(community1);
      getQuestionSpy = getQuestionByIdSpy.mockResolvedValue(mockDatabaseQuestion);

      // Mocking the singleton method
      notifySpy = jest
        .spyOn(UserNotificationManager.getInstance(), 'notifyOnlineUsersInCommunity')
        .mockImplementation(async () => Promise.resolve());
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should add the question to the community and notify users', async () => {
      const mockRequest = {
        communityId: 'community-id-1',
        questionId: 'question-id-1',
      };

      const response = await supertest(app)
        .post('/community/addQuestionToCommunity')
        .send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));

      expect(addQuestionSpy).toHaveBeenCalledWith(mockRequest.communityId, mockRequest.questionId);
      expect(getQuestionSpy).toHaveBeenCalledWith(mockRequest.questionId);
      expect(notifySpy).toHaveBeenCalledWith(
        community1.title,
        'All Questions',
        `A new question has been posted in ${community1.title}. Check it out!`,
        [mockDatabaseQuestion.askedBy],
        mockDatabaseQuestion._id.toString(),
      );
    });

    it('should handle errors and return 500 status', async () => {
      addQuestionSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).post('/community/addQuestionToCommunity').send({
        communityId: 'community-id-1',
        questionId: 'question-id-1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when adding question to community: Database error');
      expect(notifySpy).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /deleteQuestionFromCommunity/:communityId/:questionId', () => {
    it('should delete the question from the community', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const questionId = '65e9b58910afe6e94fc6e6dc';
      removeQuestionFromCommunitySpy.mockResolvedValue(community1);
      const response = await supertest(app).delete(
        `/community/deleteQuestionFromCommunity/${communityId}/${questionId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const questionId = '65e9b58910afe6e94fc6e6dc';
      removeQuestionFromCommunitySpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app).delete(
        `/community/deleteQuestionFromCommunity/${communityId}/${questionId}`,
      );
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /updateCommunityRole', () => {
    it('should update the community role successfully', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const username = 'user1';
      const role = 'admin';

      const mockRequest = {
        communityId,
        username,
        role,
      };

      updateUserRoleSpy.mockResolvedValue(community1);

      const response = await supertest(app)
        .patch(`/community/updateCommunityRole`)
        .send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return 500 if there is not a community with the given ID', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const username = 'user1';
      const role = 'admin';
      const mockRequest = {
        communityId,
        username,
        role,
      };
      updateUserRoleSpy.mockResolvedValue(null);
      const response = await supertest(app)
        .patch(`/community/updateCommunityRole`)
        .send(mockRequest);
      expect(response.status).toBe(500);
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const username = 'user1';
      const role = 'admin';
      const mockRequest = {
        communityId,
        username,
        role,
      };
      updateUserRoleSpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app)
        .patch(`/community/updateCommunityRole`)
        .send(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /addUserToCommunity', () => {
    it('should add a user to the community successfully', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const username = 'user1';

      const mockRequest = {
        communityId,
        username,
      };

      addUserToCommunitySpy.mockResolvedValue(community1);

      const response = await supertest(app)
        .patch(`/community/addUserToCommunity`)
        .send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const username = 'user1';
      const mockRequest = {
        communityId,
        username,
      };
      addUserToCommunitySpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app)
        .patch(`/community/addUserToCommunity`)
        .send(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /pinQuestion', () => {
    it('should pin a question successfully', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const questionId = '65e9b58910afe6e94fc6e6dc';

      const mockRequest = {
        communityId,
        questionId,
      };

      pinQuestionSpy.mockResolvedValue(community1);

      const response = await supertest(app).patch(`/community/pinQuestion`).send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const questionId = '65e9b58910afe6e94fc6e6dc';
      const mockRequest = {
        communityId,
        questionId,
      };
      pinQuestionSpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app).patch(`/community/pinQuestion`).send(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /unpinQuestion', () => {
    it('should unpin a question successfully', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const questionId = '65e9b58910afe6e94fc6e6dc';

      const mockRequest = {
        communityId,
        questionId,
      };

      unpinQuestionSpy.mockResolvedValue(community1);

      const response = await supertest(app).patch(`/community/unpinQuestion`).send(mockRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(community1)));
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const questionId = '65e9b58910afe6e94fc6e6dc';
      const mockRequest = {
        communityId,
        questionId,
      };
      unpinQuestionSpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app).patch(`/community/unpinQuestion`).send(mockRequest);
      expect(response.status).toBe(500);
    });
  });

  describe('GET /getTagsForCommunity/:communityId', () => {
    it('should return the tags for the given community ID', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      const tags = [dbTag1, dbTag2];

      getTagsForCommunitySpy.mockResolvedValue(tags);

      const response = await supertest(app).get(`/community/getTagsForCommunity/${communityId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(tags)));
    });

    it('should return 500 if there is a server error', async () => {
      const communityId = '65e9b5a995b6c7045a30d823';
      getTagsForCommunitySpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app).get(`/community/getTagsForCommunity/${communityId}`);
      expect(response.status).toBe(500);
    });
  });

  describe('GET /getAllCommunityTags', () => {
    it('should return all community tags', async () => {
      const tags = [dbTag1, dbTag2];

      getAllCommunityTagsSpy.mockResolvedValue(tags);

      const response = await supertest(app).get(`/community/getAllCommunityTags`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(tags)));
    });

    it('should return 500 if there is a server error', async () => {
      getAllCommunityTagsSpy.mockRejectedValue(new Error('Server error'));
      const response = await supertest(app).get(`/community/getAllCommunityTags`);
      expect(response.status).toBe(500);
    });
  });
});
