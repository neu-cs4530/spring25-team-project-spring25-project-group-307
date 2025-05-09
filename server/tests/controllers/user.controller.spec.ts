import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/user.service';
import { SafeDatabaseUser, User } from '../../types/types';

const mockUser: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  biography: 'I am a user',
  ranking: 'Newcomer Newbie',
  score: 0,
  achievements: [],
  questionsAsked: 0,
  responsesGiven: 0,
  lastLogin: new Date('2024-12-03'),
  savedQuestions: [],
  nimGameWins: 0,
  upVotesGiven: 0,
  downVotesGiven: 0,
  commentsMade: 0,
};

const mockSafeUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  biography: 'I am a user',
  ranking: 'Newcomer Newbie',
  score: 0,
  achievements: [],
  questionsAsked: 0,
  responsesGiven: 0,
  lastLogin: new Date('2024-12-03'),
  savedQuestions: [],
  nimGameWins: 0,
  upVotesGiven: 0,
  downVotesGiven: 0,
  commentsMade: 0,
};

const mockUserJSONResponse = {
  _id: mockSafeUser._id.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
  biography: 'I am a user',
  ranking: 'Newcomer Newbie',
  score: 0,
  achievements: [],
  questionsAsked: 0,
  responsesGiven: 0,
  lastLogin: new Date('2024-12-03').toISOString(),
  savedQuestions: [],
  nimGameWins: 0,
  upVotesGiven: 0,
  downVotesGiven: 0,
  commentsMade: 0,
};

const saveUserSpy = jest.spyOn(util, 'saveUser');
const loginUserSpy = jest.spyOn(util, 'loginUser');
const updatedUserSpy = jest.spyOn(util, 'updateUser');
const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
const getUsersListSpy = jest.spyOn(util, 'getUsersList');
const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
const addUserSavedQuestionSpy = jest.spyOn(util, 'addUserSavedQuestion');
const removeUserSavedQuestionSpy = jest.spyOn(util, 'removeUserSavedQuestion');
const getUserWithSavedQuestionSpy = jest.spyOn(util, 'getUserWithSavedQuestions');

describe('Test userController', () => {
  describe('POST /signup', () => {
    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
      };

      saveUserSpy.mockResolvedValueOnce({ ...mockSafeUser, biography: mockReqBody.biography });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUserJSONResponse,
        biography: mockReqBody.biography,
        achievements: [],
        lastLogin: new Date('2024-12-03').toISOString(),
        ranking: 'Newcomer Newbie',
        score: 0,
        responsesGiven: 0,
        questionsAsked: 0,
        savedQuestions: [],
        nimGameWins: 0,
        upVotesGiven: 0,
        downVotesGiven: 0,
        commentsMade: 0,
      });
      expect(saveUserSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        biography: mockReqBody.biography,
        dateJoined: expect.any(Date),
        achievements: [],
        questionsAsked: 0,
        responsesGiven: 0,
        lastLogin: expect.any(Date),
        ranking: 'Newcomer Newbie',
        score: 0,
        savedQuestions: [],
        nimGameWins: 0,
        upVotesGiven: 0,
        downVotesGiven: 0,
        commentsMade: 0,
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce({ error: 'Error authenticating user' });

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /resetPassword', () => {
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, { password: 'newPassword' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while updating', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getUser', () => {
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).get('/user/getUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /getUsers', () => {
    it('should return the users from the database', async () => {
      getUsersListSpy.mockResolvedValueOnce([mockSafeUser]);

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockUserJSONResponse]);
      expect(getUsersListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getUsersListSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteUser', () => {
    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error deleting user' });

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).delete('/user/deleteUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /updateBiography', () => {
    it('should successfully update biography given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'This is my new bio',
      };

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        biography: 'This is my new bio',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        biography: 'some new biography',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        biography: 'a new bio',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing biography field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'Attempting update biography',
      };

      // Simulate a DB error
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating user biography: Error: Error updating user',
      );
    });
  });

  describe('PATCH /addSavedQuestion', () => {
    it('should successfully add a saved question given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        questionId: new mongoose.Types.ObjectId(),
      };

      addUserSavedQuestionSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/addSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(addUserSavedQuestionSpy).toHaveBeenCalledWith(
        mockUser.username,
        mockReqBody.questionId.toString(),
      );
    });
    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        questionId: new mongoose.Types.ObjectId(),
      };

      const response = await supertest(app).patch('/user/addSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request body');
    });
    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        questionId: new mongoose.Types.ObjectId(),
      };

      const response = await supertest(app).patch('/user/addSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request body');
    });
    it('should return 400 for request missing questionId field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/addSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request body');
    });
    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        questionId: new mongoose.Types.ObjectId(),
      };

      addUserSavedQuestionSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/addSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when adding saved question: Error: Error updating user',
      );
    });
  });

  describe('PATCH /removeSavedQuestion', () => {
    it('should successfully remove a saved question given correct arguments', async () => {
      const qId = new mongoose.Types.ObjectId();
      const mockReqBody = {
        username: mockUser.username,
        questionId: qId,
      };

      removeUserSavedQuestionSpy.mockResolvedValueOnce({ ...mockSafeUser, savedQuestions: [] });

      const response = await supertest(app).patch('/user/removeSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(removeUserSavedQuestionSpy).toHaveBeenCalledWith(
        mockUser.username,
        mockReqBody.questionId.toString(),
      );
    });
    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        questionId: new mongoose.Types.ObjectId(),
      };

      const response = await supertest(app).patch('/user/removeSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request body');
    });
    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        questionId: new mongoose.Types.ObjectId(),
      };

      const response = await supertest(app).patch('/user/removeSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request body');
    });
    it('should return 400 for request missing questionId field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/removeSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid request body');
    });
    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        questionId: new mongoose.Types.ObjectId(),
      };

      removeUserSavedQuestionSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/removeSavedQuestion').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when removing saved question: Error: Error updating user',
      );
    });
  });

  describe('GET /getUserWithSavedQuestions', () => {
    it('should return the user with saved questions given correct arguments', async () => {
      getUserWithSavedQuestionSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/getUserSavedQuestions/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserWithSavedQuestionSpy).toHaveBeenCalledWith(mockUser.username);
    });
    it('should return 500 if database error while searching username', async () => {
      getUserWithSavedQuestionSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/user/getUserSavedQuestions/${mockUser.username}`);

      expect(response.status).toBe(500);
    });
    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).get('/user/getUserSavedQuestions/');
      expect(response.status).toBe(404);
    });
  });
});
