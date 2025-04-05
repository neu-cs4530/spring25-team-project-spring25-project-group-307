import { ObjectId } from 'mongodb';
import { SafeDatabaseUser } from './user';
import { DatabaseTag, Tag } from './tag';

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
  isPrivate?: boolean;
  admins: ObjectId[];
  moderators: ObjectId[];
  members: ObjectId[];
  questions: ObjectId[];
  pinnedQuestions: ObjectId[];
  tags: Tag[];
}

/**
 * Represents a community stored in the database.
 * - `_id`: Unique identifier for the community.
 * - `title`: The title of the community.
 * - `description`: A brief description of the community.
 * - `members`: An array of references to 'User' documents that are members of the community.
 * - `questions`: An array of references to 'Question' documents that are part of the community.
 */
export interface DatabaseCommunity extends Omit<Community, 'tags'> {
  _id: ObjectId;
  tags: ObjectId[];
}

/**
 * Represents a Community with tags populated from the database.
 */
export interface PopulatedDatabaseCommunityWithTags extends Omit<DatabaseCommunity, 'tags'> {
  tags: Tag[];
}

/**
 * Represents a fully populated community from the database.
 * - `members`: An array of populated 'DatabaseUser' objects.
 * - `questions`: An array of populated 'PopulatedDatabaseQuestion' objects.
 */
export interface PopulatedDatabaseCommunity
  extends Omit<
    DatabaseCommunity,
    'members' | 'admins' | 'moderators' | 'questions' | 'pinnedQuestions' | 'tags'
  > {
  admins: SafeDatabaseUser[];
  moderators: SafeDatabaseUser[];
  members: SafeDatabaseUser[];
  questions: PopulatedDatabaseQuestion[];
  pinnedQuestions: PopulatedDatabaseQuestion[];
  tags: DatabaseTag[];
}

/**
 * Type representing possible responses for a Community-related operation.
 */
export type CommunityResponse = DatabaseCommunity | { error: string };

export type CommunitiesResponse = DatabaseCommunity[] | { error: string };
