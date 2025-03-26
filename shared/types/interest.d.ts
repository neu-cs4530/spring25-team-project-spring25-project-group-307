import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents an interest of a user.
 * - `userId`: The unique identifier of the user.
 * - `tagId`: The unique identifier of the tag.
 * - `weight`: The weight of the interest.
 * - `priority`: The priority of the interest (moderate or high).
 */
export interface Interest {
  userId: ObjectId;
  tagId: ObjectId;
  weight: number;
  priority: string;
}

/**
 * Express request for querying an interest by its user ID.
 * - `userId`: The user ID provided as a route parameter.
 */
export interface InterestByUserIdRequest extends Request {
  params: {
    userId: ObjectId;
  };
}

/**
 * Represents the response for interest-related operations.
 * - `Interest`: An interest object if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type InterestResponse = Interest | { error: string };

/**
 * Express request for updating a user's interests.
 * - `username`: The username who's interests are being updated (body).
 * - `interests`: The new interests content to be set (body).
 */
export interface UpdateInterestsRequest extends Request {
  body: {
    username: string;
    interests: Interest[];
  };
}
