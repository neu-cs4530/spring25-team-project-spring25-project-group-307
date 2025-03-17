import { ObjectId } from 'mongodb';
import { DatabaseQuestion } from './question';

export interface FeedItem {
  question: DatabaseQuestion;
  viewedRanking: number;
}

/**
 * Represents the feed.
 * - `items`: An array of items in the feed.
 */
export interface Feed {
  items: FeedItem[];
}

/**
 * Represents a feed item stored in the database.
 * - `_id`: Unique identifier for the feed item.
 * - `questions`: An array of ObjectIds referencing questions in the feed.
 */
export interface DatabaseFeed extends Omit<Feed, 'items'> {
  _id: ObjectId;
  items: ObjectId[];
}
