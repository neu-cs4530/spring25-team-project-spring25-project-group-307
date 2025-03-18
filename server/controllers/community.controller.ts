import express, { Request, Response } from 'express';
import { FakeSOSocket } from '../types/types';
import {
  getCommunities,
  getCommunitiesBySearch,
  getCommunitiesByUser,
  addCommunity,
  joinCommunity,
  leaveCommunity,
} from '../services/community.service';

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
   * Handles getting all communities that match a search query.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   */
  const getCommunitiesBySearchRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get all communities from the database
      const communities = await getCommunitiesBySearch(req.params.search);
      res.json(communities);
    } catch (error) {
      res.status(500).send(`Error when fetching communities: ${(error as Error).message}`);
    }
  };

  /**
   * Handles getting all communities a User is a member of.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const getCommunitiesByUserRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get all communities from the database
      const communities = await getCommunitiesByUser(req.params.username);
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

  /**
   * Handles joining a community.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const joinCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.title || !req.body.username) {
      res.status(400).send('Must include title and username in the body');
      return;
    }
    try {
      // Save the community
      const community = await joinCommunity(req.body.title, req.body.username);
      if (!community) {
        throw new Error('failed to join community');
      }
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when joining community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles leaving a community.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const leaveCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.title || !req.body.username) {
      res.status(400).send('Must include title and username in the body');
      return;
    }
    try {
      // Save the community
      const community = await leaveCommunity(req.body.title, req.body.username);
      if (!community) {
        throw new Error('failed to leave community');
      }
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when leaving community: ${(error as Error).message}`);
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.get('/getCommunities', getCommunitiesRoute);
  router.get('/getCommunitiesBySearch/:search', getCommunitiesBySearchRoute);
  router.get('/getCommunitiesByUser/:username', getCommunitiesByUserRoute);
  router.post('/saveCommunity', addCommunityRoute);
  router.post('/joinCommunity', joinCommunityRoute);
  router.post('/leaveCommunity', leaveCommunityRoute);

  return router;
};

export default communityController;
