import { ObjectId } from 'mongodb';
import { DatabaseQuestion, Interest } from '@fake-stack-overflow/shared';
import QuestionModel from '../models/questions.model';
import UserModel from '../models/users.model';

/**
 * Calculates the weighted sum of tags for each question based on user interests.
 * @param {DatabaseQuestion[]} questions - The list of questions to calculate weights for
 * @param {ObjectId} userId - The user ID to retrieve interests from
 * @returns {Promise<PopulatedDatabaseQuestion[]>} - The list of questions with weights
 */
const calculateWeightedQuestions = async (
  questions: DatabaseQuestion[],
  userId: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const user = await UserModel.findById(userId).populate<{ interests: Interest[] }>('interests');
    if (!user) {
      throw new Error('User not found');
    }
    const interests = user.interests.reduce((acc: Record<string, number>, interest: Interest) => {
      acc[interest._id.toString()] = interest.weight;
      return acc;
    }, {});

    return questions
      .map(question => {
        const weightSum = question.tags.reduce((acc: number, tag) => {
          const tagId = tag._id.toString();
          return acc + (interests[tagId] || 0);
        }, 0);
        return { ...question, weight: weightSum };
      })
      .sort((a, b) => b.weight - a.weight);
  } catch (err) {
    return [];
  }
};

const getQuestionsForInfiniteScroll = async (
  userId: ObjectId,
  limit: number,
  lastQuestionId?: ObjectId,
): Promise<DatabaseQuestion[]> => {
  try {
    const questions = await QuestionModel.find(
      lastQuestionId ? { _id: { $lt: lastQuestionId } } : {},
    )
      .limit(limit)
      .populate('tags');
    const weightedQuestions = await calculateWeightedQuestions(questions, userId);
    return weightedQuestions;
  } catch (err) {
    return [];
  }
};

export { calculateWeightedQuestions, getQuestionsForInfiniteScroll };
