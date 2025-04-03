import { Request } from 'express';
import { ObjectId } from 'mongodb';

/**
 * Represents a comment on a question or an answer.
 * - `text`: The content of the comment.
 * - `commentBy`: The author of the comment.
 * - `commentDateTime`: The timestamp when the comment was made.
 * - `replies`: An array of comments objectIds that are replies to this comment.
 * - `upVotes` : The upvotes for a comment made.
 * - `downVotes` : The downvotes for a comment made.
 */
export interface Comment {
  text: string;
  commentBy: string;
  commentDateTime: Date;
  replies?: ObjectId[];
  upVotes: string[];
  downVotes: string[];
}

/**
 * Represents a comment stored in the database.
 * - `_id`: Unique identifier for the comment.
 * - `text`: The content of the comment.
 * - `commentBy`: The author of the comment.
 * - `commentDateTime`: The timestamp when the comment was made.
 */
export interface DatabaseComment extends Comment {
  _id: ObjectId;
}

/**
 * Represents a fully populated comment from the database.
 * - `replies`: An array of populated `DatabaseComment` objects.
 */
export interface PopulatedDatabaseComment extends Omit<DatabaseComment, 'replies'> {
  replies?: DatabaseComment[];
}

/**
 * Interface extending the request body for adding a comment to a question or an answer.
 * - `id`: The unique identifier of the question or answer being commented on.
 * - `type`: The type of the comment, either 'question' or 'answer'.
 * - `comment`: The comment object being added.
 */
export interface AddCommentRequest extends Request {
  body: {
    id: string;
    type: 'question' | 'answer' | 'comment';
    comment: Comment;
  };
}

/**
 * Interface extending the request body for deleting a comment.
 * - `cid`: The unique identifier of the comment being deleted.
 */
export interface DeleteCommentRequest extends Request {
  params: {
    cid: string;
  };
}

/**
 * Interface extending the request body for getting a comment.
 * - `cid`: The unique identifier of the comment being retrieved.
 */
export interface GetCommentRequest extends Request {
  params: {
    cid: string;
  };
}

/**
 * Type representing possible responses for a Comment-related operation.
 * - Either a `DatabaseComment` object or an error message.
 */
export type CommentResponse = DatabaseComment | { error: string };

/**
 * Interface for the request body when upvoting or downvoting a comment.
 * - `cid`: The unique identifier of the comment being voted on (body).
 * - `username`: The username of the user casting the vote (body).
 */
export interface CommentVoteRequest extends Request {
  body: {
    cid: string;
    username: string;
  };
}
