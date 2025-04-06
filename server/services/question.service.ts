import { ObjectId } from 'mongodb';
import { QueryOptions } from 'mongoose';
import {
  CommunityResponse,
  DatabaseComment,
  DatabaseCommunity,
  DatabaseQuestion,
  DatabaseTag,
  OrderType,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  Question,
  QuestionResponse,
  VoteResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import CommentModel from '../models/comments.model';
import { parseKeyword, parseTags } from '../utils/parse.util';
import { checkTagInQuestion, deleteTagsByIds } from './tag.service';
import {
  sortQuestionsByActive,
  sortQuestionsByMostViews,
  sortQuestionsByNewest,
  sortQuestionsByUnanswered,
} from '../utils/sort.util';
import CommunityModel from '../models/communities.model';
import { deleteAnswerById } from './answer.service';
import { deleteCommentById } from './comment.service';
import { deleteInterestByTagId } from './interest.service';
import UserModel from '../models/users.model';
import { getCommunitiesByQuestion } from './community.service';

/**
 * Checks if keywords exist in a question's title or text.
 * @param {Question} q - The question to check
 * @param {string[]} keywordlist - The keywords to check
 * @returns {boolean} - `true` if any keyword is found
 */
const checkKeywordInQuestion = (q: Question, keywordlist: string[]): boolean => {
  for (const w of keywordlist) {
    if (q.title.includes(w) || q.text.includes(w)) {
      return true;
    }
  }
  return false;
};

/**
 * Retrieves questions ordered by specified criteria.
 * @param {OrderType} order - The order type to filter the questions
 * @returns {Promise<Question[]>} - The ordered list of questions
 */
export const getQuestionsByOrder = async (
  order: OrderType,
): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const qlist: PopulatedDatabaseQuestion[] = await QuestionModel.find().populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    switch (order) {
      case 'active':
        return sortQuestionsByActive(qlist);
      case 'unanswered':
        return sortQuestionsByUnanswered(qlist);
      case 'newest':
        return sortQuestionsByNewest(qlist);
      case 'mostViewed':
      default:
        return sortQuestionsByMostViews(qlist);
    }
  } catch (error) {
    return [];
  }
};

/**
 * Filters questions by the user who asked them.
 * @param {PopulatedDatabaseQuestion[]} qlist - The list of questions
 * @param {string} askedBy - The username to filter by
 * @returns {PopulatedDatabaseQuestion[]} - Filtered questions
 */
export const filterQuestionsByAskedBy = (
  qlist: PopulatedDatabaseQuestion[],
  askedBy: string,
): PopulatedDatabaseQuestion[] => qlist.filter(q => q.askedBy === askedBy);

/**
 * Filters questions by search string containing tags and/or keywords.
 * @param {PopulatedDatabaseQuestion[]} qlist - The list of questions
 * @param {string} search - The search string
 * @returns {PopulatedDatabaseQuestion[]} - Filtered list of questions
 */
export const filterQuestionsBySearch = (
  qlist: PopulatedDatabaseQuestion[],
  search: string,
): PopulatedDatabaseQuestion[] => {
  const searchTags = parseTags(search);
  const searchKeyword = parseKeyword(search);

  return qlist.filter((q: Question) => {
    if (searchKeyword.length === 0 && searchTags.length === 0) {
      return true;
    }

    if (searchKeyword.length === 0) {
      return checkTagInQuestion(q, searchTags);
    }

    if (searchTags.length === 0) {
      return checkKeywordInQuestion(q, searchKeyword);
    }

    return checkKeywordInQuestion(q, searchKeyword) || checkTagInQuestion(q, searchTags);
  });
};

/**
 * Fetches a question by ID and increments its view count.
 * @param {string} qid - The question ID
 * @param {string} username - The username requesting the question
 * @returns {Promise<QuestionResponse | null>} - The question with incremented views or error message
 */
