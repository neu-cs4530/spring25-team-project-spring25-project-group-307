import * as userNotificationsService from '../../services/userNotifications.service';
import UserNotificationsModel from '../../models/userNotifications.model';
import { DatabaseUserNotifications, Notification } from '../../types/types';

jest.mock('../../models/userNotifications.model');

const mockNotification: Notification = {
  questionId: '123',
  message: 'New message',
};

const mockUserNotifications: DatabaseUserNotifications = {
  _id: '1234567890abcdef12345678',
  username: 'testUser',
  notifications: [mockNotification],
};

describe('UserNotifications Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return user notifications', async () => {
      (UserNotificationsModel.findOne as jest.Mock).mockResolvedValue(mockUserNotifications);

      const result = await userNotificationsService.getNotifications('testUser');

      expect(UserNotificationsModel.findOne).toHaveBeenCalledWith({ username: 'testUser' });
      expect(result).toEqual(mockUserNotifications);
    });

    it('should return null if an error occurs', async () => {
      (UserNotificationsModel.findOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await userNotificationsService.getNotifications('testUser');

      expect(result).toBeNull();
    });
  });

  describe('addNotification', () => {
    it('should add a notification and return updated user notifications', async () => {
      (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockUserNotifications,
      );

      const result = await userNotificationsService.addNotification('testUser', mockNotification);

      expect(UserNotificationsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testUser' },
        { $push: { notifications: mockNotification } },
        { new: true, upsert: true },
      );
      expect(result).toEqual(mockUserNotifications);
    });

    it('should return an error object if db update fails', async () => {
      (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      const result = await userNotificationsService.addNotification('testUser', mockNotification);

      expect(result).toEqual({ error: 'Error when adding notification: DB Error' });
    });
  });

  describe('clearNotification', () => {
    it('should remove a specific notification', async () => {
      (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockUserNotifications,
      );

      const result = await userNotificationsService.clearNotification('testUser', '123');

      expect(UserNotificationsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testUser' },
        { $pull: { notifications: { questionId: '123' } } },
        { new: true },
      );
      expect(result).toEqual(mockUserNotifications);
    });

    it('should return an error object if db update fails', async () => {
      (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      const result = await userNotificationsService.clearNotification('testUser', '123');

      expect(result).toEqual({ error: 'Error when clearing notification: DB Error' });
    });
  });

  describe('clearAllNotifications', () => {
    it('should clear all notifications', async () => {
      (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockUserNotifications,
      );

      const result = await userNotificationsService.clearAllNotifications('testUser');

      expect(UserNotificationsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testUser' },
        { $set: { notifications: [] } },
        { new: true },
      );
      expect(result).toEqual(mockUserNotifications);
    });

    it('should return an error object if db update fails', async () => {
      (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      const result = await userNotificationsService.clearAllNotifications('testUser');

      expect(result).toEqual({ error: 'Error when clearing all notifications: DB Error' });
    });
  });

  it('should return an error object if result is null when adding notification', async () => {
    (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    const result = await userNotificationsService.addNotification('testUser', mockNotification);

    expect(UserNotificationsModel.findOneAndUpdate).toHaveBeenCalledWith(
      { username: 'testUser' },
      { $push: { notifications: mockNotification } },
      { new: true, upsert: true },
    );
    expect(result).toEqual({
      error: 'Error when adding notification: Failed to add notification for user',
    });
  });

  it('should return an error object if result is null when clearing notification', async () => {
    (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    const result = await userNotificationsService.clearNotification('testUser', '123');

    expect(UserNotificationsModel.findOneAndUpdate).toHaveBeenCalledWith(
      { username: 'testUser' },
      { $pull: { notifications: { questionId: '123' } } },
      { new: true },
    );
    expect(result).toEqual({
      error:
        'Error when clearing notification: User not found or no matching notification to clear',
    });
  });

  it('should return an error object if result is null when clearing all notifications', async () => {
    (UserNotificationsModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    const result = await userNotificationsService.clearAllNotifications('testUser');

    expect(UserNotificationsModel.findOneAndUpdate).toHaveBeenCalledWith(
      { username: 'testUser' },
      { $set: { notifications: [] } },
      { new: true },
    );
    expect(result).toEqual({
      error: 'Error when clearing all notifications: User not found',
    });
  });
});
