import express, { Request, Response } from 'express';
import { FakeSOSocket } from '../types/types';
import { getCommunities, addCommunity } from '../services/community.service';

const communityController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Handles getting all communities.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const getCommunitiesRoute = async (_: Request, res: Response): Promise<void> => {
    try {
      // Get all communities from the database
      const communities = await getCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).send(`Error when fetching communities: ${(error as Error).message}`);
    }
  };

  /**
   * Handles adding a community.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const addCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Save the community
      const community = await addCommunity(req.body);
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when saving community: ${(error as Error).message}`);
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.get('/getCommunities', getCommunitiesRoute);
  router.post('/saveCommunity', addCommunityRoute);

  return router;
};

export default communityController;