export const fetchAndIncrementQuestionViewsById = async (
  qid: string,
  username: string,
): Promise<PopulatedDatabaseQuestion | { error: string }> => {
  try {
    const q: PopulatedDatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: new ObjectId(qid) },
      { $addToSet: { views: username } },
      { new: true },
    ).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    if (!q) {
      throw new Error('Question not found');
    }

    return q;
  } catch (error) {
    return { error: 'Error when fetching and updating a question' };
  }
};

/**
 * Saves a new question to the database.
 * @param {Question} question - The question to save
 * @returns {Promise<QuestionResponse>} - The saved question or error message
 */
export const saveQuestion = async (question: Question): Promise<QuestionResponse> => {
  try {
    const result: DatabaseQuestion = await QuestionModel.create(question);

    return result;
  } catch (error) {
    return { error: 'Error when saving a question' };
  }
};

/**
 * Deletes a question from the database.
 * @param {string} qid - The question ID
 * @returns {Promise<QuestionResponse>} - The deleted question or error message
 */
export const deleteQuestionById = async (qid: string): Promise<QuestionResponse> => {
  try {
    // Populate to get the comments
    const question: PopulatedDatabaseQuestion | null = await QuestionModel.findById(qid).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    if (!question) {
      return { error: 'Question not found' };
    }

    const result: DatabaseQuestion | null = await QuestionModel.findByIdAndDelete(qid);

    if (!result) {
      return { error: 'Question not found' };
    }

    // Delete comments to answers
    const deleteAnswerCommentPromises = question.answers.map(answer =>
      answer.comments.map(comment => deleteCommentById(comment._id.toString())),
    );
    await Promise.all(deleteAnswerCommentPromises);

    // Delete all answers related to the question, using deleteAnswerById
    const deleteAnswerPromises = result.answers.map(answer =>
      deleteAnswerById(answer._id.toString()),
    );
    await Promise.all(deleteAnswerPromises);

    // Delete all comments related to the question, using deleteCommentById
    const deleteCommentPromises = result.comments.map(comment =>
      deleteCommentById(comment._id.toString()),
    );
    await Promise.all(deleteCommentPromises);

    // For each tag, check if any other question is using it. If not, append to the list of tags to be deleted
    const tagsToDelete: ObjectId[] = [];
    const tagExistenceChecks = result.tags.map(tag => QuestionModel.exists({ tags: tag }));
    const tagExistenceResults = await Promise.all(tagExistenceChecks);

    result.tags.forEach((tag, index) => {
      if (!tagExistenceResults[index]) {
        tagsToDelete.push(tag);
      }
    });

    if (tagsToDelete.length === 0) {
      return result;
    }

    // Delete all interests related to the tags
    const deleteInterestPromises = tagsToDelete.map(tagId => deleteInterestByTagId(tagId));
    await Promise.all(deleteInterestPromises);

    // Delete the tags that are not used by any other question
    await deleteTagsByIds(tagsToDelete);

    // Remove from savedQuestions
    await UserModel.updateMany({ savedQuestions: qid }, { $pull: { savedQuestions: qid } });

    // Get the community of the question and remove it from that community's questions
    const communities = await getCommunitiesByQuestion(qid);
    const communityPromises = communities.map(community =>
      CommunityModel.findByIdAndUpdate(community._id, { $pull: { questions: qid } }, { new: true }),
    );
    await Promise.all(communityPromises);

    return result;
  } catch (error) {
    return { error: 'Error when deleting a question' };
  }
};

/**
 * Retrieves a question from the database by its ID.
 * @param {string} qid - The question ID
 * @returns {Promise<QuestionResponse>} - The retrieved question or error message
 */
export const getQuestionById = async (qid: string): Promise<QuestionResponse> => {
  try {
    const result: DatabaseQuestion | null = await QuestionModel.findById(qid);
    return result || { error: 'Question not found' };
  } catch (error) {
    return { error: 'Error when retrieving the question' };
  }
};

