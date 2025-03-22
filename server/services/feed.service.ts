import { ObjectId } from 'mongodb';
import {
  DatabaseFeed,
  DatabaseQuestion,
  Feed,
  FeedItem,
  FeedResponse,
  Interest,
} from '@fake-stack-overflow/shared';
import QuestionModel from '../models/questions.model';
import UserModel from '../models/users.model';
import FeedModel from '../models/feed.model';

/**
 * Saves a new feed to the database.
 * @param feed - The feed object to save.
 * @returns {Promise<FeedItemResponse>} - The saved feed item or an error message.
 */
export const saveFeed = async (feed: Feed): Promise<FeedResponse> => {
  try {
    const newFeed = await FeedModel.create(feed);

    if (!newFeed) {
      throw Error('Failed to create feed');
    }

    const populatedFeed = await newFeed.populate<{ items: FeedItem[] }>('items');

    return populatedFeed;
  } catch (error) {
    return { error: `Error occurred when saving feed item: ${error}` };
  }
};

/**
 * Calculates the weighted sum of tags for each question based on user interests.
 * @param {DatabaseQuestion[]} questions - The list of questions to calculate weights for
 * @param {ObjectId} userId - The user ID to retrieve interests from
 * @returns {Promise<PopulatedDatabaseQuestion[]>} - The list of questions with weights
 */
export const calculateWeightedQuestions = async (
  questions: DatabaseQuestion[],
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const user = await UserModel.findById(userId).populate<{ interests: Interest[] }>('interests');
    if (!user) {
      throw new Error('User not found');
    }
    const interests = user.interests.reduce((acc: Record<string, number>, interest: Interest) => {
      acc[interest.userId.toString()] = interest.weight;
      return acc;
    }, {});

    return questions
      .map(question => {
        const weightSum = question.tags.reduce((acc: number, tag) => {
          const tagId = tag._id.toString();
          return acc + (interests[tagId] || 0);
        }, 0);
        return { ...question, weight: weightSum };
      })
      .sort((a, b) => b.weight - a.weight);
  } catch (err) {
    return [];
  }
};

export const getAllQuestionsInOrderAndSaveToFeed = async (
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const questions = await QuestionModel.find({}).populate('tags');

    const weightedQuestions = await calculateWeightedQuestions(questions, userId);

    const feedItems: FeedItem[] = weightedQuestions.map((question, index) => ({
      question,
      viewedRanking: index + 1,
    }));

    await UserModel.findByIdAndUpdate(userId, { feed: feedItems });
    return weightedQuestions;
  } catch (err) {
    return [];
  }
};

export const getQuestionsForInfiniteScroll = async (
  userId: ObjectId,
  limit: number,
): Promise<DatabaseQuestion[]> => {
  try {
    const user = await UserModel.findById(userId).populate<{ feed: FeedItem[] }>('feed');
    if (!user || !user.feed) {
      throw new Error('User or feed not found');
    }

    const startIndex = user.lastViewRanking || 0;
    const endIndex = startIndex + limit;

    const feedItems = user.feed.slice(startIndex, endIndex);

    await UserModel.findByIdAndUpdate(userId, { lastViewRanking: endIndex });

    const questions = feedItems.map(feedItem => feedItem.question);

    return questions;
  } catch (err) {
    return [];
  }
};
