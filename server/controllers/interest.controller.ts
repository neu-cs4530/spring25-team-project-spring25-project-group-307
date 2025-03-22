import express, { Request, Response, Router } from 'express';
import {
  FakeSOSocket,
  UpdateInterestsRequest,
  Interest,
  InterestByUserIdRequest,
} from '../types/types';
import {
  deleteInterestsByUserId,
  getInterestsByTagIds,
  getInterestsByUserId,
  getInterestsByUserIdAndTagIds,
  saveInterest,
} from '../services/interest.service';
import { getUserByUsername } from '../services/user.service';

const interestController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  const updateInterests = async (req: UpdateInterestsRequest, res: Response): Promise<void> => {
    try {
      const { username, interests } = req.body;

      // Get user object by its username
      const user = await getUserByUsername(username);

      if ('error' in user) {
        res.status(404).send(`User with username "${username}" not found`);
        return;
      }

      // Delete the user's existing interests
      await deleteInterestsByUserId(user._id);

      // Save the new interests
      await Promise.all(
        interests.map(async interest => {
          await saveInterest(interest);
        }),
      );

      res.status(200).send('Interests updated successfully');
    } catch (error) {
      res.status(500).send(`Error when updating interests: ${(error as Error).message}`);
    }
  };

  const getInterestsByTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tagIds } = req.body;
      const interests = await getInterestsByTagIds(tagIds);

      res.status(200).json(interests);
    } catch (error) {
      res.status(500).send(`Error when fetching interests: ${(error as Error).message}`);
    }
  };

  const getInterestsByUser = async (req: InterestByUserIdRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const interests = await getInterestsByUserId(userId);

      res.status(200).json(interests);
    } catch (error) {
      res.status(500).send(`Error when fetching interests: ${(error as Error).message}`);
    }
  };

  const getInterestsByUserAndTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, tagIds } = req.body;
      const interests = await getInterestsByUserIdAndTagIds(userId, tagIds);

      res.status(200).json(interests);
    } catch (error) {
      res.status(500).send(`Error when fetching interests: ${(error as Error).message}`);
    }
  };

  router.post('/updateInterests', updateInterests);
  router.post('/getInterestsByTags', getInterestsByTags);
  router.get('/getInterestsByUser/:userId', getInterestsByUser);
  router.post('/getInterestsByUserAndTags', getInterestsByUserAndTags);
  return router;
};

export default interestController;
