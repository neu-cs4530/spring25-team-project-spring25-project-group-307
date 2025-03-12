import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Community collection.
 *
 * This schema defines the structure of a community document in the database.
 * Each community includes the following fields:
 * - 'title': The title of the community.
 * - 'description': A brief description of the community.
 * - 'members': an array of references to 'User' documents that are members of the community.
 * - 'questions': an array of references to 'Question' documents that are part of the community.
 */

const communitySchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  },
  { collection: 'Community' },
);

export default communitySchema;
