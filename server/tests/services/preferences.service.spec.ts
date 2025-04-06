// eslint-disable-next-line @typescript-eslint/no-var-requires

import { DatabasePreferences, UserResponse } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';

import PreferencesModel from '../../models/preferences.model';
import {
  addUserPreferenceToCommunity,
  removeUserPreferenceFromCommunity,
  getPreferencesForCommunity,
  getAllPreferencesForCommunity,
} from '../../services/preferences.service';

import * as userService from '../../services/user.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Preferences Model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('addUserPreferenceToCommunity', () => {
    test('should add userPreference to existing preferences', async () => {
      const mockPreference: DatabasePreferences = {
        _id: new ObjectId(),
        username: 'testUser',
        communityTitle: 'testCommunity',
        userPreferences: ['All Questions'],
      };

      mockingoose(PreferencesModel).toReturn(mockPreference, 'findOneAndUpdate');

      const result = (await addUserPreferenceToCommunity(
        'All Questions',
        'testUser',
        'testCommunity',
      )) as DatabasePreferences;

      for (const key in mockPreference) {
        if (key !== '_id') {
          expect(result[key as keyof DatabasePreferences]).toEqual(
            mockPreference[key as keyof DatabasePreferences],
          );
        }
      }
    });

    test('should create new preferences if not found', async () => {
      const newPref: DatabasePreferences = {
        _id: new ObjectId(),
        username: 'newUser',
        communityTitle: 'newCommunity',
        userPreferences: ['Answers to my Questions'],
      };

      const exampleUser: UserResponse = {
        _id: new ObjectId('6611d73ff29d6f9f44b0c0a1'),
        dateJoined: new Date('2024-01-15T10:00:00Z'),
        biography: 'Just a curious developer exploring the world of code.',
        ranking: 'Gold',
        score: 1520,
        achievements: ['First Question', 'Top Answer', 'Nim Game Champion'],
        questionsAsked: 12,
        responsesGiven: 47,
        lastLogin: new Date('2025-04-05T18:30:00Z'),
        savedQuestions: [
          new ObjectId('6611d75bf29d6f9f44b0c0b2'),
          new ObjectId('6611d761f29d6f9f44b0c0b3'),
        ],
        nimGameWins: 5,
        upVotesGiven: 130,
        downVotesGiven: 12,
        username: 'vidmaster123',
      };

      mockingoose(PreferencesModel).toReturn(null, 'findOneAndUpdate');
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValueOnce(exampleUser);
      mockingoose(PreferencesModel).toReturn(newPref, 'create');

      const result = (await addUserPreferenceToCommunity(
        'Answers to my Questions',
        'newUser',
        'newCommunity',
      )) as DatabasePreferences;

      for (const key in newPref) {
        if (key !== '_id') {
          expect(result[key as keyof DatabasePreferences]).toEqual(
            newPref[key as keyof DatabasePreferences],
          );
        }
      }
    });

    test('should return error if exception is thrown', async () => {
      mockingoose(PreferencesModel).toReturn(new Error('DB error'), 'findOneAndUpdate');

      const result = await addUserPreferenceToCommunity(
        'Comments on my Questions',
        'user',
        'community',
      );

      expect(result).toHaveProperty('error');
    });
  });

  describe('removeUserPreferenceFromCommunity', () => {
    test('should remove userPreference from existing preferences', async () => {
      const updatedPref: DatabasePreferences = {
        _id: new ObjectId(),
        username: 'user',
        communityTitle: 'community',
        userPreferences: [],
      };

      mockingoose(PreferencesModel).toReturn(updatedPref, 'findOneAndUpdate');

      const result = (await removeUserPreferenceFromCommunity(
        'All Questions',
        'user',
        'community',
      )) as DatabasePreferences;

      for (const key in updatedPref) {
        if (key !== '_id') {
          expect(result[key as keyof DatabasePreferences]).toEqual(
            updatedPref[key as keyof DatabasePreferences],
          );
        }
      }
    });

    test('should return error if preferences not found', async () => {
      mockingoose(PreferencesModel).toReturn(null, 'findOneAndUpdate');

      const result = await removeUserPreferenceFromCommunity('All Questions', 'user', 'community');

      expect(result).toHaveProperty('error');
    });

    test('should return error if exception thrown', async () => {
      mockingoose(PreferencesModel).toReturn(new Error('DB error'), 'findOneAndUpdate');

      const result = await removeUserPreferenceFromCommunity('All Questions', 'user', 'community');

      expect(result).toHaveProperty('error');
    });
  });

  describe('getPreferencesForCommunity', () => {
    test('should return preferences for given user and community', async () => {
      const pref: DatabasePreferences = {
        _id: new ObjectId(),
        username: 'user',
        communityTitle: 'community',
        userPreferences: ['All Questions'],
      };

      mockingoose(PreferencesModel).toReturn(pref, 'findOne');

      const result: DatabasePreferences = (await getPreferencesForCommunity(
        'user',
        'community',
      )) as DatabasePreferences;

      expect(result.username).toBe(pref.username);
      expect(result.communityTitle).toBe(pref.communityTitle);
      expect(result.userPreferences).toEqual(pref.userPreferences);
    });

    test('should return error if preferences not found', async () => {
      mockingoose(PreferencesModel).toReturn(null, 'findOne');

      const result = await getPreferencesForCommunity('user', 'community');

      expect(result).toHaveProperty('error');
    });

    test('should return error if exception thrown', async () => {
      mockingoose(PreferencesModel).toReturn(new Error('DB error'), 'findOne');

      const result = await getPreferencesForCommunity('user', 'community');

      expect(result).toHaveProperty('error');
    });
  });

  describe('getAllPreferencesForCommunity', () => {
    test('should return all preferences for community', async () => {
      const prefs: DatabasePreferences[] = [
        {
          _id: new ObjectId(),
          username: 'user1',
          communityTitle: 'community',
          userPreferences: ['All Questions'],
        },
        {
          _id: new ObjectId(),
          username: 'user2',
          communityTitle: 'community',
          userPreferences: ['Answers to my Questions'],
        },
      ];

      mockingoose(PreferencesModel).toReturn(prefs, 'find');

      const result = (await getAllPreferencesForCommunity('community')) as DatabasePreferences[];

      expect(result.length).toBe(prefs.length);

      result.forEach((res, idx) => {
        const expected = prefs[idx];
        for (const key in expected) {
          if (key !== '_id') {
            expect(res[key as keyof DatabasePreferences]).toEqual(
              expected[key as keyof DatabasePreferences],
            );
          }
        }
      });
    });

    test('should return empty array if exception thrown', async () => {
      mockingoose(PreferencesModel).toReturn(new Error('DB error'), 'find');

      const result = await getAllPreferencesForCommunity('community');

      expect(result).toEqual([]);
    });
  });
});
