import mongoose, { Query } from 'mongoose';
import { ObjectId } from 'mongodb';
import UserModel from '../../models/users.model';
import {
  addUserSavedQuestion,
  deleteUserByUsername,
  getUserById,
  getUserByUsername,
  getUsersList,
  getUserWithSavedQuestions,
  loginUser,
  removeUserSavedQuestion,
  saveUser,
  updateUser,
} from '../../services/user.service';
import * as feedUtil from '../../services/feed.service';
import { DatabaseUser, SafeDatabaseUser, User, UserCredentials } from '../../types/types';
import { user, safeUser, QUESTIONS } from '../mockData.models';
import FeedModel from '../../models/feed.model';
import FeedItemModel from '../../models/feedItem.model';
import InterestModel from '../../models/interest.model';
import CommunityModel from '../../models/communities.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeDatabaseUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if result of create is null', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockResolvedValueOnce(null as unknown as ReturnType<typeof UserModel.create>);
      const saveError = await saveUser(user);
      expect('error' in saveError).toBe(true);
      expect(saveError).toEqual({
        error: 'Error occurred when saving user: Error: Failed to create user',
      });
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveUser(user);

      expect('error' in saveError).toBe(true);
    });

    it('should throw an error if error when creating feed for user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      jest.spyOn(FeedModel, 'create').mockRejectedValueOnce(() => new Error('Error creating feed'));
      jest.spyOn(feedUtil, 'saveFeed').mockResolvedValueOnce({ error: 'Error creating feed' });

      const saveError = await saveUser(user);

      expect(saveError).toEqual({
        error: 'Error occurred when saving user: Error: Failed to create feed for new user',
      });
    });
  });

  describe('getUserByUsername', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the matching user', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOneAndUpdate');

      const retrievedUser = (await getUserByUsername(user.username)) as SafeDatabaseUser;

      expect(retrievedUser.username).toEqual(user.username);
      expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if the user is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const getUserError = await getUserByUsername(user.username);

      expect('error' in getUserError).toBe(true);
    });

    it('should throw an error if there is an error while searching the database', async () => {
      mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');

      const getUserError = await getUserByUsername(user.username);

      expect('error' in getUserError).toBe(true);
    });
  });

  describe('getUserById', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    const mockUser: DatabaseUser = {
      _id: new ObjectId(),
      username: 'user1',
      password: 'password123',
      dateJoined: new Date('2024-12-03'),
      biography: 'I am a user',
      ranking: 'Newcomer Newbie',
      score: 0,
      achievements: [],
      questionsAsked: 0,
      responsesGiven: 0,
      lastLogin: new Date('2024-12-03'),
      savedQuestions: [],
      nimGameWins: 0,
      upVotesGiven: 0,
      downVotesGiven: 0,
      commentsMade: 0,
    };

    it('should return the matching user', async () => {
      mockingoose(UserModel).toReturn(mockUser, 'findOne');

      const retrievedUser = await getUserById(mockUser._id);

      expect(retrievedUser).toMatchObject(mockUser);
    });

    it('should throw an error if the user is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const getUserError = await getUserById(mockUser._id);

      expect('error' in getUserError).toBe(true);
      expect(getUserError).toEqual({
        error: `Error occurred when finding user: Error: User not found`,
      });
    });
  });

  describe('getUsersList', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the users', async () => {
      mockingoose(UserModel).toReturn([safeUser], 'find');

      const retrievedUsers = (await getUsersList()) as SafeDatabaseUser[];

      expect(retrievedUsers[0].username).toEqual(safeUser.username);
      expect(retrievedUsers[0].dateJoined).toEqual(safeUser.dateJoined);
    });

    it('should throw an error if the users cannot be found', async () => {
      mockingoose(UserModel).toReturn(null, 'find');

      const getUsersError = await getUsersList();

      expect('error' in getUsersError).toBe(true);
    });

    it('should throw an error if there is an error while searching the database', async () => {
      mockingoose(UserModel).toReturn(new Error('Error finding document'), 'find');

      const getUsersError = await getUsersList();

      expect('error' in getUsersError).toBe(true);
    });
  });

  describe('loginUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the user if authentication succeeds', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOne');

      const credentials: UserCredentials = {
        username: user.username,
        password: user.password,
      };

      const loggedInUser = (await loginUser(credentials)) as SafeDatabaseUser;

      expect(loggedInUser.username).toEqual(user.username);
      expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should return the user if the password fails', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const credentials: UserCredentials = {
        username: user.username,
        password: 'wrongPassword',
      };

      const loginError = await loginUser(credentials);

      expect('error' in loginError).toBe(true);
    });

    it('should return the user is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const credentials: UserCredentials = {
        username: 'wrongUsername',
        password: user.password,
      };

      const loginError = await loginUser(credentials);

      expect('error' in loginError).toBe(true);
    });
  });

  describe('deleteUserByUsername', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    const feed = {
      _id: new mongoose.Types.ObjectId(),
      userId: safeUser._id,
      lastViewedRanking: 0,
    };

    const deleteRes = {
      deletedCount: 0,
    };

    const community = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Community 1',
      description: 'Description 1',
      isPrivate: false,
      admins: [safeUser._id],
      moderators: [safeUser._id],
      members: [safeUser._id],
      questions: [],
      pinnedQuestions: [],
      tags: [],
    };
    const communities = [community];

    it('should return the deleted user when deleted succesfully', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');
      mockingoose(FeedModel).toReturn(feed._id, 'findOne');
      mockingoose(FeedModel).toReturn(feed, 'findOneAndDelete');
      mockingoose(FeedItemModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(InterestModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(CommunityModel).toReturn(communities, 'find');
      mockingoose(CommunityModel).toReturn(community, 'findOneAndUpdate');

      const deletedUser = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

      expect(deletedUser.username).toEqual(user.username);
      expect(deletedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if the username is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOneAndDelete');

      const deletedError = await deleteUserByUsername(user.username);

      expect('error' in deletedError).toBe(true);
    });

    it('should throw an error if a database error while deleting', async () => {
      mockingoose(UserModel).toReturn(new Error('Error deleting object'), 'findOneAndDelete');

      const deletedError = await deleteUserByUsername(user.username);

      expect('error' in deletedError).toBe(true);
    });

    it('should throw an error if a database error while finding the feed', async () => {
      const feedError = { error: 'Error finding feed' };

      mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');
      jest.spyOn(feedUtil, 'getFeedByUserId').mockResolvedValueOnce(feedError);
      mockingoose(FeedModel).toReturn(feed, 'findOneAndDelete');
      mockingoose(FeedItemModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(InterestModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(CommunityModel).toReturn(communities, 'find');
      mockingoose(CommunityModel).toReturn(community, 'findOneAndUpdate');

      const errorResponse = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

      expect(errorResponse).toEqual({
        error: 'Error occurred when finding user: Error: Failed to find feed for user',
      });
    });

    it('should throw an error if a database error while deleting feed items', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');
      mockingoose(FeedModel).toReturn(feed._id, 'findOne');
      mockingoose(FeedModel).toReturn(feed, 'findOneAndDelete');
      mockingoose(FeedItemModel).toReturn(null, 'deleteMany');
      mockingoose(InterestModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(CommunityModel).toReturn(communities, 'find');
      mockingoose(CommunityModel).toReturn(community, 'findOneAndUpdate');

      const errorResponse = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

      expect(errorResponse).toEqual({
        error: 'Error occurred when finding user: Error: Failed to delete feed items for user',
      });
    });

    it('should throw an error if a database error while deleting feed', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');
      mockingoose(FeedModel).toReturn(feed._id, 'findOne');
      mockingoose(FeedModel).toReturn(null, 'findOneAndDelete');
      mockingoose(FeedItemModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(InterestModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(CommunityModel).toReturn(communities, 'find');
      mockingoose(CommunityModel).toReturn(community, 'findOneAndUpdate');

      const errorResponse = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

      expect(errorResponse).toEqual({
        error: 'Error occurred when finding user: Error: Failed to delete feed for user',
      });
    });

    it('should throw an error if a database error while deleting interests', async () => {
      const interestError = { error: 'Failed to delete interests' };

      mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');
      mockingoose(FeedModel).toReturn(feed._id, 'findOne');
      mockingoose(FeedModel).toReturn(feed, 'findOneAndDelete');
      mockingoose(FeedItemModel).toReturn(deleteRes, 'deleteMany');
      mockingoose(InterestModel).toReturn(interestError, 'deleteMany');
      mockingoose(CommunityModel).toReturn(communities, 'find');
      mockingoose(CommunityModel).toReturn(community, 'findOneAndUpdate');

      const errorResponse = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

      expect(errorResponse).toEqual({
        error: 'Error occurred when finding user: Error: Failed to delete interests for user',
      });
    });
  });

  describe('updateUser', () => {
    const updatedUser: User = {
      ...user,
      password: 'newPassword',
    };

    const safeUpdatedUser: SafeDatabaseUser = {
      _id: new mongoose.Types.ObjectId(),
      username: user.username,
      dateJoined: user.dateJoined,
      biography: user.biography,
      ranking: user.ranking,
      score: user.score,
      achievements: user.achievements,
      questionsAsked: user.questionsAsked,
      responsesGiven: user.responsesGiven,
      lastLogin: user.lastLogin,
      savedQuestions: user.savedQuestions,
      nimGameWins: user.nimGameWins,
      upVotesGiven: user.upVotesGiven,
      downVotesGiven: user.downVotesGiven,
      commentsMade: user.commentsMade,
    };

    const updates: Partial<User> = {
      password: 'newPassword',
    };

    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the updated user when updated succesfully', async () => {
      mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

      const result = (await updateUser(user.username, updates)) as SafeDatabaseUser;

      expect(result.username).toEqual(user.username);
      expect(result.username).toEqual(updatedUser.username);
      expect(result.dateJoined).toEqual(user.dateJoined);
      expect(result.dateJoined).toEqual(updatedUser.dateJoined);
    });

    it('should throw an error if the username is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

      const updatedError = await updateUser(user.username, updates);

      expect('error' in updatedError).toBe(true);
    });

    it('should throw an error if a database error while deleting', async () => {
      mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

      const updatedError = await updateUser(user.username, updates);

      expect('error' in updatedError).toBe(true);
    });

    it('should update the biography if the user is found', async () => {
      const newBio = 'This is a new biography';
      // Make a new partial updates object just for biography
      const biographyUpdates: Partial<User> = { biography: newBio };

      // Mock the DB to return a safe user (i.e., no password in results)
      mockingoose(UserModel).toReturn(
        { ...safeUpdatedUser, biography: newBio },
        'findOneAndUpdate',
      );

      const result = await updateUser(user.username, biographyUpdates);

      // Check that the result is a SafeUser and the biography got updated
      if ('username' in result) {
        expect(result.biography).toEqual(newBio);
      } else {
        throw new Error('Expected a safe user, got an error object.');
      }
    });

    it('should return an error if biography update fails because user not found', async () => {
      // Simulate user not found
      mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

      const newBio = 'No user found test';
      const biographyUpdates: Partial<User> = { biography: newBio };
      const updatedError = await updateUser(user.username, biographyUpdates);

      expect('error' in updatedError).toBe(true);
    });
  });

  describe('addUserSavedQuestion', () => {
    it('should return the updated user when updated succesfully', async () => {
      const newQuestionId = new mongoose.Types.ObjectId();
      const updatedUser: SafeDatabaseUser = {
        ...user,
        _id: new mongoose.Types.ObjectId(),
        savedQuestions: [newQuestionId],
      };

      mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

      const result = (await addUserSavedQuestion(user.username, newQuestionId)) as SafeDatabaseUser;

      expect(result.savedQuestions).toEqual(updatedUser.savedQuestions);
    });
    it('should throw an error if the username is not found', async () => {
      const newQuestionId = new mongoose.Types.ObjectId();
      mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

      const updatedError = await addUserSavedQuestion(user.username, newQuestionId);

      expect('error' in updatedError).toBe(true);
    });
    it('should throw an error if a database error while deleting', async () => {
      const newQuestionId = new mongoose.Types.ObjectId();
      mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

      const updatedError = await addUserSavedQuestion(user.username, newQuestionId);

      expect('error' in updatedError).toBe(true);
    });
  });

  describe('removeUserSavedQuestion', () => {
    it('should return the updated user when updated succesfully', async () => {
      const originalUser: SafeDatabaseUser = {
        ...user,
        _id: new mongoose.Types.ObjectId(),
        savedQuestions: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      };
      const questionToRemove = originalUser.savedQuestions[0];
      const updatedUser: SafeDatabaseUser = {
        ...originalUser,
        savedQuestions: originalUser.savedQuestions.filter(
          question => question !== questionToRemove,
        ),
      };

      mockingoose(UserModel).toReturn(updatedUser, 'findOneAndUpdate');

      const result = (await removeUserSavedQuestion(
        originalUser.username,
        questionToRemove,
      )) as SafeDatabaseUser;

      expect(result.savedQuestions).toEqual(updatedUser.savedQuestions);
    });
    it('should throw an error if the username is not found', async () => {
      const questionToRemove = new mongoose.Types.ObjectId();
      mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

      const updatedError = await removeUserSavedQuestion(user.username, questionToRemove);

      expect('error' in updatedError).toBe(true);
    });
    it('should throw an error if a database error while deleting', async () => {
      const questionToRemove = new mongoose.Types.ObjectId();
      mockingoose(UserModel).toReturn(new Error('Error updating object'), 'findOneAndUpdate');

      const updatedError = await removeUserSavedQuestion(user.username, questionToRemove);

      expect('error' in updatedError).toBe(true);
    });
  });

  describe('getUserWithSavedQuestions', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it('should return the user with saved questions', async () => {
      const populatedUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        savedQuestions: [QUESTIONS[0], QUESTIONS[1]],
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(populatedUser),
      } as unknown as Query<SafeDatabaseUser, SafeDatabaseUser>;

      jest.spyOn(UserModel, 'findOne').mockReturnValue(mockQuery);

      const result = await getUserWithSavedQuestions(populatedUser.username);

      expect(result).toEqual(populatedUser);
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: populatedUser.username });
    });
    it('should return the user with saved questions', async () => {
      const populatedUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        savedQuestions: [QUESTIONS[0], QUESTIONS[1]],
      };

      jest.spyOn(UserModel, 'findOne').mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null), // Simulates no user found
      } as unknown as Query<SafeDatabaseUser, SafeDatabaseUser>);

      const result = await getUserWithSavedQuestions(populatedUser.username);

      expect('error' in result).toBe(true);
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: populatedUser.username });
    });
    it('should throw an error if there is an error while searching the database', async () => {
      mockingoose(UserModel).toReturn(new Error('Error finding document'), 'findOne');

      const getUserError = await getUserWithSavedQuestions(user.username);

      expect('error' in getUserError).toBe(true);
    });
    it('should throw an error if there is an error while populating the saved questions', async () => {
      mockingoose(UserModel).toReturn(new Error('Error populating document'), 'findOne');

      const getUserError = await getUserWithSavedQuestions(user.username);

      expect('error' in getUserError).toBe(true);
    });
  });
});
