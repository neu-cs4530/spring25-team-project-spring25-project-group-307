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
  deleteFeedItemsByFeedIdFromIndex,
  getFeedItemsByFeedIdAndRankingRange,
  saveFeedItem,
} from './feedItem.service';
import TagModel from '../models/tags.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import CommunityModel from '../models/communities.model';
import { getCommunityQuestion } from './question.service';

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

    // Create an array of { question, weight } objects
    const weightedQuestions = questions.map(question => ({
      question, // Store reference to the original Mongoose object
      weight: question.tags.reduce((acc: number, tag: ObjectId) => {
        const tagId = tag.toString();
        return acc + (interests[tagId] || 0);
      }, 0),
    }));

    // Sort by weight in descending order
    weightedQuestions.sort((a, b) => b.weight - a.weight);

    // Return only the original questions in the new order
    return weightedQuestions.map(item => item.question);
  } catch (err) {
    return [];
  }
};

export const getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex = async (
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const userFeed = await getFeedByUserId(userId);
    if ('error' in userFeed) {
      throw new Error('Feed not found');
    }
    const startIndex = userFeed.lastViewedRanking || 0;

    const questions = await QuestionModel.aggregate([
      {
        $match: {
          $expr: { $lt: [{ $size: '$reportedBy' }, 2] }, // Condition 1: Length of reportedBy array is less than 2
        },
      },
      {
        $lookup: {
          from: 'FeedItem',
          let: { questionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$feed', userFeed._id] }, // Match feedItems where feed matches the user's feed
                    { $eq: ['$question', '$$questionId'] }, // Match feedItems where question matches the current question's _id
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                viewedRanking: 1, // Only include the viewedRanking field
              },
            },
          ],
          as: 'feedItems',
        },
      },
      {
        $addFields: {
          includeQuestion: {
            $cond: {
              if: { $gt: [{ $size: '$feedItems' }, 0] }, // If there are matching feedItems
              then: {
                $not: {
                  $anyElementTrue: {
                    $map: {
                      input: '$feedItems',
                      as: 'feedItem',
                      in: { $lt: ['$$feedItem.viewedRanking', startIndex] }, // Exclude if any feedItem's viewedRanking is less than startIndex
                    },
                  },
                },
              },
              else: true, // If there are no matching feedItems, include the question
            },
          },
        },
      },
      {
        $match: {
          includeQuestion: true, // Only include questions where includeQuestion is true
        },
      },
      {
        $project: {
          feedItems: 0, // Exclude the feedItems field
          includeQuestion: 0, // Exclude the includeQuestion field
        },
      },
    ]);

    if (questions.length === 0) {
      return [];
    }

    const weightedQuestions = await calculateWeightedQuestions(questions, userId);

    await deleteFeedItemsByFeedIdFromIndex(userFeed._id, startIndex);

    const communities = await Promise.all(
      weightedQuestions.map(async aQuestion => {
        const communityResult = await getCommunityQuestion(aQuestion._id);
        return 'error' in communityResult ? undefined : communityResult;
      }),
    );

    await Promise.all(
      weightedQuestions.map((aQuestion, index) =>
        saveFeedItem({
          feed: userFeed,
          question: aQuestion,
          community: communities[index],
          viewedRanking: startIndex + index,
        }),
      ),
    );

    return weightedQuestions;
  } catch (err) {
    return [];
  }
};

export const getAllQuestionsInOrderAndSaveToFeed = async (
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    // Find questions where length of reportedBy array is less than 2
    const questions = await QuestionModel.aggregate([
      {
        $match: {
          $expr: { $lt: [{ $size: '$reportedBy' }, 2] },
        },
      },
    ]);

    const weightedQuestions = await calculateWeightedQuestions(questions, userId);

    // Create feedItem objects for each question and save to the feed associated with this user
    const userFeed = await getFeedByUserId(userId);
    if ('error' in userFeed) {
      throw new Error('Feed not found');
    }

    await deleteFeedItemsByFeedId(userFeed._id);

    const communities = await Promise.all(
      weightedQuestions.map(async aQuestion => {
        const communityResult = await getCommunityQuestion(aQuestion._id);
        return 'error' in communityResult ? undefined : communityResult;
      }),
    );

    await Promise.all(
      weightedQuestions.map((aQuestion, index) =>
        saveFeedItem({
          feed: userFeed,
          question: aQuestion,
          community: communities[index],
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

    await updateFeedLastViewedRanking(userId, startIndex + feedItems.length);

    return feedItems;
  } catch (err) {
    return [];
  }
};
