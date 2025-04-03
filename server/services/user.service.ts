import { ObjectId } from 'mongodb';
import UserModel from '../models/users.model';
import {
  DatabaseUser,
  SafeDatabaseUser,
  User,
  UserCredentials,
  UserResponse,
  UsersResponse,
} from '../types/types';
import { deleteFeedByUserId, getFeedByUserId, saveFeed } from './feed.service';
import { deleteFeedItemsByFeedId } from './feedItem.service';
import { deleteInterestsByUserId } from './interest.service';

/**
 * Saves a new user to the database.
 *
 * @param {User} user - The user object to be saved, containing user details like username, password, etc.
 * @returns {Promise<UserResponse>} - Resolves with the saved user object (without the password) or an error message.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const result: DatabaseUser = await UserModel.create({
      ...user,
    });

    if (!result) {
      throw Error('Failed to create user');
    }

    const feed = await saveFeed({ userId: result._id, lastViewedRanking: 0 });

    if ('error' in feed) {
      throw Error('Failed to create feed for new user');
    }

    // Remove password field from returned object
    const safeUser: SafeDatabaseUser = {
      _id: result._id,
      username: result.username,
      dateJoined: result.dateJoined,
      biography: result.biography,
      ranking: result.ranking,
      score: result.score,
      achievements: result.achievements,
      // adding in the addtional parameters
      questionsAsked: result.questionsAsked,
      responsesGiven: result.responsesGiven,
      lastLogin: result.lastLogin,
      savedQuestions: result.savedQuestions,
      upVotesGiven: result.upVotesGiven,
      downVotesGiven: result.downVotesGiven,
      nimGameWins: result.nimGameWins,
    };

    return safeUser;
  } catch (error) {
    return { error: `Error occurred when saving user: ${error}` };
  }
};

/**
 * Retrieves a user from the database by their username.
 *
 * @param {string} username - The username of the user to find.
 * @returns {Promise<UserResponse>} - Resolves with the found user object (without the password) or an error message.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      // when user logs in, update the last login time to the current time
      { lastLogin: new Date() },
    ).select('-password');

    if (!user) {
      throw Error('User not found');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Retrieves all users from the database.
 * Users documents are returned in the order in which they were created, oldest to newest.
 *
 * @returns {Promise<UsersResponse>} - Resolves with the found user objects (without the passwords) or an error message.
 */
export const getUsersList = async (): Promise<UsersResponse> => {
  try {
    const users: SafeDatabaseUser[] = await UserModel.find().select('-password');

    if (!users) {
      throw Error('Users could not be retrieved');
    }

    return users;
  } catch (error) {
    return { error: `Error occurred when finding users: ${error}` };
  }
};

/**
 * Authenticates a user by verifying their username and password.
 *
 * @param {UserCredentials} loginCredentials - An object containing the username and password.
 * @returns {Promise<UserResponse>} - Resolves with the authenticated user object (without the password) or an error message.
 */
export const loginUser = async (loginCredentials: UserCredentials): Promise<UserResponse> => {
  const { username, password } = loginCredentials;

  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username, password }).select(
      '-password',
    );

    if (!user) {
      throw Error('Authentication failed');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when authenticating user: ${error}` };
  }
};

/**
 * Deletes a user from the database by their username.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<UserResponse>} - Resolves with the deleted user object (without the password) or an error message.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser: SafeDatabaseUser | null = await UserModel.findOneAndDelete({
      username,
    }).select('-password');

    if (!deletedUser) {
      throw Error('Error deleting user');
    }

    const deletedFeedId = await getFeedByUserId(deletedUser._id);

    if ('error' in deletedFeedId) {
      throw Error('Failed to find feed for user');
    }

    const deletedFeedItems = await deleteFeedItemsByFeedId(deletedFeedId._id);

    if ('error' in deletedFeedItems) {
      throw Error('Failed to delete feed items for user');
    }

    const deletedFeed = await deleteFeedByUserId(deletedUser._id);

    if ('error' in deletedFeed) {
      throw Error('Failed to delete feed for user');
    }

    const deletedInterests = await deleteInterestsByUserId(deletedUser._id);

    if ('error' in deletedInterests) {
      throw Error('Failed to delete interests for user');
    }

    return deletedUser;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Updates user information in the database.
 *
 * @param {string} username - The username of the user to update.
 * @param {Partial<User>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object (without the password) or an error message.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>,
): Promise<UserResponse> => {
  try {
    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};

/**
 * Retrieves a user by their ID.
 * @param id The ID of the user to retrieve
 * @returns the user with the given ID or null if an error occurred
 *
 */
export const getUserById = async (id: ObjectId): Promise<UserResponse> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ _id: id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

export const addUserSavedQuestion = async (
  username: string,
  questionId: ObjectId,
): Promise<UserResponse> => {
  try {
    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $push: { savedQuestions: questionId } },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};

export const removeUserSavedQuestion = async (
  username: string,
  questionId: ObjectId,
): Promise<UserResponse> => {
  try {
    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $pull: { savedQuestions: questionId } },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};
