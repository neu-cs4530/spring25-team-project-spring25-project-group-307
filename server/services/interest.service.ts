import { ObjectId } from 'mongodb';
import InterestModel from '../models/interest.model';
import { DeleteResultResponse, Interest, InterestResponse } from '../types/types';

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

export const updateInterestWeightMultiplicative = async (
  userId: ObjectId,
  tagId: ObjectId,
  factor: number,
): Promise<InterestResponse> => {
  try {
    const result = await InterestModel.findOneAndUpdate(
      { userId, tagId },
      { $mul: { weight: factor } },
      { new: true },
    );

    if (!result) {
      throw Error('Failed to update interest weight');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when updating interest weight: ${error}` };
  }
};

export const deleteInterest = async (interest: Interest): Promise<InterestResponse> => {
  try {
    const result = await InterestModel.findOneAndDelete(interest);

    if (!result) {
      throw Error('Failed to delete interest');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when deleting interest: ${error}` };
  }
};

export const deleteInterestsByUserId = async (aUserId: ObjectId): Promise<DeleteResultResponse> => {
  try {
    const result = await InterestModel.deleteMany({ userId: aUserId });

    if (!result) {
      throw Error('Failed to delete interests');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when deleting interests: ${error}` };
  }
};

export const getInterestsByUserId = async (aUserId: ObjectId): Promise<Interest[]> => {
  try {
    return await InterestModel.find({ userId: aUserId });
  } catch (error) {
    return [];
  }
};

export const getInterestsByTagIds = async (tagIds: ObjectId[]): Promise<Interest[]> => {
  try {
    return await InterestModel.find({ tagId: { $in: tagIds } });
  } catch (error) {
    return [];
  }
};

export const getInterestsByUserIdAndTagIds = async (
  aUserId: ObjectId,
  tagIds: ObjectId[],
): Promise<Interest[]> => {
  try {
    return await InterestModel.find({ userId: aUserId, tagId: { $in: tagIds } });
  } catch (error) {
    return [];
  }
};
