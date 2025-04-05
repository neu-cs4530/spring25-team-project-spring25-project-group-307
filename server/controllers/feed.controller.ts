import express, { Router, Request, Response } from 'express';
import { FakeSOSocket } from '../types/types';
import {
  getAllQuestionsInOrderAndSaveToFeed,
  getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex,
  getFeedHistoryByUser,
  getQuestionsForInfiniteScroll,
  updateFeedLastViewedRanking,
} from '../services/feed.service';

const feedController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Handles the request to refresh the feed for a user.
   * @param req The request containing the user ID.
   * @param res The response, either returning the refreshed feed's questions or an error.
   * @returns A promise resolving to void.
   */
  const refreshFeed = async (req: Request, res: Response): Promise<void> => {
    if (req.body === undefined) {
      res.status(400).send('Invalid refreshFeed body');
      return;
    }

    const { userId } = req.body;

    if (userId === undefined) {
      res.status(400).send('Invalid user ID');
      return;
    }

    try {
      const questions = await getAllQuestionsInOrderAndSaveToFeed(userId);

      await updateFeedLastViewedRanking(userId, 0);

      res.status(200).send(questions);
    } catch (error) {
      res.status(500).send(`Error when refreshing feed: ${error}`);
    }
  };

  /**
   * Handles the request to get the next feed items for a user.
   * @param req The request containing the user ID and limit.
   * @param res The response, either returning the next feed items or an error.
   * @returns A promise resolving to void.
   */
  const getNextFeedItems = async (req: Request, res: Response): Promise<void> => {
    if (req.body === undefined) {
      res.status(400).send('Invalid getNextFeedItems body');
      return;
    }

    const { userId, limit } = req.body;

    if (userId === undefined || limit === undefined) {
      res.status(400).send('Invalid user ID or limit');
      return;
    }

    try {
      await getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex(userId);
      const questions = await getQuestionsForInfiniteScroll(userId, limit);

      res.status(200).send(questions);
    } catch (error) {
      res.status(500).send(`Error when getting next feed items: ${error}`);
    }
  };

  const getFeedHistory = async (req: Request, res: Response): Promise<void> => {
    if (req.body === undefined) {
      res.status(400).send('Invalid getFeedHistory body');
      return;
    }

    const { userId, numFeedQuestionsBeforeNav } = req.body;

    if (userId === undefined) {
      res.status(400).send('Invalid user ID');
      return;
    }

    try {
      const questions = await getFeedHistoryByUser(userId, numFeedQuestionsBeforeNav);

      res.status(200).send(questions);
    } catch (error) {
      res.status(500).send(`Error when getting feed history: ${error}`);
    }
  };

  // Define routes for the feed-related operations.
  router.post('/refresh', refreshFeed);
  router.post('/next', getNextFeedItems);
  router.post('/history', getFeedHistory);
  return router;
};

export default feedController;
