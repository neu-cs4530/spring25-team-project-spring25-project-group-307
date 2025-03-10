import { ObjectId } from 'mongodb';

/**
 * Represents a community.
 * - `title`: The title of the community.
 * - `description`: A brief description of the community.
 * - `members`: An array of references to 'User' documents that are members of the community.
 * - `questions`: An array of references to 'Question' documents that are part of the community.
 */
export interface Community {
  title: string;
  description: string;
  members: ObjectId[];
  questions: ObjectId[];
}

/**
 * Represents a community stored in the database.
 * - `_id`: Unique identifier for the community.
 * - `title`: The title of the community.
 * - `description`: A brief description of the community.
 * - `members`: An array of references to 'User' documents that are members of the community.
 * - `questions`: An array of references to 'Question' documents that are part of the community.
 */
export interface DatabaseCommunity extends Community {
  _id: ObjectId;
}
