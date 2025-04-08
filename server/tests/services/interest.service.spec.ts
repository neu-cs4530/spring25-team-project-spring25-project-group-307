import mongoose from 'mongoose';
import InterestModel from '../../models/interest.model';
import {
  saveInterest,
  updateInterestWeightMultiplicative,
  deleteInterest,
  deleteInterestByTagId,
  deleteInterestsByUserId,
  getInterestsByUserId,
  resetInterestsWeightsByUserId,
  getInterestsByTagIds,
  getInterestsByUserIdAndTagIds,
} from '../../services/interest.service';
import { DeleteResultResponse, DatabaseInterest } from '../../types/types';
import * as mockData from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Interest model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveInterest', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should save an interest', async () => {
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };

      mockingoose(InterestModel).toReturn(interest, 'create');

      const result = (await saveInterest(interest)) as DatabaseInterest;

      expect(result._id).toEqual(interest._id);
      expect(result.userId).toEqual(interest.userId);
      expect(result.tagId).toEqual(interest.tagId);
      expect(result.weight).toEqual(interest.weight);
    });

    it('should return an error if saving fails', async () => {
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(InterestModel, 'create').mockImplementation(() => {
        throw new Error('Failed to create interest');
      });

      const result = await saveInterest(interest);

      expect(result).toEqual({
        error: 'Error occurred when saving interest: Error: Failed to create interest',
      });
    });

    it('should return an error if saving fails with null', async () => {
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };

      jest
        .spyOn(InterestModel, 'create')
        .mockResolvedValue(null as unknown as ReturnType<typeof InterestModel.create>);

      const result = await saveInterest(interest);

      expect(result).toEqual({
        error: 'Error occurred when saving interest: Error: Failed to create interest',
      });
    });
  });

  describe('updateInterestWeightMultiplicative', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should update the weight of an interest multiplicatively', async () => {
      const userId = mockData.safeUser._id;
      const tagId = mockData.tag1._id;
      const factor = 2;
      const updatedInterest: DatabaseInterest = {
        ...mockData.INTERESTS[1],
        weight: 4,
        _id: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(InterestModel, 'findOneAndUpdate').mockResolvedValue(updatedInterest);

      const result = (await updateInterestWeightMultiplicative(
        userId,
        tagId,
        factor,
      )) as DatabaseInterest;

      expect(result._id).toEqual(updatedInterest._id);
      expect(result.userId).toEqual(updatedInterest.userId);
      expect(result.tagId).toEqual(updatedInterest.tagId);
      expect(result.weight).toEqual(updatedInterest.weight);
    });

    it('should return an error if updating fails', async () => {
      const userId = mockData.safeUser._id;
      const tagId = mockData.tag1._id;
      const factor = 2;

      jest.spyOn(InterestModel, 'findOneAndUpdate').mockImplementation(() => {
        throw new Error('Failed to update interest weight');
      });

      const result = await updateInterestWeightMultiplicative(userId, tagId, factor);
      expect(result).toEqual({
        error:
          'Error occurred when updating interest weight: Error: Failed to update interest weight',
      });
    });

    it('should return an error if updating fails with null', async () => {
      const userId = mockData.safeUser._id;
      const tagId = mockData.tag1._id;
      const factor = 2;

      jest
        .spyOn(InterestModel, 'findOneAndUpdate')
        .mockResolvedValue(null as unknown as ReturnType<typeof InterestModel.findOneAndUpdate>);

      const result = await updateInterestWeightMultiplicative(userId, tagId, factor);
      expect(result).toEqual({
        error:
          'Error occurred when updating interest weight: Error: Failed to update interest weight',
      });
    });
  });
  describe('deleteInterest', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should delete an interest', async () => {
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(InterestModel, 'findOneAndDelete').mockResolvedValue(interest);

      const result = (await deleteInterest(interest)) as DatabaseInterest;

      expect(result._id).toEqual(interest._id);
      expect(result.userId).toEqual(interest.userId);
      expect(result.tagId).toEqual(interest.tagId);
      expect(result.weight).toEqual(interest.weight);
    });

    it('should return an error if deleting fails', async () => {
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };
      jest.spyOn(InterestModel, 'findOneAndDelete').mockImplementation(() => {
        throw new Error('Failed to delete interest');
      });

      const result = await deleteInterest(interest);

      expect(result).toEqual({
        error: 'Error occurred when deleting interest: Error: Failed to delete interest',
      });
    });

    it('should return an error if deleting fails with null', async () => {
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };
      jest
        .spyOn(InterestModel, 'findOneAndDelete')
        .mockResolvedValue(null as unknown as ReturnType<typeof InterestModel.findOneAndDelete>);

      const result = await deleteInterest(interest);

      expect(result).toEqual({
        error: 'Error occurred when deleting interest: Error: Failed to delete interest',
      });
    });
  });
  describe('deleteInterestByTagId', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should delete an interest by tag ID', async () => {
      const tagId = mockData.tag1;
      const interest: DatabaseInterest = {
        ...mockData.INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(InterestModel, 'findOneAndDelete').mockResolvedValue(interest);

      const result = (await deleteInterestByTagId(tagId._id)) as DatabaseInterest;

      expect(result._id).toEqual(interest._id);
      expect(result.userId).toEqual(interest.userId);
      expect(result.tagId).toEqual(interest.tagId);
      expect(result.weight).toEqual(interest.weight);
    });

    it('should return an error if deleting fails', async () => {
      const tagId = mockData.tag1;

      jest.spyOn(InterestModel, 'findOneAndDelete').mockImplementation(() => {
        throw new Error('Failed to delete interest');
      });

      const result = await deleteInterestByTagId(tagId._id);

      expect(result).toEqual({
        error: 'Error occurred when deleting interest: Error: Failed to delete interest',
      });
    });

    it('should return an error if deleting fails with null', async () => {
      const tagId = mockData.tag1;

      jest
        .spyOn(InterestModel, 'findOneAndDelete')
        .mockResolvedValue(null as unknown as ReturnType<typeof InterestModel.findOneAndDelete>);

      const result = await deleteInterestByTagId(tagId._id);

      expect(result).toEqual({
        error: 'Error occurred when deleting interest: Error: Failed to delete interest',
      });
    });
  });
  describe('deleteInterestsByUserId', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should delete interests by user ID', async () => {
      const userId = mockData.safeUser2._id;
      const deleteResult: DeleteResultResponse = { deletedCount: 1 };

      jest.spyOn(InterestModel, 'deleteMany').mockResolvedValue(deleteResult);

      const result = await deleteInterestsByUserId(userId);

      expect(result).toEqual(deleteResult);
    });

    it('should return an error if deleting fails', async () => {
      const userId = mockData.safeUser2._id;

      jest.spyOn(InterestModel, 'deleteMany').mockImplementation(() => {
        throw new Error('Failed to delete interests');
      });

      const result = await deleteInterestsByUserId(userId);

      expect(result).toEqual({
        error: 'Error occurred when deleting interests: Error: Failed to delete interests',
      });
    });

    it('should return an error if deleting fails with null', async () => {
      const userId = mockData.safeUser2._id;

      jest
        .spyOn(InterestModel, 'deleteMany')
        .mockResolvedValue(null as unknown as ReturnType<typeof InterestModel.deleteMany>);

      const result = await deleteInterestsByUserId(userId);

      expect(result).toEqual({
        error: 'Error occurred when deleting interests: Error: Failed to delete interests',
      });
    });
  });
  describe('getInterestsByUserId', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should get interests by user ID', async () => {
      const userId = mockData.safeUser2._id;
      const interests = mockData.INTERESTS.slice(1, 1);

      jest.spyOn(InterestModel, 'find').mockResolvedValue(interests);

      const result = await getInterestsByUserId(userId);

      expect(result).toHaveLength(interests.length);
    });

    it('should return an empty array if getting fails', async () => {
      const userId = mockData.safeUser2._id;

      jest.spyOn(InterestModel, 'find').mockImplementation(() => {
        throw new Error('Failed to get interests');
      });

      const result = await getInterestsByUserId(userId);

      expect(result).toEqual([]);
    });
  });
  describe('resetInterestsWeightsByUserId', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should reset interest weights by user ID', async () => {
      const userId = mockData.safeUser3._id;
      const interests = mockData.INTERESTS.slice(1);
      const mockResult = {
        acknowledged: true,
        deletedCount: 0,
        insertedCount: 0,
        matchedCount: 0,
        modifiedCount: 3,
        upsertedCount: 0,
        upsertedIds: {},
        insertedIds: {},
        ok: 1,
        isOk: () => true,
        getUpsertedIdAt: () => null,
        getWriteConcernError: () => null,
        getInsertedIds: () => [],
        getMatchedCount: () => 0,
        getModifiedCount: () => 3,
        getDeletedCount: () => 0,
        getUpsertedCount: () => 0,
        getInsertedCount: () => 0,
        hasWriteErrors: () => false,
        getWriteErrorCount: () => 0,
        getWriteErrorAt: () => null,
        getWriteErrors: () => [],
        getUpsertedIds: () => ({}),
        getRawResponse: () => ({}),
      } as unknown as mongoose.mongo.BulkWriteResult;

      jest.spyOn(InterestModel, 'find').mockResolvedValue(interests);
      jest.spyOn(InterestModel, 'bulkWrite').mockResolvedValue(mockResult);

      const result = await resetInterestsWeightsByUserId(userId);

      expect(result).toHaveLength(interests.length);
    });

    it('should return an empty array if getting fails', async () => {
      const userId = mockData.safeUser3._id;

      jest.spyOn(InterestModel, 'find').mockImplementation(() => {
        throw new Error('Failed to reset interests');
      });

      const result = await resetInterestsWeightsByUserId(userId);

      expect(result).toEqual([]);
    });
  });
  describe('getInterestsByTagIds', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should get interests by tag IDs', async () => {
      const tagIds = [mockData.tag1._id, mockData.tag2._id];
      const interests = mockData.INTERESTS.slice(0, 3);

      jest.spyOn(InterestModel, 'find').mockResolvedValue(interests);

      const result = await getInterestsByTagIds(tagIds);

      expect(result).toHaveLength(interests.length);
    });

    it('should return an empty array if getting fails', async () => {
      const tagIds = [mockData.tag1._id, mockData.tag2._id];

      jest.spyOn(InterestModel, 'find').mockImplementation(() => {
        throw new Error('Failed to get interests');
      });

      const result = await getInterestsByTagIds(tagIds);

      expect(result).toEqual([]);
    });
  });
  describe('getInterestsByUserIdAndTagIds', () => {
    beforeEach(() => {
      mockingoose(InterestModel).reset();
      jest.clearAllMocks();
    });
    it('should get interests by user ID and tag IDs', async () => {
      const userId = mockData.safeUser2._id;
      const tagIds = [mockData.tag1._id, mockData.tag2._id];
      const interests = mockData.INTERESTS.slice(0, 1);

      jest.spyOn(InterestModel, 'find').mockResolvedValue(interests);

      const result = await getInterestsByUserIdAndTagIds(userId, tagIds);

      expect(result).toHaveLength(interests.length);
    });

    it('should return an empty array if getting fails', async () => {
      const userId = mockData.safeUser._id;
      const tagIds = [mockData.tag1._id, mockData.tag2._id];

      jest.spyOn(InterestModel, 'find').mockImplementation(() => {
        throw new Error('Failed to get interests');
      });

      const result = await getInterestsByUserIdAndTagIds(userId, tagIds);

      expect(result).toEqual([]);
    });
  });
});
