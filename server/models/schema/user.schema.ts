import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `biography`: A brief biography of the user.
 * - 'ranking': The ranking of the user.
 * - 'score': The score of the user.
 * - 'achievements': The achievements of the user.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    ranking: {
      type: String,
      enum: [
        'Newcomer Newbie',
        'Common Contributor',
        'Skilled Solver',
        'Expert Explorer',
        'Mentor Maven',
        'Master Maverick',
      ],
      required: true,
      default: 'Newcomer Newbie',
    },
    score: {
      type: Number,
      default: 0,
    },
    questionsAsked: {
      type: Number,
      default: 0,
    },
    responsesGiven: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    achievements: {
      type: [String],
      default: [],
    },
  },
  { collection: 'User' },
);

export default userSchema;
