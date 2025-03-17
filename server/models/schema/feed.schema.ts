import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Feed collection.
 *
 * This schema defines the structure for storing a feed in the database.
 * Each feed includes the following fields:
 * - 'items': An array of feed items.
 */

const feedSchema: Schema = new Schema(
  {
    items: [{ type: Schema.Types.ObjectId, ref: 'FeedItem' }],
  },
  { collection: 'Feed' },
);

export default feedSchema;
