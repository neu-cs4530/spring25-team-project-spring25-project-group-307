import mongoose from 'mongoose';
import UserModel from '../../models/users.model';
import grantAchievementToUser from '../../services/achievement.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Achievement service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('grantAchievementToUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should throw an error if user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      await expect(grantAchievementToUser('nonexistentUserId', 'Test Achievement')).rejects.toThrow(
        'User not found.',
      );
    });

    it('should return null if the user already has the acievement', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const user = {
        _id: userId,
        achievements: ['Test Achievement'],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserModel).toReturn(user, 'save');

      const result = await grantAchievementToUser(userId, 'Test Achievement');

      expect(result).toBe(null);
    });

    it('should add the achievement to the user and return it', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const user = {
        _id: userId,
        achievements: [],
      };

      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(UserModel).toReturn(user, 'save');

      const result = await grantAchievementToUser(userId, 'Test Achievement');

      expect(result).toBe('Test Achievement');
    });
  });
});
