import mongoose, { Model } from 'mongoose';
import feedSchema from './schema/feed.schema';
import { DatabaseFeed } from '../types/types';

/**
 * Mongoose model for the Feed collection.
 */
const FeedModel: Model<DatabaseFeed> = mongoose.model<DatabaseFeed>('Feed', feedSchema);

export default FeedModel;
