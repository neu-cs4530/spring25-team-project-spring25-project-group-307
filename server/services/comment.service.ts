import {
  AnswerResponse,
  Comment,
  CommentResponse,
  DatabaseAnswer,
  DatabaseComment,
  DatabaseQuestion,
  QuestionResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import CommentModel from '../models/comments.model';

/**
 * Saves a new comment to the database.
 * @param {Comment} comment - The comment to save.
 * @returns {Promise<CommentResponse>} - The saved comment or an error message.
 */
export const saveComment = async (comment: Comment): Promise<CommentResponse> => {
  try {
    const result: DatabaseComment = await CommentModel.create(comment);
    return result;
  } catch (error) {
    return { error: 'Error when saving a comment' };
  }
};

/**
 * Adds a comment to a question or answer.
 * @param {string} id - The ID of the question or answer or comment.
 * @param {'question' | 'answer' | 'comment'} type - The type of the item to comment on.
 * @param {DatabaseComment} comment - The comment to add.
 * @returns {Promise<QuestionResponse | AnswerResponse | CommentResponse>} - The updated item or an error message.
 */
export const addComment = async (
  id: string,
  type: 'question' | 'answer' | 'comment',
  comment: DatabaseComment,
): Promise<QuestionResponse | AnswerResponse | CommentResponse> => {
  try {
    if (!comment || !comment.text || !comment.commentBy || !comment.commentDateTime) {
      throw new Error('Invalid comment');
    }

    let result: DatabaseQuestion | DatabaseAnswer | DatabaseComment | null;

    if (type === 'question') {
      result = await QuestionModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    } else if (type === 'answer') {
      result = await AnswerModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    } else {
      result = await CommentModel.findOneAndUpdate(
        { _id: id },
        { $push: { replies: { $each: [comment._id] } } },
        { new: true },
      );
    }

    if (result === null) {
      throw new Error('Failed to add comment');
    }

    return result;
  } catch (error) {
    return { error: `Error when adding comment: ${(error as Error).message}` };
  }
};

/**
 * Deletes a comment from the database.
 * @param {string} cid - The ID of the comment to delete.
 * @returns {Promise<CommentResponse>} - The deleted comment or an error message.
 */
export const deleteCommentById = async (cid: string): Promise<CommentResponse> => {
  try {
    // delete the comment itself
    const result: DatabaseComment | null = await CommentModel.findByIdAndDelete(cid);
    if (!result) {
      throw new Error('Comment not found');
    }

    // Remove the comment from `replies` arrays in other comments
    await CommentModel.updateMany({ replies: cid }, { $pull: { replies: cid } });

    // Remove the comment from `comments` arrays in questions
    await QuestionModel.updateMany({ comments: cid }, { $pull: { comments: cid } });

    // Remove the comment from `comments` arrays in answers
    await AnswerModel.updateMany({ comments: cid }, { $pull: { comments: cid } });

    return result;
  } catch (error) {
    return { error: 'Error when deleting a comment' };
  }
};

/**
 * Retrieves a comment from the database.
 * @param {string} cid - The ID of the comment to retrieve.
 * @returns {Promise<CommentResponse>} - The retrieved comment or an error message.
 */
export const getCommentById = async (cid: string): Promise<CommentResponse> => {
  try {
    const res: DatabaseComment | null = await CommentModel.findById(cid);
    return res || { error: 'Comment not found' };
  } catch (error) {
    return { error: 'Error when retrieving a comment' };
  }
};
