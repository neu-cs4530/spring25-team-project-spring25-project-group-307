import mongoose, { Model } from 'mongoose';
import { DatabaseCommunity } from '@fake-stack-overflow/shared/types/community';
import communitySchema from './schema/community.schema';

/**
 * Mongoose model for the `Community` collection.
 *
 * This model is created using the `Community` interface and the `communitySchema`, representing the
 * `Community` collection in the MongoDB database, and provides an interface for interacting with
 * the stored communities.
 *
 * @type {Model<DatabaseCommunity>}
 */
const CommunityModel: Model<DatabaseCommunity> = mongoose.model<DatabaseCommunity>(
  'Community',
  communitySchema,
);

export default CommunityModel;
