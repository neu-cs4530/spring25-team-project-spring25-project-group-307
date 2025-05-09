import { ObjectId } from 'mongodb';
import {
  Community,
  DatabaseCommunity,
  DatabaseTag,
  PopulatedDatabaseCommunity,
  PopulatedDatabaseCommunityWithTags,
  PopulatedDatabaseQuestion,
  SafeDatabaseUser,
  Tag,
} from '../types/types';
import CommunityModel from '../models/communities.model';
import { getUserByUsername } from './user.service';

/**
 * Retrieves all communities from the database.
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunities = async (): Promise<DatabaseCommunity[]> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find({});
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all communities that match a search query.
 * @param {string} search - The search query to match communities against
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunitiesBySearch = async (search: string): Promise<DatabaseCommunity[]> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find({
      title: { $regex: search, $options: 'i' },
    });
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all communities that match a tag query.
 * @param {string} tagID - The tag query to match communities against
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunitiesByTag = async (tagID: string): Promise<DatabaseCommunity[]> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find({
      tags: { $in: tagID },
    });
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all communities that a user is a member of.
 * @param {string} username - The username of the user to fetch communities for
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunitiesByUser = async (username: string): Promise<DatabaseCommunity[]> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const communities: DatabaseCommunity[] = await CommunityModel.find({
      $or: [{ admins: user._id }, { moderators: user._id }, { members: user._id }],
    });
    return communities;
  } catch (error) {
    return [];
  }
};

const getCommunitiesByQuestion = async (questionId: string): Promise<DatabaseCommunity[]> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find({
      questions: { $in: questionId },
    });

    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Adds a community to the database if it does not already exist.
 *
 * @param {Community} community - The community to add
 * @returns {Promise<Community | null>} - The added or existing community, or `null` if an error occurred
 */
const addCommunity = async (community: Community): Promise<DatabaseCommunity | null> => {
  try {
    // Check if a community with the given name already exists
    const existingCommunity: DatabaseCommunity | null = await CommunityModel.findOne({
      title: community.title,
    });

    if (existingCommunity) {
      return existingCommunity;
    }

    // If the community does not exist, create a new one
    const savedCommunity: DatabaseCommunity = await CommunityModel.create(community);

    return savedCommunity;
  } catch (error) {
    return null;
  }
};

/**
 * Adds a user to a community if they are not already a member.
 * @param title the title of the community to join
 * @param username the username of the user to join the community
 * @returns the community the user joined or null if an error occurred
 */
