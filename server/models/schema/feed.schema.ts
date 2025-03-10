import { Schema } from 'mongoose';

/**
 * Mongoose schema for a single FeedItem.
 *
 * This schema defines the structure for storing a single feed item in the database.
 * Each feed item includes the following fields:
 * - 'content': The content of the feed item.
 * - 'community': The community that the feed item belongs to.
 * - 'createdAt': The timestamp when the feed item was created.
 * - 'updatedAt': The timestamp when the feed item was last updated.
 */
const feedItemSchema: Schema = new Schema(
  {
    content: {
      type: Schema.Types.ObjectId,
      ref: 'Question', // Can be unioned to include other types of content
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

/**
 * Mongoose schema for the Feed collection.
 *
 * This schema defines the structure for storing a feed in the database.
 * Each feed includes the following fields:
 * - 'items': An array of feed items.
 */

const feedSchema: Schema = new Schema(
  {
    items: [feedItemSchema],
  },
  { collection: 'Feed' },
);

export default feedSchema;
