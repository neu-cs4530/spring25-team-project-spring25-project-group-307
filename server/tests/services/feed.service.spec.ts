import FeedModel from '../../models/feed.model';
import {
  saveFeed,
  getFeedByUserId,
  deleteFeedByUserId,
  updateFeedLastViewedRanking,
  calculateWeightedQuestions,
  getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex,
  getAllQuestionsInOrderAndSaveToFeed,
  getFeedHistoryByUser,
  getQuestionsForInfiniteScroll,
} from '../../services/feed.service';
import { DatabaseFeed, FeedItem, Interest, SafeDatabaseUser } from '../../types/types';
import * as mockData from '../mockData.models';
import InterestModel from '../../models/interest.model';
import QuestionModel from '../../models/questions.model';
import FeedItemModel from '../../models/feedItem.model';
import CommunityModel from '../../models/communities.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Feed model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveFeed', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should return the saved feed', async () => {
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'create');

      const savedFeed = (await saveFeed(feed)) as DatabaseFeed;

      expect(savedFeed._id).toEqual(feed._id);
      expect(savedFeed.userId).toEqual(feed.userId);
      expect(savedFeed.lastViewedRanking).toEqual(feed.lastViewedRanking);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(FeedModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveFeed(mockData.FEEDS[0]);

      expect('error' in saveError).toBe(true);
    });

    it('should throw an error if null error when saving to database', async () => {
      jest
        .spyOn(FeedModel, 'create')
        .mockResolvedValueOnce(null as unknown as ReturnType<typeof FeedModel.create>);

      const saveError = await saveFeed(mockData.FEEDS[0]);

      expect('error' in saveError).toBe(true);
    });
  });

  describe('getFeedByUserId', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should return the matching feed', async () => {
      const feed: DatabaseFeed = mockData.FEEDS[0];
      const user: SafeDatabaseUser = mockData.safeUser;

      mockingoose(FeedModel).toReturn(feed, 'findOne');

      const retrievedFeed = (await getFeedByUserId(user._id)) as DatabaseFeed;

      expect(retrievedFeed._id).toEqual(feed._id);
      expect(retrievedFeed.userId).toEqual(feed.userId);
      expect(retrievedFeed.lastViewedRanking).toEqual(feed.lastViewedRanking);
    });

    it('should throw error if no feed found', async () => {
      const user: SafeDatabaseUser = mockData.safeUser;

      mockingoose(FeedModel).toReturn(null, 'findOne');

      const retrievedFeed = (await getFeedByUserId(user._id)) as DatabaseFeed;

      expect('error' in retrievedFeed).toBe(true);
    });

    it('should throw an error if error when retrieving from database', async () => {
      jest
        .spyOn(FeedModel, 'findOne')
        .mockRejectedValueOnce(() => new Error('Error retrieving document'));

      const retrieveError = await getFeedByUserId(mockData.safeUser._id);

      expect('error' in retrieveError).toBe(true);
    });
  });

  describe('deleteFeedByUserId', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });
    it('should return the deleted feed', async () => {
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'findOneAndDelete');

      const deletedFeed = (await deleteFeedByUserId(feed.userId)) as DatabaseFeed;

      expect(deletedFeed._id).toEqual(feed._id);
      expect(deletedFeed.userId).toEqual(feed.userId);
      expect(deletedFeed.lastViewedRanking).toEqual(feed.lastViewedRanking);
    });
    it('should throw an error if error when deleting from database', async () => {
      jest
        .spyOn(FeedModel, 'findOneAndDelete')
        .mockRejectedValueOnce(() => new Error('Error deleting document'));

      const deleteError = await deleteFeedByUserId(mockData.safeUser._id);
      expect('error' in deleteError).toBe(true);
    });
    it('should throw an error if no feed found', async () => {
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(null, 'findOneAndDelete');

      const deletedFeed = (await deleteFeedByUserId(feed.userId)) as DatabaseFeed;

      expect('error' in deletedFeed).toBe(true);
    });
  });

  describe('updateFeedLastViewedRanking', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });
    it('should return the updated feed', async () => {
      const feed: DatabaseFeed = mockData.FEEDS[0];
      const updatedFeed: DatabaseFeed = {
        ...feed,
        lastViewedRanking: feed.lastViewedRanking + 1,
      };

      mockingoose(FeedModel).toReturn(updatedFeed, 'findOneAndUpdate');

      const result = (await updateFeedLastViewedRanking(
        feed.userId,
        feed.lastViewedRanking + 1,
      )) as DatabaseFeed;

      expect(result._id).toEqual(updatedFeed._id);
      expect(result.userId).toEqual(updatedFeed.userId);
      expect(result.lastViewedRanking).toEqual(updatedFeed.lastViewedRanking);
    });
    it('should throw an error if error when updating the database', async () => {
      jest
        .spyOn(FeedModel, 'findOneAndUpdate')
        .mockRejectedValueOnce(() => new Error('Error updating document'));

      const updateError = await updateFeedLastViewedRanking(
        mockData.safeUser._id,
        mockData.FEEDS[0].lastViewedRanking + 1,
      );

      expect('error' in updateError).toBe(true);
    });
    it('should throw an error if no feed found', async () => {
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(null, 'findOneAndUpdate');

      const result = await updateFeedLastViewedRanking(feed.userId, feed.lastViewedRanking + 1);

      expect('error' in result).toBe(true);
    });
  });

  describe('calculateWeightedQuestions', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should return the weighted questions given no interests', async () => {
      const questions = mockData.QUESTIONS;
      const user = mockData.safeUser;
      const interests = [] as Interest[];

      mockingoose(InterestModel).toReturn(interests, 'find');

      const weightedQuestions = await calculateWeightedQuestions(questions, user._id);

      expect(weightedQuestions).toEqual(questions);
    });

    it('shoul return the weight questions given set of interests', async () => {
      const questions = mockData.QUESTIONS;
      const user = mockData.safeUser3;
      const interests = mockData.INTERESTS.slice(1);

      mockingoose(InterestModel).toReturn(interests, 'find');

      const weightedQuestions = await calculateWeightedQuestions(questions, user._id);

      expect(weightedQuestions).toEqual(questions);
    });

    it('should return nothing if error when retrieving interests from database', async () => {
      mockingoose(InterestModel).toReturn(null as unknown as Interest, 'find');

      const weightedQuestions = await calculateWeightedQuestions(
        mockData.QUESTIONS,
        mockData.safeUser._id,
      );

      expect(weightedQuestions).toEqual([]);
    });
  });

  describe('getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should return the questions in order and save to feed', async () => {
      const questions = mockData.QUESTIONS;
      const user = mockData.safeUser3;
      const interests = mockData.INTERESTS.slice(1);
      const feed: DatabaseFeed = mockData.FEEDS[0];
      const feedItems: FeedItem[] = mockData.FEED_ITEMS;

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedModel).toReturn(3, 'countDocuments');
      mockingoose(QuestionModel).toReturn(questions, 'aggregate');
      mockingoose(InterestModel).toReturn(interests, 'find');
      mockingoose(FeedItemModel).toReturn({ acknowledged: true, deletedCount: 4 }, 'deleteMany');
      jest
        .spyOn(CommunityModel, 'findOne')
        .mockResolvedValueOnce(
          mockData.COMMUNITIES[3] as unknown as ReturnType<typeof CommunityModel.findOne>,
        )
        .mockResolvedValueOnce(
          mockData.COMMUNITIES[3] as unknown as ReturnType<typeof CommunityModel.findOne>,
        )
        .mockResolvedValueOnce({
          error: 'Error when retrieving community question',
        } as unknown as ReturnType<typeof CommunityModel.findOne>)
        .mockResolvedValueOnce({
          error: 'Error when retrieving community question',
        } as unknown as ReturnType<typeof CommunityModel.findOne>);
      jest
        .spyOn(FeedItemModel, 'create')
        .mockResolvedValueOnce(feedItems[8] as unknown as ReturnType<typeof FeedItemModel.create>)
        .mockResolvedValueOnce(feedItems[9] as unknown as ReturnType<typeof FeedItemModel.create>)
        .mockResolvedValueOnce(feedItems[10] as unknown as ReturnType<typeof FeedItemModel.create>)
        .mockResolvedValueOnce(feedItems[11] as unknown as ReturnType<typeof FeedItemModel.create>);

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex(
        user._id,
      );

      expect(weightedQuestions).toEqual(questions);
    });

    it('should return nothing if no questions from pipeline', async () => {
      const user = mockData.safeUser3;
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedModel).toReturn(3, 'countDocuments');
      mockingoose(QuestionModel).toReturn([], 'aggregate');

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex(
        user._id,
      );

      expect(weightedQuestions).toEqual([]);
    });

    it('should return nothing if error when retrieving total feed users', async () => {
      const user = mockData.safeUser3;
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedModel).toReturn(new Error('Error counting documents'), 'countDocuments');

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex(
        user._id,
      );

      expect(weightedQuestions).toEqual([]);
    });

    it('should return nothing if error when retrieving feed', async () => {
      const user = mockData.safeUser3;

      mockingoose(FeedModel).toReturn(new Error('Database error'), 'findOne');

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex(
        user._id,
      );

      expect(weightedQuestions).toEqual([]);
    });
  });

  describe('getAllQuestionsInOrderAndSaveToFeed', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });
    it('should return the questions in order and save to feed', async () => {
      const questions = mockData.QUESTIONS;
      const user = mockData.safeUser3;
      const interests = mockData.INTERESTS.slice(1);
      const feed: DatabaseFeed = mockData.FEEDS[2];
      const feedItems: FeedItem[] = mockData.FEED_ITEMS.slice(7);

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedModel).toReturn(3, 'countDocuments');
      mockingoose(QuestionModel).toReturn(questions, 'aggregate');
      mockingoose(InterestModel).toReturn(interests, 'find');
      mockingoose(FeedItemModel).toReturn({ acknowledged: true, deletedCount: 4 }, 'deleteMany');
      jest
        .spyOn(CommunityModel, 'findOne')
        .mockResolvedValueOnce(
          mockData.COMMUNITIES[3] as unknown as ReturnType<typeof CommunityModel.findOne>,
        )
        .mockResolvedValueOnce(
          mockData.COMMUNITIES[3] as unknown as ReturnType<typeof CommunityModel.findOne>,
        )
        .mockResolvedValueOnce({
          error: 'Error when retrieving community question',
        } as unknown as ReturnType<typeof CommunityModel.findOne>)
        .mockResolvedValueOnce({
          error: 'Error when retrieving community question',
        } as unknown as ReturnType<typeof CommunityModel.findOne>);
      jest
        .spyOn(FeedItemModel, 'create')
        .mockResolvedValueOnce(feedItems[8] as unknown as ReturnType<typeof FeedItemModel.create>)
        .mockResolvedValueOnce(feedItems[9] as unknown as ReturnType<typeof FeedItemModel.create>)
        .mockResolvedValueOnce(feedItems[10] as unknown as ReturnType<typeof FeedItemModel.create>)
        .mockResolvedValueOnce(feedItems[11] as unknown as ReturnType<typeof FeedItemModel.create>);

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeed(user._id);

      expect(weightedQuestions).toEqual(questions);
    });
    it('should return nothing if no questions from pipeline', async () => {
      const user = mockData.safeUser3;
      const interests = mockData.INTERESTS.slice(1);
      const feed: DatabaseFeed = mockData.FEEDS[2];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedModel).toReturn(3, 'countDocuments');
      mockingoose(QuestionModel).toReturn([], 'aggregate');
      mockingoose(InterestModel).toReturn(interests, 'find');
      mockingoose(FeedItemModel).toReturn({ acknowledged: true, deletedCount: 4 }, 'deleteMany');

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeed(user._id);

      expect(weightedQuestions).toEqual([]);
    });
    it('should return nothing if error when retrieving total feed users', async () => {
      const user = mockData.safeUser3;
      const feed: DatabaseFeed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedModel).toReturn(new Error('Error counting documents'), 'countDocuments');

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeed(user._id);

      expect(weightedQuestions).toEqual([]);
    });

    it('should return nothing if error when retrieving feed', async () => {
      const user = mockData.safeUser3;

      mockingoose(FeedModel).toReturn(new Error('Database error'), 'findOne');

      const weightedQuestions = await getAllQuestionsInOrderAndSaveToFeed(user._id);

      expect(weightedQuestions).toEqual([]);
    });
  });

  describe('getFeedHistoryByUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });
    it('should return the feed history for a user', async () => {
      const user = mockData.safeUser;
      const feed = { ...mockData.FEEDS[0], lastViewedRanking: 3 };
      const feedItems: FeedItem[] = mockData.FEED_ITEMS;
      const populatedFeedItems = [
        {
          feed,
          question: mockData.QUESTIONS[1],
          community: mockData.COMMUNITIES[3],
          viewedRanking: 1,
        },
        {
          ...feedItems[2],
          feed,
          question: mockData.QUESTIONS[2],
          community: undefined,
          viewedRanking: 2,
        },
      ];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedItemModel).toReturn(feedItems.slice(1, 3), 'find');
      mockingoose(QuestionModel).toReturn(mockData.POPULATED_QUESTIONS.slice(1, 3), 'find');
      jest.spyOn(CommunityModel, 'find').mockResolvedValueOnce([mockData.COMMUNITIES[3]]);

      const feedHistory = (await getFeedHistoryByUser(user._id, 2)) as FeedItem[];

      expect(feedHistory).toHaveLength(populatedFeedItems.length);
    });
    it('should return nothing if no feed items found', async () => {
      const user = mockData.safeUser;

      mockingoose(FeedItemModel).toReturn([], 'find');

      const feedHistory = (await getFeedHistoryByUser(user._id, 2)) as FeedItem[];

      expect(feedHistory).toEqual([]);
    });
    it('should return nothing if error when populating communities', async () => {
      const user = mockData.safeUser;
      const feed = mockData.FEEDS[0];
      const feedItems: FeedItem[] = mockData.FEED_ITEMS;

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedItemModel).toReturn(feedItems.slice(0, 2), 'find');
      mockingoose(QuestionModel).toReturn(mockData.POPULATED_QUESTIONS, 'find');
      mockingoose(CommunityModel).toReturn(new Error('Database error'), 'find');

      const feedHistory = (await getFeedHistoryByUser(user._id, 2)) as FeedItem[];

      expect(feedHistory).toEqual([]);
    });
    it('should return nothing if error when populating questions', async () => {
      const user = mockData.safeUser;
      const feed = mockData.FEEDS[0];
      const feedItems: FeedItem[] = mockData.FEED_ITEMS;

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedItemModel).toReturn(feedItems.slice(0, 2), 'find');
      mockingoose(QuestionModel).toReturn(new Error('Database error'), 'find');

      const feedHistory = (await getFeedHistoryByUser(user._id, 2)) as FeedItem[];

      expect(feedHistory).toEqual([]);
    });
    it('should return nothing if no feed items found', async () => {
      const user = mockData.safeUser;
      const feed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedItemModel).toReturn({ error: 'Database error' }, 'find');

      const feedHistory = (await getFeedHistoryByUser(user._id, 2)) as FeedItem[];

      expect(feedHistory).toEqual([]);
    });
    it('should return nothing if no feed found', async () => {
      const user = mockData.safeUser;

      mockingoose(FeedModel).toReturn({ error: 'Database error' }, 'findOne');

      const feedHistory = (await getFeedHistoryByUser(user._id, 2)) as FeedItem[];

      expect(feedHistory).toEqual([]);
    });
  });

  describe('getQuestionsForInfiniteScroll', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });
    it('should return the questions for infinite scroll', async () => {
      const user = mockData.safeUser;
      const feedOrig: DatabaseFeed = mockData.FEEDS[0];
      const feed: DatabaseFeed = { ...mockData.FEEDS[0], lastViewedRanking: 3 };
      const feedItems: FeedItem[] = mockData.FEED_ITEMS;

      mockingoose(FeedModel).toReturn(feedOrig, 'findOne');
      mockingoose(FeedModel).toReturn(feed, 'findOneAndUpdate');
      mockingoose(FeedItemModel).toReturn(feedItems.slice(0, 3), 'find');
      mockingoose(QuestionModel).toReturn(mockData.POPULATED_QUESTIONS.slice(0, 3), 'find');
      jest
        .spyOn(CommunityModel, 'find')
        .mockResolvedValueOnce([mockData.COMMUNITIES[3]])
        .mockResolvedValueOnce([mockData.COMMUNITIES[3]]);

      const questions = (await getQuestionsForInfiniteScroll(user._id, 3)) as FeedItem[];

      expect(questions).toHaveLength(3);
    });
    it('should return nothing if error when retrieving from database', async () => {
      const user = mockData.safeUser;
      const feed = mockData.FEEDS[0];
      const feedItems: FeedItem[] = mockData.FEED_ITEMS;

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedItemModel).toReturn(feedItems.slice(0, 2), 'find');
      mockingoose(QuestionModel).toReturn(new Error('Database error'), 'find');

      const questions = (await getQuestionsForInfiniteScroll(user._id, 3)) as FeedItem[];

      expect(questions).toEqual([]);
    });
    it('should return nothing if no feed items found', async () => {
      const user = mockData.safeUser;
      const feed = mockData.FEEDS[0];

      mockingoose(FeedModel).toReturn(feed, 'findOne');
      mockingoose(FeedItemModel).toReturn(new Error('Database error'), 'find');

      const questions = (await getQuestionsForInfiniteScroll(user._id, 3)) as FeedItem[];

      expect(questions).toEqual([]);
    });
    it('should return nothing if no feed found', async () => {
      const user = mockData.safeUser;

      mockingoose(FeedModel).toReturn(new Error('Database error'), 'findOne');

      const questions = (await getQuestionsForInfiniteScroll(user._id, 3)) as FeedItem[];

      expect(questions).toEqual([]);
    });
  });
});
