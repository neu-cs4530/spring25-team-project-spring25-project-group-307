import { ObjectId } from 'mongodb';

/**
 * Represents an item in a feed.
 * - `feed`: The feed object to which the item belongs.
 * - `question`: The question object in the feed item.
 * - `community`: The community object to which the question belongs.
 * - `viewedRanking`: The ranking of the item that the user has viewed.
 */
export interface FeedItem {
  feed: Feed;
  question: PopulatedDatabaseQuestion;
  community?: Community;
  viewedRanking: number;
}

/**
 * Represents a FeedItem document in the database.
 * - `_id`: The unique identifier for the feed item, generated by MongoDB.
 * - `feed`: The feed object to which the item belongs.
 * - `question`: The question object in the feed item.
 * - `community`: The community object to which the question belongs.
 * - `viewedRanking`: The ranking of the item that the user has viewed.
 */
export interface DatabaseFeedItem extends Omit<FeedItem, 'question' | 'feed' | 'community'> {
  _id: ObjectId;
  feed: ObjectId;
  question: ObjectId;
  community?: ObjectId;
}

/**
 * Represents the response for FeedItem-related operations.
 * - `FeedItem`: A feed item object if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type FeedItemResponse = DatabaseFeedItem | { error: string };

/**
 * Represents the response for multiple FeedItem-related operations.
 * - `FeedItems`: An array of feed item objects if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type FeedItemsResponse = DatabaseFeedItem[] | { error: string };
