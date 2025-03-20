import { ObjectId } from 'mongodb';
import FeedItemModel from '../models/feedItem.model';
import UserModel from '../models/users.model';
import { DatabaseUser, FeedItem, FeedItemResponse } from '../types/types';

/**
 * Saves a new feed item to the database.
 * @param feedItem - The feed item object to save.
 * @returns {Promise<FeedItemResponse>} - The saved feed item or an error message.
 */
export const saveFeedItem = async (feedItem: FeedItem): Promise<FeedItemResponse> => {
  try {
    const result = await FeedItemModel.create(feedItem);

    if (!result) {
      throw Error('Failed to create feed item');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving feed item: ${error}` };
  }
};

/**
 * Adds a feed item ID to a user's feed.
 * @param userId - The ID of the user to update.
 * @param feedItemId - The ID of the feed item to add.
 * @returns {Promise<FeedItemResponse>} - The updated user or an error message.
 */
export const addFeedItemToUser = async (
  userId: string,
  feedItemId: string,
): Promise<FeedItemResponse> => {
  try {
    const updatedUser: DatabaseUser | null = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { feed: feedItemId } },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error adding feed item to user: ${error}` };
  }
};
