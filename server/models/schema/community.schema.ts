import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Community collection.
 *
 * This schema defines the structure of a community document in the database.
 * Each community includes the following fields:
 * - 'title': The title of the community.
 * - 'description': A brief description of the community.
 * - 'private': A boolean indicating whether the community is private.
 * - 'admins': an array of references to 'User' documents that are admins of the community.
 * - 'moderators': an array of references to 'User' documents that are moderators of the community.
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
    isPrivate: {
      type: Boolean,
      required: false,
      default: false,
    },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    pinnedQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { collection: 'Community' },
);

export default communitySchema;
