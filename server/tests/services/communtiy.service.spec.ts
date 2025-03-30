import { ObjectId } from 'mongodb';
import CommunityModel from '../../models/communities.model';
import UserModel from '../../models/users.model';
import {
  addCommunity,
  getCommunities,
  getCommunitiesByTag,
  getCommunitiesByUser,
} from '../../services/community.service';
import { tag1, tag3, safeUser, safeUser2, safeUser3, COMMUNITIES } from '../mockData.models';

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
      // Filter communities where the user is in members, admins, or moderators
      const communitiesWithUser = COMMUNITIES.filter(
        community =>
          community.members.some(member => member === safeUser._id) ||
          community.admins.some(admin => admin === safeUser._id) ||
          community.moderators.some(mod => mod === safeUser._id),
      );
      mockingoose(UserModel).toReturn(safeUser, 'findOneAndUpdate');
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
  });

  describe('addCommunity', () => {
    it('should add a new community to the database', async () => {
      const newCommunity = {
        _id: new ObjectId(),
        title: 'New Community',
        description: 'This is a new community',
        isPrivate: false,
        admins: [],
        moderators: [],
        members: [],
        pinnedQuestions: [],
        questions: [],
        tags: [],
      };

      mockingoose(CommunityModel).toReturn(null, 'findOne');
      mockingoose(CommunityModel).toReturn(newCommunity, 'create');
      const result = await addCommunity(newCommunity);
      expect(result?._id).toEqual(newCommunity._id);
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
  });
});
