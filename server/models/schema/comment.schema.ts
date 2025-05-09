import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Comment collection.
 *
 * This schema defines the structure of comment used in questions and answers in the database.
 * Each comment includes the following fields:
 * - `text`: The content of the comment.
 * - `commentBy`: The username of the user who commented.
 * - `commentDateTime`: The date and time when the comment was posted.
 * - 'replies': an array of references to 'Comment' documents that are replies to the comment.
 * - `upVotes`: upVotes that are from users for comments.
 * - `downVotes`: downVotes that are from users for comments.
 */
const commentSchema: Schema = new Schema(
  {
    text: {
      type: String,
    },
    commentBy: {
      type: String,
    },
    commentDateTime: {
      type: Date,
    },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    upVotes: [{ type: String }],
    downVotes: [{ type: String }],
  },
  { collection: 'Comment' },
);

export default commentSchema;
