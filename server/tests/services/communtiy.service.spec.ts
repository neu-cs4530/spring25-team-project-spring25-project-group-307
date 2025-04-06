import { ObjectId } from 'mongodb';
import CommunityModel from '../../models/communities.model';
import UserModel from '../../models/users.model';
import {
  addCommunity,
  getCommunities,
  getCommunitiesByQuestion,
  getCommunitiesBySearch,
  getCommunitiesByTag,
  getCommunitiesByUser,
  joinCommunity,
  leaveCommunity,
} from '../../services/community.service';
import {
  tag1,
  tag3,
  safeUser,
  safeUser2,
  safeUser3,
  COMMUNITIES,
  newCommunity1,
} from '../mockData.models';
import * as userService from '../../services/user.service';

jest.mock('../../services/user.service');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Community model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('getCommunities', () => {
    it('should return all communities from the database', async () => {
      mockingoose(CommunityModel).toReturn(COMMUNITIES, 'find');

      const result = await getCommunities();

      expect(result.length).toBe(COMMUNITIES.length);
      expect(result[0]._id).toEqual(COMMUNITIES[0]._id);
      expect(result[1]._id).toEqual(COMMUNITIES[1]._id);
      expect(result[2]._id).toEqual(COMMUNITIES[2]._id);
    });

    it('should return an empty array when no communities are found', async () => {
      mockingoose(CommunityModel).toReturn([], 'find');
      const result = await getCommunities();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return an empty array when there is a database error', async () => {
      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'find');
      const result = await getCommunities();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getCommunitiesBySearch', () => {
    it('should return communities that match the search', async () => {
      mockingoose(CommunityModel).toReturn(COMMUNITIES.slice(1, 2), 'find');
      const result = await getCommunitiesBySearch('Community 2');
      expect(result.length).toBe(1);
      expect(result[0]._id).toEqual(COMMUNITIES[1]._id);
      expect(result[0].title).toEqual(COMMUNITIES[1].title);
    });
    it('should return an empty array when no communities match the search', async () => {
      mockingoose(CommunityModel).toReturn([], 'find');
      const result = await getCommunitiesBySearch('Nonexistent Community');
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
    it('should return an empty array when there is a database error', async () => {
      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'find');
      const result = await getCommunitiesBySearch('Community 1');
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
    it('should return all communities when the search term is empty', async () => {
      mockingoose(CommunityModel).toReturn(COMMUNITIES, 'find');
      const result = await getCommunitiesBySearch('');
      expect(result.length).toBe(COMMUNITIES.length);
      expect(result[0]._id).toEqual(COMMUNITIES[0]._id);
      expect(result[1]._id).toEqual(COMMUNITIES[1]._id);
      expect(result[2]._id).toEqual(COMMUNITIES[2]._id);
    });
  });

  describe('getCommunitiesByTag', () => {
    it('should return communities that match the tag', async () => {
      const communitiesWithTag = COMMUNITIES.filter(community =>
        community.tags.some(t => t === tag1._id),
      );
      const tagId = tag1._id.toString();
      mockingoose(CommunityModel).toReturn(communitiesWithTag, 'find');
      const result = await getCommunitiesByTag(tagId);
      expect(result.length).toBe(communitiesWithTag.length);
      expect(result[0]._id).toEqual(communitiesWithTag[0]._id);
      expect(result[1]._id).toEqual(communitiesWithTag[1]._id);
    });

    it('should return an empty array when no communities match the tag', async () => {
      const tagId = tag3._id.toString();
      mockingoose(CommunityModel).toReturn([], 'find');
      const result = await getCommunitiesByTag(tagId);
      expect(result).toEqual([]);
    });

    it('should return an empty array when there is a database error', async () => {
      const tagId = tag1._id.toString();
      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'find');
      const result = await getCommunitiesByTag(tagId);
      expect(result).toEqual([]);
    });
  });

  describe('getCommunitiesByUser', () => {
    it('should return communities that the user is a member of', async () => {
      const { username } = safeUser;
      const communitiesWithUser = COMMUNITIES.slice(0, 2);
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValue(safeUser);
      mockingoose(CommunityModel).toReturn(communitiesWithUser, 'find');
      const result = await getCommunitiesByUser(username);
      expect(result.length).toBe(communitiesWithUser.length);
      expect(result[0]._id).toEqual(communitiesWithUser[0]._id);
      expect(result[1]._id).toEqual(communitiesWithUser[1]._id);
    });

    it('should return communities that the user is an admin of', async () => {
      const { username } = safeUser2;
      // Filter communities where the user is in members, admins, or moderators
      const communitiesWithUser = COMMUNITIES.filter(
        community =>
          community.members.some(member => member === safeUser2._id) ||
          community.admins.some(admin => admin === safeUser2._id) ||
          community.moderators.some(mod => mod === safeUser2._id),
      );
      mockingoose(UserModel).toReturn(safeUser2, 'findOneAndUpdate');
      mockingoose(CommunityModel).toReturn(communitiesWithUser, 'find');
      const result = await getCommunitiesByUser(username);
      expect(result.length).toBe(communitiesWithUser.length);
      expect(result[0]._id).toEqual(communitiesWithUser[0]._id);
      expect(result[1]._id).toEqual(communitiesWithUser[1]._id);
    });

    it('should return an empty array when no communities match the user', async () => {
      const { username } = safeUser3;
      // Filter communities where the user is in members, admins, or moderators
      const noCommunitiesWithUser = COMMUNITIES.filter(
        community =>
          community.members.some(member => member === safeUser3._id) ||
          community.admins.some(admin => admin === safeUser3._id) ||
          community.moderators.some(mod => mod === safeUser3._id),
      );
      mockingoose(CommunityModel).toReturn(noCommunitiesWithUser, 'find');
      const result = await getCommunitiesByUser(username);
      expect(result).toEqual([]);
    });

    it('should return an empty array when there is a database error', async () => {
      const { username } = safeUser;
      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'find');
      const result = await getCommunitiesByUser(username);
      expect(result).toEqual([]);
    });

    it('should return an empty array when the user does not exist', async () => {
      const { username } = safeUser3;
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValue({ error: 'User not found' });
      const result = await getCommunitiesByUser(username);
      expect(result).toEqual([]);
    });
  });

  describe('getCommunitiesByQuestion', () => {
    it('should return communities that have the question', async () => {
      mockingoose(CommunityModel).toReturn(COMMUNITIES.slice(1, 2), 'find');
      const result = await getCommunitiesByQuestion('questionId');
      expect(result.length).toBe(1);
      expect(result[0]._id).toEqual(COMMUNITIES[1]._id);
    });
    it('should return an empty array when no communities match the question', async () => {
      mockingoose(CommunityModel).toReturn([], 'find');
      const result = await getCommunitiesByQuestion('nonexistentQuestionId');
      expect(result).toEqual([]);
    });
    it('should return an empty array when there is a database error', async () => {
      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'find');
      const result = await getCommunitiesByQuestion('questionId');
      expect(result).toEqual([]);
    });
  });

  describe('addCommunity', () => {
    it('should add a new community to the database', async () => {
      const newCommunity = newCommunity1;
      mockingoose(CommunityModel).toReturn(null, 'findOne');
      mockingoose(CommunityModel).toReturn(newCommunity, 'create');
      const result = await addCommunity(newCommunity);
      expect(result?._id).toBeDefined();
      expect(result?.title).toEqual(newCommunity.title);
      expect(result?.description).toEqual(newCommunity.description);
      expect(result?.isPrivate).toEqual(newCommunity.isPrivate);
      expect(result?.admins).toEqual(newCommunity.admins);
      expect(result?.moderators).toEqual(newCommunity.moderators);
      expect(result?.members).toEqual(newCommunity.members);
      expect(result?.pinnedQuestions).toEqual(newCommunity.pinnedQuestions);
      expect(result?.questions).toEqual(newCommunity.questions);
      expect(result?.tags).toEqual(newCommunity.tags);
    });

    it('should return the existing community when the community already exists', async () => {
      const existingCommunity = {
        _id: new ObjectId(),
        title: 'Existing Community',
        description: 'This is an existing community',
        isPrivate: false,
        admins: [],
        moderators: [],
        members: [],
        pinnedQuestions: [],
        questions: [],
        tags: [],
      };

      mockingoose(CommunityModel).toReturn(existingCommunity, 'findOne');
      const result = await addCommunity(existingCommunity);
      expect(result?._id).toEqual(existingCommunity._id);
    });

    it('should return null when there is a database error while finding one', async () => {
      const newCommunity = newCommunity1;

      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'findOne');
      mockingoose(CommunityModel).toReturn(newCommunity, 'create');
      const result = await addCommunity(newCommunity);
      expect(result).toBeNull();
    });

    it('should return null when there is a database error while creating', async () => {
      const newCommunity = newCommunity1;

      // Mock findOne to return null so it proceeds to create
      jest.spyOn(CommunityModel, 'findOne').mockResolvedValue(null);
      // Mock create to throw an error
      jest.spyOn(CommunityModel, 'create').mockRejectedValue(new Error('Database error'));
      const result = await addCommunity(newCommunity);
      expect(result).toBeNull();
    });
  });

  describe('joinCommunity', () => {
    const mockUser = safeUser3;

    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should return updated community if user joins successfully', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      // First findOne (check if user is already a member) returns null
      mockingoose(CommunityModel).toReturn(null, 'findOne');

      const updatedCommunity = {
        _id: new ObjectId('65e9b5a995b6c7045a30d823'),
        title: 'Test Community',
        members: [mockUser._id],
      };

      // Then findOneAndUpdate returns the updated community
      mockingoose(CommunityModel).toReturn(updatedCommunity, 'findOneAndUpdate');

      const result = await joinCommunity('Test Community', 'testuser');

      expect(result).toMatchObject(updatedCommunity);
    });

    it('should return null if there is an error while finding the user', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue({ error: 'User not found' });
      mockingoose(CommunityModel).toReturn(null, 'findOne');
      const result = await joinCommunity('Test Community', 'testuser');
      expect(result).toBeNull();
    });

    it('should return null if the user is already a member', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      const existingCommunity = {
        _id: new ObjectId('65e9b5a995b6c7045a30d823'),
        title: 'Test Community',
        members: [mockUser._id],
      };
      jest.spyOn(CommunityModel, 'findOne').mockResolvedValue(existingCommunity);
      const result = await joinCommunity('Test Community', 'testuser');
      expect(result).toBeNull();
    });

    it('should return null if there is a database error while finding the community', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(CommunityModel, 'findOne').mockRejectedValue(new Error('Database error'));
      const result = await joinCommunity('Test Community', 'testuser');
      expect(result).toBeNull();
    });

    it('should return null if there is a database error while updating the community', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      mockingoose(CommunityModel).toReturn(null, 'findOne');
      jest.spyOn(CommunityModel, 'findOneAndUpdate').mockRejectedValue(new Error('Database error'));
      const result = await joinCommunity('Test Community', 'testuser');
      expect(result).toBeNull();
    });
  });

  describe('leaveCommunity', () => {
    const mockUser = safeUser3;

    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should return updated community if user leaves successfully', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const updatedCommunity = {
        _id: new ObjectId('65e9b5a995b6c7045a30d823'),
        title: 'Test Community',
        members: [],
      };

      // Then findOneAndUpdate returns the updated community
      jest.spyOn(CommunityModel, 'findOneAndUpdate').mockResolvedValue(updatedCommunity);

      const result = await leaveCommunity('Test Community', 'testuser');

      expect(result).toMatchObject(updatedCommunity);
    });

    it('should return null if there is an error while finding the user', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue({ error: 'User not found' });
      const result = await leaveCommunity('Test Community', 'testuser');
      expect(result).toBeNull();
    });

    it('should return null if the user is not a member', async () => {
      (userService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      // Then findOneAndUpdate returns the updated community
      jest.spyOn(CommunityModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await leaveCommunity('Test Community', 'testuser');

      expect(result).toBeNull();
    });

    it('should return null if there is a database error while finding the user', async () => {
      jest.spyOn(userService, 'getUserByUsername').mockRejectedValue(new Error('Database error'));
      const result = await leaveCommunity('Test Community', 'testuser');
      expect(result).toBeNull();
    });
  });
});
