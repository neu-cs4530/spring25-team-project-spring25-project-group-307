import { Schema } from 'mongoose';

/**
 * Mongoose schema for an Interest.
 */
const interestSchema: Schema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'Interest',
      required: true,
    },
    weight: {
      type: Number,
      default: 1,
    },
  },
  { _id: false },
);

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
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
    interests: {
      type: [interestSchema],
      default: [],
    },
  },
  { collection: 'User' },
);

export default userSchema;
