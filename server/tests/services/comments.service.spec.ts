import mongoose from 'mongoose';
import QuestionModel from '../../models/questions.model';
import {
  saveComment,
  addComment,
  getCommentById,
  deleteCommentById,
  addVoteToComment,
} from '../../services/comment.service';
import { DatabaseComment, DatabaseQuestion, DatabaseAnswer } from '../../types/types';
import AnswerModel from '../../models/answers.model';
import { QUESTIONS, ans1, com1 } from '../mockData.models';
import CommentModel from '../../models/comments.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Comment model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveComment', () => {
    test('saveComment should return the saved comment', async () => {
      const result = (await saveComment(com1)) as DatabaseComment;

      expect(result._id).toBeDefined();
      expect(result.text).toEqual(com1.text);
      expect(result.commentBy).toEqual(com1.commentBy);
      expect(result.commentDateTime).toEqual(com1.commentDateTime);
    });

    test('saveComment should return an error if there is a database error', async () => {
      jest.spyOn(CommentModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const invalidComment: DatabaseComment = {
        _id: new mongoose.Types.ObjectId(),
        commentDateTime: new Date(),
        text: 'This is a comment',
        commentBy: 'user123',
        upVotes: [],
        downVotes: [],
      };

      const result = (await saveComment(invalidComment)) as DatabaseComment;

      expect(result).toEqual({ error: 'Error when saving a comment' });
    });
  });

  describe('addComment', () => {
    test('addComment should return the updated question when given `question`', async () => {
      // copy the question to avoid modifying the original
      const question = { ...QUESTIONS[0], comments: [com1] };
      mockingoose(QuestionModel).toReturn(question, 'findOneAndUpdate');

      const result = (await addComment(
        question._id.toString() as string,
        'question',
        com1,
      )) as DatabaseQuestion;

      expect(result.comments.length).toEqual(1);
      expect(result.comments).toContain(com1._id);
    });

    test('addComment should return the updated answer when given `answer`', async () => {
      // copy the answer to avoid modifying the original
      const answer: DatabaseAnswer = { ...ans1, comments: [com1._id] };
      mockingoose(AnswerModel).toReturn(answer, 'findOneAndUpdate');

      const result = (await addComment(answer._id.toString(), 'answer', com1)) as DatabaseAnswer;

      expect(result.comments.length).toEqual(1);
      expect(result.comments).toContain(com1._id);
    });

    test('addComment should return the updated comment when given `comment`', async () => {
      // copy the comment to avoid modifying the original
      const comment: DatabaseComment = { ...com1, replies: [com1._id] };
      mockingoose(CommentModel).toReturn(comment, 'findOneAndUpdate');
      const result = (await addComment(comment._id.toString(), 'comment', com1)) as DatabaseComment;
      expect(result.replies?.length).toEqual(1);
      expect(result.replies).toContain(com1._id);
    });

    test('addComment should return an object with error if findOneAndUpdate throws an error', async () => {
      const question = QUESTIONS[0];
      mockingoose(QuestionModel).toReturn(
        new Error('Error from findOneAndUpdate'),
        'findOneAndUpdate',
      );
      const result = await addComment(question._id.toString() as string, 'question', com1);
      expect(result).toEqual({ error: 'Error when adding comment: Error from findOneAndUpdate' });
    });

    test('addComment should return an object with error if findOneAndUpdate returns null', async () => {
      const answer: DatabaseAnswer = { ...ans1 };
      mockingoose(AnswerModel).toReturn(null, 'findOneAndUpdate');

      const result = await addComment(answer._id.toString(), 'answer', com1);
      expect(result).toEqual({ error: 'Error when adding comment: Failed to add comment' });
    });

    test('addComment should throw an error if a required field is missing in the comment', async () => {
      const invalidComment: DatabaseComment = {
        _id: new mongoose.Types.ObjectId(),
        commentDateTime: new Date(),
        text: '',
        commentBy: 'user123', // Missing commentDateTime
        upVotes: [],
        downVotes: [],
      };

      const qid = 'validQuestionId';

      expect(addComment(qid, 'question', invalidComment)).resolves.toEqual({
        error: `Error when adding comment: Invalid comment`,
      });
    });
  });

  describe('deleteCommentById', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    test('deleteCommentById should return the deleted comment when given a valid ID', async () => {
      const validComment = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a comment',
        commentBy: 'user123',
        commentDateTime: new Date(),
        upVotes: [],
        downVotes: [],
        replies: [com1._id],
      };

      jest.spyOn(CommentModel, 'findByIdAndDelete').mockResolvedValue(validComment);
      jest.spyOn(CommentModel, 'updateMany').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });
      jest.spyOn(QuestionModel, 'updateMany').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });
      jest.spyOn(AnswerModel, 'updateMany').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      });

      const result = (await deleteCommentById(validComment._id.toString())) as DatabaseComment;
      expect(result).toMatchObject(validComment);
    });

    test('deleteCommentById should return an error object when the comment is not found', async () => {
      jest.spyOn(CommentModel, 'findByIdAndDelete').mockResolvedValue(null);
      const result = await deleteCommentById('invalidId');
      expect(result).toEqual({ error: 'Error when deleting a comment' });
    });
  });

  describe('getCommentById', () => {
    test('getCommentById should return the comment when given a valid ID', async () => {
      const validComment = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a comment',
        commentBy: 'user123',
        commentDateTime: new Date(),
        upVotes: [],
        downVotes: [],
        replies: [],
      };
      mockingoose(CommentModel).toReturn(validComment, 'findOne');

      const result = await getCommentById(validComment._id.toString());

      expect(result).toMatchObject(validComment);
    });

    test('getCommentById should an error object when the database operation returns null', async () => {
      mockingoose(CommentModel).toReturn(null, 'findOne');

      const result = await getCommentById('invalidId');

      expect(result).toEqual({ error: 'Comment not found' });
    });

    test('getCommentById should return an error object when the database operation throws an error', async () => {
      mockingoose(CommentModel).toReturn(new Error('Database error'), 'findOne');

      const result = await getCommentById('invalidId');

      expect(result).toEqual({ error: 'Error when retrieving a comment' });
    });
  });

  describe('addVoteToComment', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    test('addVoteToComment should add a upVote to the comment if the type is upVote', async () => {
      const voteType = 'upvote';
      const username = 'testUser';
      const validComment = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a comment',
        commentBy: 'user123',
        commentDateTime: new Date(),
        upVotes: [username],
        downVotes: [],
      };

      mockingoose(CommentModel).toReturn(validComment, 'findOneAndUpdate');

      const result = await addVoteToComment(validComment._id.toString(), username, voteType);

      expect(result).toEqual({
        msg: 'Comment upvoted successfully',
        upVotes: [username],
        downVotes: [],
      });
    });

    test('addVoteToComment should remove the upVote from the comment if the user already upvoted', async () => {
      const voteType = 'upvote';
      const username = 'testUser';
      const validComment = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a comment',
        commentBy: 'user123',
        commentDateTime: new Date(),
        upVotes: [],
        downVotes: [],
      };
      mockingoose(CommentModel).toReturn(validComment, 'findOneAndUpdate');
      const result = await addVoteToComment(validComment._id.toString(), username, voteType);
      expect(result).toEqual({
        msg: 'Upvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });

    test('addVoteToComment should add a downVote to the comment if the type is downVote', async () => {
      const voteType = 'downvote';
      const username = 'testUser';
      const validComment = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a comment',
        commentBy: 'user123',
        commentDateTime: new Date(),
        upVotes: [],
        downVotes: [username],
      };
      mockingoose(CommentModel).toReturn(validComment, 'findOneAndUpdate');
      const result = await addVoteToComment(validComment._id.toString(), username, voteType);
      expect(result).toEqual({
        msg: 'Comment downvoted successfully',
        upVotes: [],
        downVotes: [username],
      });
    });

    test('addVoteToComment should remove the downVote from the comment if the user already downvoted', async () => {
      const voteType = 'downvote';
      const username = 'testUser';
      const validComment = {
        _id: new mongoose.Types.ObjectId(),
        text: 'This is a comment',
        commentBy: 'user123',
        commentDateTime: new Date(),
        upVotes: [],
        downVotes: [],
      };
      mockingoose(CommentModel).toReturn(validComment, 'findOneAndUpdate');
      const result = await addVoteToComment(validComment._id.toString(), username, voteType);
      expect(result).toEqual({
        msg: 'Downvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });

    test('addVoteToComment should return an error object if the comment is not found', async () => {
      const voteType = 'upvote';
      const username = 'testUser';
      mockingoose(CommentModel).toReturn(null, 'findOneAndUpdate');

      const result = await addVoteToComment('invalidId', username, voteType);

      expect(result).toEqual({ error: 'Comment not found' });
    });

    test('addVoteToComment should return an error object if the database operation fails when upvoting', async () => {
      const voteType = 'upvote';
      const username = 'testUser';
      mockingoose(CommentModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

      const result = await addVoteToComment('invalidId', username, voteType);

      expect(result).toEqual({ error: 'Error when upvoting comment' });
    });

    test('addVoteToComment should return an error object if the database operation fails when downvoting', async () => {
      const voteType = 'downvote';
      const username = 'testUser';
      mockingoose(CommentModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

      const result = await addVoteToComment('invalidId', username, voteType);

      expect(result).toEqual({ error: 'Error when downvoting comment' });
    });
  });
});
