import { ObjectId } from 'mongodb';
import FeedItemModel from '../models/feedItem.model';
import {
  DeleteResultResponse,
  FeedItem,
  FeedItemResponse,
  FeedItemsResponse,
} from '../types/types';

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

export const getFeedItemsByFeedId = async (aFeedId: ObjectId): Promise<FeedItemsResponse> => {
  try {
    const feedItems = await FeedItemModel.find({ feed: aFeedId });

    if (!feedItems) {
      throw Error('Feed items not found');
    }

    return feedItems;
  } catch (error) {
    return { error: `Error occurred when finding feed items: ${error}` };
  }
};

export const deleteFeedItemsByFeedId = async (aFeedId: ObjectId): Promise<DeleteResultResponse> => {
  try {
    const result = await FeedItemModel.deleteMany({ feed: aFeedId });

    if (!result) {
      throw Error('Failed to delete feed items');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when deleting feed items: ${error}` };
  }
};

export const getFeedItemsByFeedIdAndRankingRange = async (
  feedId: ObjectId,
  startRanking: number,
  endRanking: number,
): Promise<FeedItemsResponse> => {
  try {
    const feedItems = await FeedItemModel.find({
      feed: feedId,
      viewedRanking: { $gte: startRanking, $lt: endRanking },
    }).sort({ viewedRanking: 1 });

    if (!feedItems) {
      throw Error('Feed items not found');
    }

    return feedItems;
  } catch (error) {
    return { error: `Error occurred when finding feed items: ${error}` };
  }
};
