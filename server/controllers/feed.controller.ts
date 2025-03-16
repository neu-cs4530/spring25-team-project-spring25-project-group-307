import express, { Router, Request, Response } from 'express';
import {
  FeedItem,
  Feed,
  DatabaseFeed,
  FakeSOSocket,
  User,
  UpdateInterestsRequest,
} from '../types/types';
import {
  calculateWeightedQuestions,
  getQuestionsForInfiniteScroll,
} from '../services/feed.service';

const feedController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  const isFeedItemValid = (item: FeedItem): boolean =>
    item.content !== undefined &&
    item.content !== null &&
    item.createdAt !== undefined &&
    item.createdAt !== null &&
    item.updatedAt !== undefined &&
    item.updatedAt !== null;

  const isFeedValid = (feed: Feed): boolean =>
    feed.items !== undefined &&
    feed.items !== null &&
    feed.items.length > 0 &&
    feed.items.every(isFeedItemValid);

  const isDatabaseFeedValid = (feed: DatabaseFeed): boolean =>
    feed._id !== undefined &&
    feed._id !== null &&
    feed.items !== undefined &&
    feed.items !== null &&
    feed.items.length > 0 &&
    feed.items.every(item => item !== null);

  const isUpdateInterestsBodyValid = (req: UpdateInterestsRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username.trim() !== '' &&
    req.body.interests !== undefined &&
    Array.isArray(req.body.interests);

  return router;
};

export default feedController;
