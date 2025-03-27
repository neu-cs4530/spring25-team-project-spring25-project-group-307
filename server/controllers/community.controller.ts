import express, { Request, Response } from 'express';
import { Community, FakeSOSocket } from '../types/types';
import {
  getCommunities,
  getCommunitiesBySearch,
  getCommunitiesByUser,
  addCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  addQuestionToCommunity,
  updateUserRole,
  addUserToCommunity,
  removeQuestionFromCommunity,
  pinQuestion,
  unpinQuestion,
  getTagsForCommunity,
  getAllCommunityTags,
  getCommunitiesByTag,
} from '../services/community.service';
import { processTags } from '../services/tag.service';
import { getAllPreferencesForCommunity } from '../services/preferences.service';
import UserNotificationManager from '../services/userNotificationManager';

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
   * Handles getting all communities to match a list of tag Ids.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   */
  const getCommunitiesByTagsRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tags } = req.body;
      // Get all communities from the database
      const communitiesByTag = await Promise.all(
        tags.map(async (tagId: string) => getCommunitiesByTag(tagId)),
      );
      // Flatten the array of arrays into a single array of communities
      const allCommunities = communitiesByTag.flat();

      // Remove duplicates by using a Map keyed by community ID
      const uniqueCommunities = Array.from(
        new Map(allCommunities.map(community => [community._id.toString(), community])).values(),
      );

      // Return the unique communities
      res.json(uniqueCommunities);
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

  const isCommunityBodyValid = (community: Community): boolean =>
    community.title !== undefined &&
    community.title !== '' &&
    community.description !== undefined &&
    community.description !== '' &&
    community.tags !== undefined &&
    community.tags.length > 0;

  /**
   * Handles adding a community.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const addCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    if (!isCommunityBodyValid(req.body)) {
      res.status(400).send('Invalid Community Body');
      return;
    }

    const community: Community = req.body;

    try {
      // Process community tags
      const communityWithTags = {
        ...community,
        tags: await processTags(community.tags),
      };

      if (communityWithTags.tags.length === 0) {
        throw new Error('No tags found');
      }

      // Save the community
      const result = await addCommunity(communityWithTags);
      res.json(result);
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

  /**
   * Handles getting a community by its ID.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const getCommunityByIdRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the community by its ID
      const community = await getCommunityById(req.params.id);
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when fetching community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles adding a question to a community.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const addQuestionToCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Add the question to the community
      const community = await addQuestionToCommunity(req.body.communityId, req.body.questionId);

      // only emit if user is in community and has subsribed to this event

      if (community !== null) {
        const userNotificationManager = UserNotificationManager.getInstance();
        const loggedinUsers = userNotificationManager.getLoggedInUsers();

        getAllPreferencesForCommunity(community.title).then(preferences => {
          preferences.forEach(databasePeferences => {
            if (loggedinUsers.includes(databasePeferences.username)) {
              const clientSocket = userNotificationManager.getUserSocketByUsername(
                databasePeferences.username,
              );
              clientSocket?.emit(
                'preferencesUpdate',
                `A new question has been posted in ${community.title}. Check it out!`,
              );
            }
          });
        });
      }

      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when adding question to community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles removing a question from a community.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const deleteQuestionFromCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { communityId, questionId } = req.params;
      // Remove the question from the community
      const community = await removeQuestionFromCommunity(communityId, questionId);
      res.json(community);
    } catch (error) {
      res
        .status(500)
        .send(`Error when deleting question from community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles updating a user role in a community.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   *
   * @returns A Promise that resolves to void.
   */
  const updateRoleInCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Update the user role in the community
      const community = await updateUserRole(
        req.body.communityId,
        req.body.username,
        req.body.role,
      );
      if (!community) {
        throw new Error('Failed to update user role in community');
      }
      res.json(community);
    } catch (error) {
      res
        .status(500)
        .send(`Error when updating user role in community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles adding a user to a community.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const addUserToCommunityRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Add the user to the community
      const community = await addUserToCommunity(req.body.communityId, req.body.username);
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when adding user to community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles pinning a question in a community.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const pinQuestionRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Pin the question in the community
      const community = await pinQuestion(req.body.communityId, req.body.questionId);
      res.json(community);
    } catch (error) {
      res.status(500).send(`Error when pinning question in community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles unpinning a question in a community.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const unpinQuestionRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Unpin the question in the community
      const community = await unpinQuestion(req.body.communityId, req.body.questionId);
      res.json(community);
    } catch (error) {
      res
        .status(500)
        .send(`Error when unpinning question in community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles getting the tags for a community.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const getTagsRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the tags for the community
      const tags = await getTagsForCommunity(req.params.communityId.toString());
      res.json(tags);
    } catch (error) {
      res.status(500).send(`Error when fetching tags for community: ${(error as Error).message}`);
    }
  };

  /**
   * Handles getting all unique tags from all communities.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @returns A Promise that resolves to void.
   */
  const getAllCommunityTagsRoute = async (_: Request, res: Response): Promise<void> => {
    try {
      // Get all unique tags from all communities
      const tags = await getAllCommunityTags();
      res.json(tags);
    } catch (error) {
      res
        .status(500)
        .send(`Error when fetching tags for all communities: ${(error as Error).message}`);
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.get('/getCommunities', getCommunitiesRoute);
  router.get('/getCommunitiesBySearch/:search', getCommunitiesBySearchRoute);
  router.post('/getCommunitiesByTags', getCommunitiesByTagsRoute);
  router.get('/getCommunitiesByUser/:username', getCommunitiesByUserRoute);
  router.post('/saveCommunity', addCommunityRoute);
  router.post('/joinCommunity', joinCommunityRoute);
  router.post('/leaveCommunity', leaveCommunityRoute);
  router.get('/getCommunityById/:id', getCommunityByIdRoute);
  router.post('/addQuestionToCommunity', addQuestionToCommunityRoute);
  router.patch('/updateCommunityRole', updateRoleInCommunityRoute);
  router.patch('/addUserToCommunity', addUserToCommunityRoute);
  router.delete(
    '/deleteQuestionFromCommunity/:communityId/:questionId',
    deleteQuestionFromCommunityRoute,
  );
  router.patch('/pinQuestion', pinQuestionRoute);
  router.patch('/unpinQuestion', unpinQuestionRoute);
  router.get('/getTagsForCommunity/:communityId', getTagsRoute);
  router.get('/getAllCommunityTags', getAllCommunityTagsRoute);

  return router;
};

export default communityController;
