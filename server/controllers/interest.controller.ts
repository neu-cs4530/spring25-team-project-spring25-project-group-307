import express, { Request, Response, Router } from 'express';
import { FakeSOSocket, UpdateInterestsRequest, InterestByUserIdRequest } from '../types/types';
import {
  deleteInterest,
  getInterestsByTagIds,
  getInterestsByUserId,
  getInterestsByUserIdAndTagIds,
  saveInterest,
} from '../services/interest.service';
import { getUserByUsername } from '../services/user.service';

const interestController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for updating interests.
   * @param req The incoming request containing user and interest data.
   * @returns `true` if the body contains valid fields; otherwise, `false`.
   */
  const isUpdateInterestsBodyValid = (req: UpdateInterestsRequest): boolean =>
    req.body !== undefined &&
    req.body.username !== undefined &&
    req.body.username !== '' &&
    req.body.interests !== undefined &&
    req.body.interests.length >= 0;

  /**
   * Handles the update of a user's interests.
   * @param req The request containing username and interests in the body.
   * @param res The response, either returning a success message or an error.
   * @returns A promise resolving to void.
   */
  const updateInterests = async (req: UpdateInterestsRequest, res: Response): Promise<void> => {
    if (!isUpdateInterestsBodyValid(req)) {
      res.status(400).send('Invalid updateInterests body');
      return;
    }

    const { username, interests } = req.body;

    try {
      const user = await getUserByUsername(username);

      if ('error' in user) {
        res.status(404).send(`User with username "${username}" not found`);
        return;
      }

      const existingInterests = await getInterestsByUserId(user._id);

      // Compare existing interests with new interests. Do not update shared interests. If an interest is in existing but not in new, delete it. If an interest is in new but not in existing, save it.
      const interestsToDelete = existingInterests.filter(
        existingInterest =>
          !interests.some(newInterest => newInterest.tagId === existingInterest.tagId),
      );
      const interestsToSave = interests.filter(
        newInterest =>
          !existingInterests.some(existingInterest => newInterest.tagId === existingInterest.tagId),
      );

      await Promise.all(
        interestsToDelete.map(async interest => {
          await deleteInterest(interest);
        }),
      );

      // Save the new interests
      await Promise.all(
        interestsToSave.map(async interest => {
          await saveInterest(interest);
        }),
      );

      res.status(200).send('Interests updated successfully');
    } catch (error) {
      res.status(500).send(`Error when updating interests: ${(error as Error).message}`);
    }
  };

  /**
   * Retrieves interests based on a list of tag IDs.
   * @param req The request containing tag IDs in the body.
   * @param res The response, either returning a list of interests or an error.
   * @returns A promise resolving to void.
   */
  const getInterestsByTags = async (req: Request, res: Response): Promise<void> => {
    if (req.body === undefined || req.body.tagIds === undefined || req.body.tagIds.length < 0) {
      res.status(400).send('Invalid getInterestsByTags body');
      return;
    }

    const { tagIds } = req.body;

    try {
      const interests = await getInterestsByTagIds(tagIds);

      res.status(200).json(interests);
    } catch (error) {
      res.status(500).send(`Error when fetching interests: ${(error as Error).message}`);
    }
  };

  /**
   * Retrieves interests based on a user ID.
   * @param req The request containing the user ID as a route parameter.
   * @param res The response, either returning a list of interests or an error.
   * @returns A promise resolving to void.
   */
  const getInterestsByUser = async (req: InterestByUserIdRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const interests = await getInterestsByUserId(userId);

      res.status(200).json(interests);
    } catch (error) {
      res.status(500).send(`Error when fetching interests: ${(error as Error).message}`);
    }
  };

  /**
   * Retrieves interests based on a user ID and a list of tag IDs.
   * @param req The request containing the user ID and tag IDs in the body.
   * @param res The response, either returning a list of interests or an error.
   * @returns A promise resolving to void.
   */
  const getInterestsByUserAndTags = async (req: Request, res: Response): Promise<void> => {
    if (
      req.body === undefined ||
      req.body.userId === undefined ||
      req.body.tagIds === undefined ||
      req.body.tagIds.length < 0
    ) {
      res.status(400).send('Invalid getInterestsByUserAndTags body');
      return;
    }

    const { userId, tagIds } = req.body;

    try {
      const interests = await getInterestsByUserIdAndTagIds(userId, tagIds);

      res.status(200).json(interests);
    } catch (error) {
      res.status(500).send(`Error when fetching interests: ${(error as Error).message}`);
    }
  };

  // Define routes for the interest-related operations.
  router.post('/updateInterests', updateInterests);
  router.post('/getInterestsByTags', getInterestsByTags);
  router.get('/getInterestsByUser/:userId', getInterestsByUser);
  router.post('/getInterestsByUserAndTags', getInterestsByUserAndTags);
  return router;
};

export default interestController;
