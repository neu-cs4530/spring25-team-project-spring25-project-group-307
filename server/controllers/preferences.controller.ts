import express, { Response } from 'express';
import { addUserPreferenceToCommunity } from '../services/preferences.service';
import { AddPreferenceRequest, UserPreference } from '../types/types';

const preferencesController = () => {
  const ALL_USER_PREFERENCES: UserPreference[] = ['All Questions'];

  const router = express.Router();
  /**
   * Validates a AddPreferenceRequest
   * @param req the request
   * @returns true if valid, otherwise false
   */
  const ValidateAddPreferenceRequest = (req: AddPreferenceRequest) => {
    if (
      req.body === undefined ||
      req.body.userPreference === undefined ||
      (req.body.userPreference as string) === '' ||
      req.body.username === undefined ||
      req.body.username === '' ||
      req.body.communityTitle === undefined ||
      req.body.communityTitle === ''
    ) {
      return false;
    }
    return ALL_USER_PREFERENCES.includes(req.body.userPreference);
  };

  /**
   * Adds a new answer to a question in the database. The answer request and answer are
   * validated and then saved. If successful, the answer is associated with the corresponding
   * question. If there is an error, the HTTP response's status is updated.
   *
   * @param req The AnswerRequest object containing the question ID and answer data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addPreference = async (req: AddPreferenceRequest, res: Response): Promise<void> => {
    if (!ValidateAddPreferenceRequest(req)) {
      res
        .status(400)
        .send('Please include a valid preference, community title, and username in the body');
      return;
    }

    const { communityTitle, userPreference, username } = req.body;

    try {
      const preferences = await addUserPreferenceToCommunity(
        userPreference,
        username,
        communityTitle,
      );

      if ('error' in preferences) {
        throw new Error(preferences.error as string);
      }

      res.json(preferences);
    } catch (err) {
      res.status(500).send(`Error when adding preference: ${(err as Error).message}`);
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.post('/addPreference', addPreference);

  return router;
};

export default preferencesController;