const joinCommunity = async (
  title: string,
  username: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const filter = {
      title,
    };
    const communityWithUser: DatabaseCommunity | null = await CommunityModel.findOne({
      ...filter,
      members: { $in: user._id },
    });

    if (communityWithUser) {
      throw new Error();
    }

    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      filter,
      {
        $push: { members: user._id },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Removes a user from a community
 * @param title the title of the community to leave
 * @param username the username of the user to leave the community
 * @returns the community the user left or null if an error occurred
 */
const leaveCommunity = async (
  title: string,
  username: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { title },
      {
        $pull: {
          admins: user._id,
          moderators: user._id,
          members: user._id,
        },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves a community by its ID.
 * @param id the ID of the community to retrieve
 * @returns the community with the given ID or null if an error occurred
 */
const getCommunityById = async (id: string): Promise<PopulatedDatabaseCommunity | null> => {
  try {
    const community: PopulatedDatabaseCommunity | null = await CommunityModel.findOne({
      _id: id,
    }).populate<{
      admins: SafeDatabaseUser[];
      moderators: SafeDatabaseUser[];
      members: SafeDatabaseUser[];
      questions: PopulatedDatabaseQuestion[];
      pinnedQuestions: PopulatedDatabaseQuestion[];
      tags: DatabaseTag[];
    }>([
      { path: 'members', model: 'User', select: '-password' },
      { path: 'admins', model: 'User', select: '-password' },
      { path: 'moderators', model: 'User', select: '-password' },
      {
        path: 'questions',
        model: 'Question',
        populate: [
          { path: 'tags', model: 'Tag' },
          { path: 'answers', model: 'Answer', populate: { path: 'comments', model: 'Comment' } },
          { path: 'comments', model: 'Comment' },
        ],
      },
      {
        path: 'pinnedQuestions',
        model: 'Question',
        populate: [
          { path: 'tags', model: 'Tag' },
          { path: 'answers', model: 'Answer', populate: { path: 'comments', model: 'Comment' } },
          { path: 'comments', model: 'Comment' },
        ],
      },
      { path: 'tags', model: 'Tag' },
    ]);

    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Adds a question to a community.
 * @param communityId the ID of the community to add the question to
 * @param questionId the ID of the question to add to the community
 * @returns the community with the added question or null if an error occurred
 */
const addQuestionToCommunity = async (
  communityId: string,
  questionId: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $push: { questions: questionId },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Removes a question from a community.
 * @param communityId the ID of the community to remove the question from
 * @param questionId the ID of the question to remove from the community
 * @returns the community with the removed question or null if an error occurred
 */
const removeQuestionFromCommunity = async (
  communityId: string,
  questionId: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $pull: { questions: questionId },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Updates the role of a user in a community.
 * @param communityId the ID of the community to update the role in
 * @param username the username of the user to update the role for
 * @param role the new role for the user
 * @returns the community with the updated role or null if an error occurred
 */
const updateUserRole = async (
  communityId: ObjectId,
  username: string,
  role: string,
): Promise<DatabaseCommunity | null> => {
  try {
    // Fetch the user by username
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }

    // Validate the role
    const validRoles = ['admins', 'moderators', 'members'];
    if (!validRoles.includes(role.toLowerCase())) {
      throw new Error(`Invalid role: ${role}`);
    }

    // Remove the user from all roles before adding them to the new role
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $pull: {
          admins: user._id,
          moderators: user._id,
          members: user._id,
        },
      },
      { new: true },
    );

    if (!community) {
      throw new Error('Community not found');
    }

    // Add the user to the specified role
    const updatedCommunity: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $addToSet: { [role.toLowerCase()]: user._id }, // Dynamically update the role field
      },
      { new: true },
    );

    return updatedCommunity;
  } catch (error) {
    return null;
  }
};

/**
 * Adds a user to a community by username.
 * @param communityId the ID of the community to add the user to
 * @param username the username of the user to add to the community
 * @returns the community with the added user or null if an error occurred
 */
const addUserToCommunity = async (
  communityId: ObjectId,
  username: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $addToSet: { members: user._id },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Pins a question to the top of a community.
 * @param communityId the ID of the community to pin the question in
 * @param questionId the ID of the question to pin
 * @returns the community with the pinned question or null if an error occurred
 */
const pinQuestion = async (
  communityId: ObjectId,
  questionId: ObjectId,
): Promise<DatabaseCommunity | null> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $addToSet: { pinnedQuestions: questionId },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Unpins a question from the top of a community.
 * @param communityId the ID of the community to unpin the question in
 * @param questionId the ID of the question to unpin
 * @returns the community with the unpinned question or null if an error occurred
 */
const unpinQuestion = async (
  communityId: ObjectId,
  questionId: ObjectId,
): Promise<DatabaseCommunity | null> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $pull: { pinnedQuestions: questionId },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves the tag data for a community.
 * @param communityId the ID of the community to retrieve tags for
 * @returns the tags for the community or null if an error occurred
 */
const getTagsForCommunity = async (communityId: string): Promise<Tag[] | null> => {
  try {
    const community: PopulatedDatabaseCommunityWithTags | null = await CommunityModel.findOne({
      _id: communityId,
    }).populate<{
      tags: DatabaseTag[];
    }>([{ path: 'tags', model: 'Tag' }]);
    if (!community) {
      throw new Error('Community not found');
    }
    return community.tags;
  } catch (error) {
    return null;
  }
};

/**
 * Gets a list of all tags from all communities without duplicates.
 *
 * @returns {Promise<DatabaseTag[] | null>} - A list of all tags from all communities without duplicates,
 */
const getAllCommunityTags = async (): Promise<DatabaseTag[] | null> => {
  try {
    // fetch all communities and populate tags
    const communities = await CommunityModel.find().populate<{
      tags: DatabaseTag[];
    }>({
      path: 'tags',
      model: 'Tag',
    });

    if (!communities || communities.length === 0) {
      throw new Error('No communities found');
    }

    // create a set to store unique tags
    const uniqueTagsSet: Set<DatabaseTag> = new Set<DatabaseTag>();

    // iterate through each community and add tags to the set
    communities.forEach(community => {
      community.tags.forEach(tag => {
        uniqueTagsSet.add(tag);
      });
    });

    // convert set to array
    const uniqueTagsArray = Array.from(uniqueTagsSet);

    return uniqueTagsArray;
  } catch (error) {
    return null;
  }
};

export {
  getCommunities,
  getCommunitiesBySearch,
  getCommunitiesByTag,
  getCommunitiesByUser,
  addCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  addQuestionToCommunity,
  removeQuestionFromCommunity,
  updateUserRole,
  addUserToCommunity,
  pinQuestion,
  unpinQuestion,
  getTagsForCommunity,
  getAllCommunityTags,
  getCommunitiesByQuestion,
};
