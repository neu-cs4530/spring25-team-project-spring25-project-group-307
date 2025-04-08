import FeedItemModel from '../../models/feedItem.model';
import {
  saveFeedItem,
  getFeedItemsByFeedId,
  deleteFeedItemsByFeedId,
  deleteFeedItemsByFeedIdFromIndex,
  getFeedItemsByFeedIdAndRankingRange,
} from '../../services/feedItem.service';
import { DeleteResultResponse, DatabaseFeedItem } from '../../types/types';
import * as mockData from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Feed item model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveFeedItem', () => {
    beforeEach(() => {
      mockingoose(FeedItemModel).reset();
      jest.clearAllMocks();
    });
    it('should save a feed item', async () => {
      const feedItem: DatabaseFeedItem = mockData.FEED_ITEMS[0];
      mockingoose(FeedItemModel).toReturn(feedItem, 'create');

      const result = (await saveFeedItem(feedItem)) as DatabaseFeedItem;

      expect(result._id).toEqual(feedItem._id);
      expect(result.feed).toEqual(feedItem.feed);
      expect(result.question).toEqual(feedItem.question);
      expect(result.community).toEqual(feedItem.community);
    });

    it('should return an error if saving fails', async () => {
      const feedItem: DatabaseFeedItem = mockData.FEED_ITEMS[0];
      jest.spyOn(FeedItemModel, 'create').mockImplementation(() => {
        throw new Error('Failed to create feed item');
      });

      const result = await saveFeedItem(feedItem);

      expect(result).toEqual({
        error: 'Error occurred when saving feed item: Error: Failed to create feed item',
      });
    });
  });

  describe('getFeedItemsByFeedId', () => {
    beforeEach(() => {
      mockingoose(FeedItemModel).reset();
      jest.clearAllMocks();
    });
    it('should get feed items by feed ID', async () => {
      const feedId = mockData.FEEDS[0]._id;
      const feedItems = mockData.FEED_ITEMS.slice(0, 4);
      mockingoose(FeedItemModel).toReturn(feedItems, 'find');

      const result = await getFeedItemsByFeedId(feedId);

      expect(result).toHaveLength(feedItems.length);
    });

    it('should return an error if getting feed items fails', async () => {
      const feedId = mockData.FEEDS[0]._id;
      mockingoose(FeedItemModel).toReturn(null, 'find');

      const result = await getFeedItemsByFeedId(feedId);

      expect(result).toEqual({
        error: 'Error occurred when finding feed items: Error: Feed items not found',
      });
    });
  });

  describe('deleteFeedItemsByFeedId', () => {
    beforeEach(() => {
      mockingoose(FeedItemModel).reset();
      jest.clearAllMocks();
    });
    it('should delete feed items by feed ID', async () => {
      const feedId = mockData.FEEDS[0]._id;
      const deleteResult: DeleteResultResponse = { deletedCount: 4 };
      mockingoose(FeedItemModel).toReturn(deleteResult, 'deleteMany');

      const result = await deleteFeedItemsByFeedId(feedId);

      expect(result).toEqual(deleteResult);
    });

    it('should return an error if deleting feed items fails', async () => {
      const feedId = mockData.FEEDS[0]._id;
      mockingoose(FeedItemModel).toReturn(null, 'deleteMany');

      const result = await deleteFeedItemsByFeedId(feedId);

      expect(result).toEqual({
        error: 'Error occurred when deleting feed items: Error: Failed to delete feed items',
      });
    });
  });

  describe('deleteFeedItemsByFeedIdFromIndex', () => {
    beforeEach(() => {
      mockingoose(FeedItemModel).reset();
      jest.clearAllMocks();
    });
    it('should delete feed items by feed ID from index', async () => {
      const feedId = mockData.FEEDS[0]._id;
      const startIndex = 2;
      const deleteResult: DeleteResultResponse = { deletedCount: 2 };
      mockingoose(FeedItemModel).toReturn(deleteResult, 'deleteMany');

      const result = await deleteFeedItemsByFeedIdFromIndex(feedId, startIndex);

      expect(result).toEqual(deleteResult);
    });

    it('should return an error if deleting feed items fails', async () => {
      const feedId = mockData.FEEDS[0]._id;
      const startIndex = 2;
      mockingoose(FeedItemModel).toReturn(null, 'deleteMany');

      const result = await deleteFeedItemsByFeedIdFromIndex(feedId, startIndex);

      expect(result).toEqual({
        error: 'Error occurred when deleting feed items: Error: Failed to delete feed items',
      });
    });
  });

  describe('getFeedItemsByFeedIdAndRankingRange', () => {
    beforeEach(() => {
      mockingoose(FeedItemModel).reset();
      jest.clearAllMocks();
    });
    it('should get feed items by feed ID and ranking range', async () => {
      const feedId = mockData.FEEDS[0]._id;
      const startRanking = 1;
      const endRanking = 3;
      const feedItems = mockData.FEED_ITEMS.slice(1, 2);
      mockingoose(FeedItemModel).toReturn(feedItems, 'find');

      const result = await getFeedItemsByFeedIdAndRankingRange(feedId, startRanking, endRanking);

      expect(result).toHaveLength(feedItems.length);
    });

    it('should return an error if getting feed items fails', async () => {
      const feedId = mockData.FEEDS[0]._id;
      const startRanking = 1;
      const endRanking = 3;
      mockingoose(FeedItemModel).toReturn(null, 'find');

      const result = await getFeedItemsByFeedIdAndRankingRange(feedId, startRanking, endRanking);

      expect(result).toEqual({
        error: 'Error occurred when finding feed items: Error: Feed items not found',
      });
    });
  });
});
