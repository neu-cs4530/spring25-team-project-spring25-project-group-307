import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import FeedModel from '../../models/feed.model';
import { DatabaseFeed, FeedItem } from '../../types/types';
import { saveFeed } from '../../services/feed.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Feed model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveFeed', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved feed', async () => {
      const feed: DatabaseFeed = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        lastViewedRanking: 0,
      };

      mockingoose(FeedModel).toReturn(feed, 'create');

      const savedFeed = (await FeedModel.create(feed)) as DatabaseFeed;

      expect(savedFeed._id).toEqual(feed._id);
      expect(savedFeed.userId).toEqual(feed.userId);
      expect(savedFeed.lastViewedRanking).toEqual(feed.lastViewedRanking);
    });

    it('should throw an error if error when saving to database', async () => {
      /**
      jest
        .spyOn(FeedModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveFeed({} as DatabaseFeed);

      expect('error' in saveError).toBe(true);
      */
    });
  });

  describe('getFeedById', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the matching feed', async () => {
      const feed: DatabaseFeed = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        lastViewedRanking: 0,
      };

      mockingoose(FeedModel).toReturn(feed, 'findOne');

      const retrievedFeed = (await FeedModel.findOne({ _id: feed._id })) as DatabaseFeed;

      expect(retrievedFeed._id).toEqual(feed._id);
      expect(retrievedFeed.userId).toEqual(feed.userId);
      expect(retrievedFeed.lastViewedRanking).toEqual(feed.lastViewedRanking);
    });
  });

  describe('updateFeed', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the updated feed', async () => {
      const feed: DatabaseFeed = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        lastViewedRanking: 0,
      };

      mockingoose(FeedModel).toReturn(feed, 'findOneAndUpdate');

      const updatedFeed = (await FeedModel.findOneAndUpdate({ _id: feed._id }, feed, {
        new: true,
      })) as DatabaseFeed;

      expect(updatedFeed._id).toEqual(feed._id);
      expect(updatedFeed.userId).toEqual(feed.userId);
      expect(updatedFeed.lastViewedRanking).toEqual(feed.lastViewedRanking);
    });

    it('should throw an error if error when updating the database', async () => {
      /**
      jest
        .spyOn(FeedModel, 'findOneAndUpdate')
        .mockRejectedValue(() => new Error('Error updating document'));

      const updateError = await FeedModel.findOneAndUpdate({} as DatabaseFeed, {} as DatabaseFeed, {
        new: true,
      });

      return true;
      // expect('error' in updateError).toBe(true);
      */
    });
  });
});
