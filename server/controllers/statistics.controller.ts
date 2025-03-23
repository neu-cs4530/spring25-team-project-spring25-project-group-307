import express, { Response, Request } from 'express';
import Question from '../models/questions.model';
import Answer from '../models/answers.model';

const router = express.Router();

/**
 * GET /user/statistics/:username
 * Fetches the count of questions and answers posted by a user.
 */
router.get('/statistics/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Count the number of questions the user has asked
    const questionsAsked = await Question.countDocuments({ askedBy: username });

    // Count the number of answers the user has given
    const responsesGiven = await Answer.countDocuments({ ansBy: username });

    return res.json({ questionsAsked, responsesGiven });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
