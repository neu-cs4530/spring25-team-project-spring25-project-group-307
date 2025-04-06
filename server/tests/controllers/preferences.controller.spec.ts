import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as preferencesService from '../../services/preferences.service';
import { DatabasePreferences } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';

const addUserPreferenceToCommunitySpy = jest.spyOn(
  preferencesService,
  'addUserPreferenceToCommunity',
);
const removeUserPreferenceFromCommunitySpy = jest.spyOn(
  preferencesService,
  'removeUserPreferenceFromCommunity',
);

const getPreferencesForCommunitySpy = jest.spyOn(preferencesService, 'getPreferencesForCommunity');

describe('Preferences Controller', () => {
  describe('POST /preferences/addPreference', () => {
    it('should add a user preference to a community', async () => {
      const mockReqBody = {
        communityTitle: 'community',
        username: 'user',
        userPreference: 'All Questions', // Note: changed from preference to userPreference
      };

      const mockPreference: DatabasePreferences = {
        _id: new ObjectId(),
        username: 'user',
        communityTitle: 'community',
        userPreferences: ['All Questions'],
      };

      addUserPreferenceToCommunitySpy.mockResolvedValueOnce(mockPreference);

      const response = await supertest(app).post('/preferences/addPreference').send(mockReqBody);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /preferences/removePreference', () => {
    it('should remove a user preference from a community', async () => {
      const mockReqBody = {
        communityTitle: 'testCommunity',
        username: 'testUser',
        userPreference: 'All Questions', // Aligning with the expected field names in the controller
      };

      const mockPreference: DatabasePreferences = {
        _id: new ObjectId(),
        username: 'testUser',
        communityTitle: 'testCommunity',
        userPreferences: [],
      };

      removeUserPreferenceFromCommunitySpy.mockResolvedValueOnce(mockPreference);

      const response = await supertest(app).post('/preferences/removePreference').send(mockReqBody);

      expect(response.status).toBe(200);
    });

    it('should return 400 if request body is invalid', async () => {
      const response = await supertest(app).post('/preferences/removePreference').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 if service throws error on add', async () => {
      addUserPreferenceToCommunitySpy.mockRejectedValueOnce(new Error('DB Error'));

      const response = await supertest(app).post('/preferences/addPreference').send({
        communityId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        preference: 'dark-mode',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 if service throws error on remove', async () => {
      removeUserPreferenceFromCommunitySpy.mockRejectedValueOnce(new Error('DB Error'));

      const response = await supertest(app).post('/preferences/removePreference').send({
        communityId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        preference: 'dark-mode',
      });

      expect(response.status).toBe(400);
    });
  });
});

describe('GET /preferences/getPreferences', () => {
  it('should return user preferences for a community', async () => {
    // Mock the response from the service function

    const mockUsername = 'testUser';
    const mockCommunityTitle = 'testCommunity';
    const mockPreferencesResponse: DatabasePreferences = {
      _id: new ObjectId(),
      username: mockUsername,
      communityTitle: mockCommunityTitle,
      userPreferences: ['All Questions'],
    };

    getPreferencesForCommunitySpy.mockResolvedValueOnce(mockPreferencesResponse);

    // Send a valid request
    const response = await supertest(app)
      .get('/preferences/getPreferences')
      .query({ username: mockUsername, communityTitle: mockCommunityTitle });

    expect(response.status).toBe(200);
  });

  it('should return 400 if username or communityTitle is missing', async () => {
    const response = await supertest(app).get('/preferences/getPreferences').query({}); // Missing required query params

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      'Please include a valid username and community title in the query parameters',
    );
  });
});
