import { ObjectId } from 'mongodb';
import { DatabaseQuestion } from './question';

/**
 * Represents a feed item.
 * - `content`: The content of the feed item.
 * - `community`: The community that the feed item belongs to.
 * - `createdAt`: The timestamp when the feed item was created.
 * - `updatedAt`: The timestamp when the feed item was last updated.
 */
export interface FeedItem {
  content: DatabaseQuestion;
  community?: DatabaseCommunity;
  createdAt: Date;
  updatedAt: Date;
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
