import { ObjectId } from 'mongodb';
import {
  DatabaseComment,
  DatabaseFeed,
  DatabaseQuestion,
  DatabaseTag,
  Feed,
  FeedItem,
  FeedResponse,
  Interest,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
} from '@fake-stack-overflow/shared';
import QuestionModel from '../models/questions.model';
import FeedModel from '../models/feed.model';
import { getInterestsByUserId } from './interest.service';
import {
  deleteFeedItemsByFeedId,
  getFeedItemsByFeedIdAndRankingRange,
  saveFeedItem,
} from './feedItem.service';
import TagModel from '../models/tags.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import CommunityModel from '../models/communities.model';

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

    return newFeed;
  } catch (error) {
    return { error: `Error occurred when saving feed item: ${error}` };
  }
};

export const getFeedByUserId = async (aUserId: ObjectId): Promise<FeedResponse> => {
  try {
    const feed = await FeedModel.findOne({ userId: aUserId });

    if (!feed) {
      throw Error('Feed not found');
    }

    return feed;
  } catch (error) {
    return { error: `Error occurred when finding feed: ${error}` };
  }
};

export const deleteFeedByUserId = async (aUserId: ObjectId): Promise<FeedResponse> => {
  try {
    const deletedFeed: DatabaseFeed | null = await FeedModel.findOneAndDelete({ userId: aUserId });

    if (!deletedFeed) {
      throw Error('Failed to delete feed');
    }

    return deletedFeed;
  } catch (error) {
    return { error: `Error occurred when deleting feed: ${error}` };
  }
};

export const updateFeedLastViewedRanking = async (
  userId: ObjectId,
  lastViewedRanking: number,
): Promise<FeedResponse> => {
  try {
    const feed = await FeedModel.findOneAndUpdate({ userId }, { lastViewedRanking }, { new: true });

    if (!feed) {
      throw Error('Feed not found');
    }

    return feed;
  } catch (error) {
    return { error: `Error occurred when updating feed: ${error}` };
  }
};

/**
 * Calculates the weighted sum of tags for each question based on user interests.
 * @param {DatabaseQuestion[]} questions - The list of questions to calculate weights for
 * @param {ObjectId} userId - The user ID to retrieve interests from
 * @returns {Promise<DatabaseQuestion[]>} - The list of questions with weights
 */
export const calculateWeightedQuestions = async (
  questions: DatabaseQuestion[],
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const userInterests = await getInterestsByUserId(userId);
    const interests = userInterests.reduce((acc: Record<string, number>, interest: Interest) => {
      acc[interest.tagId.toString()] = interest.weight;
      return acc;
    }, {});

    const res = questions
      .map(question => {
        const weightSum = question.tags.reduce((acc: number, tag: ObjectId) => {
          const tagId = tag.toString();
          return acc + (interests[tagId] || 0);
        }, 0);
        return { ...question, weight: weightSum };
      })
      .sort((a, b) => b.weight - a.weight);

    return res;
  } catch (err) {
    return [];
  }
};

export const getAllQuestionsInOrderAndSaveToFeed = async (
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const questions = await QuestionModel.find({});

    const weightedQuestions = await calculateWeightedQuestions(questions, userId);

    // Create feedItem objects for each question and save to the feed associated with this user
    const userFeed = await getFeedByUserId(userId);
    if ('error' in userFeed) {
      throw new Error('Feed not found');
    }

    await deleteFeedItemsByFeedId(userFeed._id);

    await Promise.all(
      weightedQuestions.map((aQuestion, index) =>
        saveFeedItem({
          feed: userFeed,
          question: aQuestion,
          community: undefined,
          viewedRanking: index,
        }),
      ),
    );

    return weightedQuestions;
  } catch (err) {
    return [];
  }
};

export const getQuestionsForInfiniteScroll = async (
  userId: ObjectId,
  limit: number,
): Promise<FeedItem[]> => {
  try {
    const userFeed = await getFeedByUserId(userId);
    if ('error' in userFeed) {
      throw new Error('Feed not found');
    }

    const startIndex = userFeed.lastViewedRanking || 0;
    const endIndex = startIndex + limit;

    const userFeedItems = await getFeedItemsByFeedIdAndRankingRange(
      userFeed._id,
      startIndex,
      endIndex,
    );
    if ('error' in userFeedItems) {
      throw new Error('Feed items not found');
    }

    await updateFeedLastViewedRanking(userId, endIndex);

    const questionIds = userFeedItems.map(feedItem => feedItem.question);

    const questions: PopulatedDatabaseQuestion[] = await QuestionModel.find({
      _id: { $in: questionIds },
    }).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    const communityIds = userFeedItems.map(feedItem => feedItem.community);
    const communities = await CommunityModel.find({ _id: { $in: communityIds } });

    const feedItems: FeedItem[] = userFeedItems.map(feedItem => {
      const question = questions.find(q => q._id.equals(feedItem.question));
      const community = communities.find(c => c._id.equals(feedItem.community));
      return { feed: userFeed, question, community, viewedRanking: feedItem.viewedRanking };
    });

    return feedItems;
  } catch (err) {
    return [];
  }
};
