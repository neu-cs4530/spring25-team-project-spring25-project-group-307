import express, { Router, Request, Response } from 'express';
import { FakeSOSocket } from '../types/types';

const feedItemController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Handles the request to update the saved status of a FeedItem.
   * @param req The request containing the user ID, tag ID, and factor.
   * @param res The response, either returning the updated interest or an error.
   * @returns A promise resolving to void.
   */
  const updateSavedStatus = async (req: Request, res: Response): Promise<void> => {};

  /**
   * Handles the request to update the report status of a FeedItem.
   * @param req The request containing the user ID, tag ID, and factor.
   * @param res The response, either returning the updated interest or an error.
   * @returns A promise resolving to void.
   */
  const updateReportStatus = async (req: Request, res: Response): Promise<void> => {};

  router.post('/updateSavedStatus', updateSavedStatus);
  router.post('/updateReportStatus', updateReportStatus);
  return router;
};

export default feedItemController;
