import { ObjectId } from 'mongodb';
import InterestModel from '../models/interest.model';
import UserModel from '../models/users.model';
import { DatabaseUser, Interest, InterestResponse } from '../types/types';

/**
 * Saves a new interest to the database.
 * @param interest - The interest object to save.
 * @returns {Promise<InterestResponse>} - The saved interest or an error message.
 */
export const saveInterest = async (interest: Interest): Promise<InterestResponse> => {
  try {
    const result = await InterestModel.create(interest);

    if (!result) {
      throw Error('Failed to create interest');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving interest: ${error}` };
  }
};

export const getInterestsByIds = async (interestIds: ObjectId[]): Promise<Interest[]> => {
  try {
    return await InterestModel.find({ _id: { $in: interestIds } });
  } catch (error) {
    return [];
  }
};
