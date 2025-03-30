import { ObjectId } from 'mongodb';
import { SafeDatabaseUser } from './user';

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

/**
 * Represents a fully populated community from the database.
 * - `members`: An array of populated 'DatabaseUser' objects.
 * - `questions`: An array of populated 'PopulatedDatabaseQuestion' objects.
 */
export interface PopulatedDatabaseCommunity
  extends Omit<DatabaseCommunity, 'members' | 'questions'> {
  members: SafeDatabaseUser[];
  questions: PopulatedDatabaseQuestion[];
}

/**
 * Type representing possible responses for a Community-related operation.
 */
export type CommunityResponse = DatabaseCommunity | { error: string };

/**
 * Represents an achievement.
 * - `_id`: Unique identifier for the achievement.
 * - `name`: The name of the achievement.
 * - `description`: A brief description of the achievement.
 */
