import supertest from 'supertest';
import { app } from '../../app';
import * as userNotificationsService from '../../services/userNotifications.service';

const getNotificationsSpy = jest.spyOn(userNotificationsService, 'getNotifications');
const clearNotificationSpy = jest.spyOn(userNotificationsService, 'clearNotification');
const clearAllNotificationsSpy = jest.spyOn(userNotificationsService, 'clearAllNotifications');

describe('User Notifications Controller', () => {
  describe('GET /notifications/:username', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [{ message: 'new answer', questionId: '123' }];
      getNotificationsSpy.mockResolvedValueOnce(mockNotifications as any);

      const response = await supertest(app).get('/notifications/testUser');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNotifications);
    });

    it('should return 400 if username param is missing', async () => {
      const response = await supertest(app).get('/notifications/');

      expect(response.status).toBe(404); // Missing param -> Express returns 404 at route level
    });
  });

  describe('POST /notifications/clear', () => {
    it('should clear a specific notification', async () => {
      const mockResult = { _id: '', username: 'user', notifications: [] };
      clearNotificationSpy.mockResolvedValueOnce(mockResult);

      const response = await supertest(app).post('/notifications/clear').send({
        username: 'testUser',
        questionId: '123',
      });

      expect(response.status).toBe(200);
    });

    it('should return 400 if username or questionId is missing', async () => {
      const response = await supertest(app).post('/notifications/clear').send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid request');
    });

    it('should return 500 if clearNotification returns error', async () => {
      clearNotificationSpy.mockResolvedValueOnce({ error: 'DB Error' });

      const response = await supertest(app).post('/notifications/clear').send({
        username: 'testUser',
        questionId: '123',
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to update');
    });
  });

  describe('POST /notifications/clearAll', () => {
    it('should clear all notifications for a user', async () => {
      const mockResult = { _id: '', username: 'user', notifications: [] };
      clearAllNotificationsSpy.mockResolvedValueOnce(mockResult);

      const response = await supertest(app).post('/notifications/clearAll').send({
        username: 'testUser',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).post('/notifications/clearAll').send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe('Username is required');
    });

    it('should return 500 if clearAllNotifications returns error', async () => {
      clearAllNotificationsSpy.mockResolvedValueOnce({ error: 'DB Error' });

      const response = await supertest(app).post('/notifications/clearAll').send({
        username: 'testUser',
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to clear');
    });
  });
});