/**
 * Retrieves a populated database question by its ID.
 * @param {string} qid - The question ID
 * @returns {Promise<PopulatedDatabaseQuestion>} - The populated question or error message
 */
export const getPopulatedQuestionById = async (
  qid: string,
): Promise<PopulatedDatabaseQuestion | { error: string }> => {
  try {
    const res: PopulatedDatabaseQuestion | null = await QuestionModel.findById(qid).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);
    if (!res) {
      throw new Error('Question not found');
    }
    return res;
  } catch (error) {
    return { error: 'Error when retrieving the question' };
  }
};

/**
 * Adds a vote to a question.
 * @param {string} qid - The question ID
 * @param {string} username - The username who voted
 * @param {'upvote' | 'downvote'} voteType - The vote type
 * @returns {Promise<VoteResponse>} - The updated vote result
 */
export const addVoteToQuestion = async (
  qid: string,
  username: string,
  voteType: 'upvote' | 'downvote',
): Promise<VoteResponse> => {
  let updateOperation: QueryOptions;

  if (voteType === 'upvote') {
    updateOperation = [
      {
        $set: {
          upVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
              { $concatArrays: ['$upVotes', [username]] },
            ],
          },
          downVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              '$downVotes',
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
            ],
          },
        },
      },
    ];
  } else {
    updateOperation = [
      {
        $set: {
          downVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
              { $concatArrays: ['$downVotes', [username]] },
            ],
          },
          upVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              '$upVotes',
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
            ],
          },
        },
      },
    ];
  }

  try {
    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      updateOperation,
      { new: true },
    );

    if (!result) {
      return { error: 'Question not found!' };
    }

    let msg = '';

    if (voteType === 'upvote') {
      msg = result.upVotes.includes(username)
        ? 'Question upvoted successfully'
        : 'Upvote cancelled successfully';
    } else {
      msg = result.downVotes.includes(username)
        ? 'Question downvoted successfully'
        : 'Downvote cancelled successfully';
    }

    return {
      msg,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    return {
      error:
        voteType === 'upvote'
          ? 'Error when adding upvote to question'
          : 'Error when adding downvote to question',
    };
  }
};

/**
 * Determines if a question is part of a community.
 * @param {string} qid - The question ID
 * @returns {Promise<CommunityResponse>}} - The community the question is in or null if the question is not in a community
 */
export const getCommunityQuestion = async (qid: ObjectId): Promise<CommunityResponse> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findOne({
      questions: { $in: qid },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    return community;
  } catch (error) {
    return { error: 'Error when retrieving community question' };
  }
};

export const addReportToQuestion = async (
  qid: string,
  userId: string,
): Promise<QuestionResponse> => {
  try {
    const question = await QuestionModel.findOne({ _id: new ObjectId(qid) });

    if (!question) {
      return { error: 'Question not found!' };
    }

    if (question.reportedBy.includes(new ObjectId(userId))) {
      return { error: 'Question already reported!' };
    }

    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: new ObjectId(qid) },
      { $push: { reportedBy: new ObjectId(userId) } },
      { new: true },
    );

    if (!result) {
      return { error: 'Question not found!' };
    }

    return result;
  } catch (error) {
    return { error: 'Error when adding report to question' };
  }
};

export const removeReportFromQuestion = async (
  qid: string,
  userId: string,
): Promise<QuestionResponse> => {
  try {
    const question = await QuestionModel.findOne({ _id: new ObjectId(qid) });

    if (!question) {
      return { error: 'Question not found!' };
    }

    if (!question.reportedBy.includes(new ObjectId(userId))) {
      return { error: 'Question not reported!' };
    }

    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: new ObjectId(qid) },
      { $pull: { reportedBy: new ObjectId(userId) } },
      { new: true },
    );

    if (!result) {
      return { error: 'Question not found!' };
    }

    return result;
  } catch (error) {
    return { error: 'Error when removing report from question' };
  }
};
