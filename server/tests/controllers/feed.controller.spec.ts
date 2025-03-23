import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as feedUtil from '../../services/feed.service';
import * as dataUtil from '../../utils/database.util';

const saveFeedSpy = jest.spyOn(feedUtil, 'saveFeed');
const getFeedByUserIdSpy = jest.spyOn(feedUtil, 'getFeedByUserId');
const updateFeedLastViewedRankingSpy = jest.spyOn(feedUtil, 'updateFeedLastViewedRanking');
const calculateWeightedQuestionsSpy = jest.spyOn(feedUtil, 'calculateWeightedQuestions');
const getAllQuestionsInOrderAndSaveToFeedSpy = jest.spyOn(
  feedUtil,
  'getAllQuestionsInOrderAndSaveToFeed',
);
const getQuestionsForInfiniteScrollSpy = jest.spyOn(feedUtil, 'getQuestionsForInfiniteScroll');
const popDocSpy = jest.spyOn(dataUtil, 'populateDocument');

describe('POST /refresh', () => {
  it('should return 200 and call the correct services', async () => {
    const userId = new mongoose.Types.ObjectId();
    const feed = { _id: new mongoose.Types.ObjectId(), userId, lastViewedRanking: 0 };
    const questions = [{ _id: new mongoose.Types.ObjectId() }];

    getFeedByUserIdSpy.mockResolvedValue(feed);
    // calculateWeightedQuestionsSpy.mockResolvedValue(questions);

    // await supertest(app)
    //   .post('/feed/refresh')
    //   .send({ userId })
    //   .expect(200)
    //   .expect('Content-Type', /json/);

    // expect(getFeedByUserIdSpy).toHaveBeenCalledWith(userId);
    // expect(calculateWeightedQuestionsSpy).toHaveBeenCalledWith(questions, userId);
    // expect(saveFeedSpy).toHaveBeenCalledWith(feed, questions);
    // expect(updateFeedLastViewedRankingSpy).toHaveBeenCalledWith(userId, 0);
  });
});
