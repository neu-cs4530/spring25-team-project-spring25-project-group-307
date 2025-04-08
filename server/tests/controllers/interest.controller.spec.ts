import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as interestUtil from '../../services/interest.service';
import { Tag, SafeDatabaseUser, Interest, DatabaseTag, DatabaseInterest } from '../../types/types';
import * as userUtil from '../../services/user.service';

const getUserByUsernameSpy = jest.spyOn(userUtil, 'getUserByUsername');
const getInterestsByUserIdSpy = jest.spyOn(interestUtil, 'getInterestsByUserId');
const saveInterestSpy = jest.spyOn(interestUtil, 'saveInterest');
const deleteInterestSpy = jest.spyOn(interestUtil, 'deleteInterest');
const getInterestsByTagIdsSpy = jest.spyOn(interestUtil, 'getInterestsByTagIds');
const getInterestsByUserIdAndTagIdsSpy = jest.spyOn(interestUtil, 'getInterestsByUserIdAndTagIds');
const resetInterestsWeightsByUserIdSpy = jest.spyOn(interestUtil, 'resetInterestsWeightsByUserId');
const updateInterestWeightMultiplicativeSpy = jest.spyOn(
  interestUtil,
  'updateInterestWeightMultiplicative',
);

const tag1: Tag = {
  name: 'tag1',
  description: 'tag1 description',
};

const dbTag1: DatabaseTag = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
  ...tag1,
};

const tag2: Tag = {
  name: 'tag2',
  description: 'tag2 description',
};

const dbTag2: DatabaseTag = {
  _id: new mongoose.Types.ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  ...tag2,
};

const tag3: Tag = {
  name: 'tag3',
  description: 'tag3 description',
};

const dbTag3: DatabaseTag = {
  _id: new mongoose.Types.ObjectId('65e9a5c2b26199dbcc3e6dc9'),
  ...tag3,
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
  commentsMade: 0,
  lastLogin: new Date('2024-12-03'),
  savedQuestions: [],
  nimGameWins: 0,
  upVotesGiven: 0,
  downVotesGiven: 0,
};

const mockSafeUser2: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user2',
  dateJoined: new Date('2024-12-03'),
  biography: 'I am a user',
  ranking: 'Newcomer Newbie',
  score: 0,
  achievements: [],
  questionsAsked: 0,
  responsesGiven: 0,
  commentsMade: 0,
  lastLogin: new Date('2024-12-03'),
  savedQuestions: [],
  nimGameWins: 0,
  upVotesGiven: 0,
  downVotesGiven: 0,
};

const INTERESTS: Interest[] = [
  {
    userId: mockSafeUser._id,
    tagId: dbTag1._id,
    weight: 1,
    priority: 'moderate',
  },
  {
    userId: mockSafeUser._id,
    tagId: dbTag2._id,
    weight: 2,
    priority: 'high',
  },
];

const simplifyInterest = (interest: Interest) => ({
  ...interest,
  userId: interest.userId.toString(),
  tagId: interest.tagId.toString(),
});

describe('POST /updateInterests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should update interests successfully for a new user with no interests', async () => {
    const mockRequestBody = {
      username: mockSafeUser2.username,
      interests: [
        {
          userId: mockSafeUser2._id,
          tagId: dbTag1._id,
          weight: 2,
          priority: 'high',
        },
        {
          userId: mockSafeUser2._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };
    const mockDatabaseInterests: DatabaseInterest[] = mockRequestBody.interests.map(interest => ({
      ...interest,
      _id: new mongoose.Types.ObjectId(),
    }));

    getUserByUsernameSpy.mockResolvedValue(mockSafeUser2);
    getInterestsByUserIdSpy.mockResolvedValue([]);
    saveInterestSpy
      .mockResolvedValueOnce(mockDatabaseInterests[0])
      .mockResolvedValueOnce(mockDatabaseInterests[1]);

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Interests updated successfully');
    expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockRequestBody.username);
    expect(getInterestsByUserIdSpy).toHaveBeenCalledWith(mockSafeUser2._id);
    expect(saveInterestSpy).toHaveBeenCalledTimes(2);
    expect(saveInterestSpy).toHaveBeenCalledWith(simplifyInterest(mockRequestBody.interests[0]));
    expect(saveInterestSpy).toHaveBeenCalledWith(simplifyInterest(mockRequestBody.interests[1]));
    expect(deleteInterestSpy).not.toHaveBeenCalled();
  });
  it('should update interests successfully for a user with existing interests', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag3._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };
    const mockDatabaseInterests: DatabaseInterest[] = mockRequestBody.interests.map(interest => ({
      ...interest,
      _id: new mongoose.Types.ObjectId(),
    }));
    const mockDatabaseInterest2: DatabaseInterest = {
      ...INTERESTS[0],
      _id: new mongoose.Types.ObjectId(),
    };
    const mockDatabaseInterest3: DatabaseInterest = {
      ...INTERESTS[1],
      _id: new mongoose.Types.ObjectId(),
    };

    getUserByUsernameSpy.mockResolvedValue(mockSafeUser);
    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);
    deleteInterestSpy
      .mockResolvedValueOnce(mockDatabaseInterest2)
      .mockResolvedValueOnce(mockDatabaseInterest3);
    saveInterestSpy.mockResolvedValueOnce(mockDatabaseInterests[0]);

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Interests updated successfully');
    expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockRequestBody.username);
    expect(getInterestsByUserIdSpy).toHaveBeenCalledWith(mockSafeUser._id);
    expect(deleteInterestSpy).toHaveBeenCalledTimes(2);
    expect(saveInterestSpy).toHaveBeenCalledTimes(1);
  });
  it('should return 400 if username is not provided', async () => {
    const mockRequestBody = {
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag1._id,
          weight: 1,
          priority: 'moderate',
        },
        {
          userId: mockSafeUser._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid updateInterests body');
  });
  it('should return 400 if interests are not provided', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
    };

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid updateInterests body');
  });
  it('should return 404 if error occurs while getting user', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag1._id,
          weight: 1,
          priority: 'moderate',
        },
        {
          userId: mockSafeUser._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };

    getUserByUsernameSpy.mockResolvedValue({ error: 'User not found' });

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(404);
    expect(response.text).toBe(`User with username "${mockRequestBody.username}" not found`);
    expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockRequestBody.username);
    expect(getInterestsByUserIdSpy).not.toHaveBeenCalled();
    expect(saveInterestSpy).not.toHaveBeenCalled();
    expect(deleteInterestSpy).not.toHaveBeenCalled();
  });
  it('should return 500 if an error occurs while saving interests', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag1._id,
          weight: 1,
          priority: 'moderate',
        },
        {
          userId: mockSafeUser._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };

    getUserByUsernameSpy.mockResolvedValue(mockSafeUser);
    getInterestsByUserIdSpy.mockResolvedValue([]);
    saveInterestSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
  it('should return 500 if an error occurs while deleting interests', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag1._id,
          weight: 1,
          priority: 'moderate',
        },
        {
          userId: mockSafeUser._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };

    getUserByUsernameSpy.mockResolvedValue(mockSafeUser);
    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);
    deleteInterestSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
  it('should return 500 if an error occurs while fetching user interests', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag1._id,
          weight: 1,
          priority: 'moderate',
        },
        {
          userId: mockSafeUser._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };

    getUserByUsernameSpy.mockResolvedValue(mockSafeUser);
    getInterestsByUserIdSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
  it('should return 500 if an error occurs while getting user', async () => {
    const mockRequestBody = {
      username: mockSafeUser.username,
      interests: [
        {
          userId: mockSafeUser._id,
          tagId: dbTag1._id,
          weight: 1,
          priority: 'moderate',
        },
        {
          userId: mockSafeUser._id,
          tagId: dbTag2._id,
          weight: 1,
          priority: 'moderate',
        },
      ],
    };

    getUserByUsernameSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app).post('/interest/updateInterests').send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
});

describe('POST /updateInterestsWeights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should update interests weights if interested successfully', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
      isInterested: true,
    };
    const mockUpdatedInterests: DatabaseInterest[] = [
      {
        ...INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
        weight: INTERESTS[0].weight * 2,
      },
      {
        ...INTERESTS[1],
        _id: new mongoose.Types.ObjectId(),
        weight: INTERESTS[1].weight * 2,
      },
    ];

    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);
    updateInterestWeightMultiplicativeSpy
      .mockResolvedValueOnce(mockUpdatedInterests[0])
      .mockResolvedValueOnce(mockUpdatedInterests[1]);

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Interests updated successfully');
    expect(getInterestsByUserIdSpy).toHaveBeenCalledWith(mockRequestBody.userId.toString());
    expect(updateInterestWeightMultiplicativeSpy).toHaveBeenCalledTimes(2);
  });
  it('should update interests weights if not interested successfully', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
      isInterested: false,
    };
    const mockUpdatedInterests: DatabaseInterest[] = [
      {
        ...INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
        weight: INTERESTS[0].weight * 0.5,
      },
      {
        ...INTERESTS[1],
        _id: new mongoose.Types.ObjectId(),
        weight: INTERESTS[1].weight * 0.5,
      },
    ];

    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);
    updateInterestWeightMultiplicativeSpy
      .mockResolvedValueOnce(mockUpdatedInterests[0])
      .mockResolvedValueOnce(mockUpdatedInterests[1]);

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Interests updated successfully');
    expect(getInterestsByUserIdSpy).toHaveBeenCalledWith(mockRequestBody.userId.toString());
    expect(updateInterestWeightMultiplicativeSpy).toHaveBeenCalledTimes(2);
  });
  it('should create new interests if they do not exist', async () => {
    const mockRequestBody = {
      userId: mockSafeUser2._id,
      tagIds: [dbTag1._id, dbTag2._id],
      isInterested: true,
    };

    getInterestsByUserIdSpy.mockResolvedValue([]);
    saveInterestSpy
      .mockResolvedValueOnce({
        ...INTERESTS[0],
        _id: new mongoose.Types.ObjectId(),
      })
      .mockResolvedValueOnce({
        ...INTERESTS[1],
        _id: new mongoose.Types.ObjectId(),
      });

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Interests updated successfully');
    expect(getInterestsByUserIdSpy).toHaveBeenCalledWith(mockRequestBody.userId.toString());
    expect(saveInterestSpy).toHaveBeenCalledTimes(2);
  });
  it('should return 400 if userId is not provided', async () => {
    const mockRequestBody = {
      tagIds: [dbTag1._id, dbTag2._id],
      isInterested: true,
    };

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid updateInterestsWeights body');
  });
  it('should return 400 if tagIds are not provided', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      isInterested: true,
    };

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid updateInterestsWeights body');
  });
  it('should return 400 if isInterested is not provided', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
    };

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid updateInterestsWeights body');
  });
  it('should return 500 if an error occurs while getting interests', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
      isInterested: true,
    };

    getInterestsByUserIdSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
  it('should return 500 if an error occurs while saving interests', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag3._id],
      isInterested: true,
    };

    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);
    saveInterestSpy
      .mockRejectedValueOnce(new Error('Database error'))
      .mockRejectedValueOnce(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
  it('should return 500 if an error occurs while updating interest weight', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
      isInterested: true,
    };

    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);
    updateInterestWeightMultiplicativeSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/updateInterestsWeights')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when updating interests: Database error');
  });
});

describe('POST /resetInterestsWeightsByUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should reset interests weights successfully', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
    };

    resetInterestsWeightsByUserIdSpy.mockResolvedValue(INTERESTS);

    const response = await supertest(app)
      .post('/interest/resetInterestsWeightsByUser')
      .send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(INTERESTS.map(interest => simplifyInterest(interest)));
    expect(resetInterestsWeightsByUserIdSpy).toHaveBeenCalledWith(
      mockRequestBody.userId.toString(),
    );
  });
  it('should return 400 if userId is not provided', async () => {
    const mockRequestBody = {};

    const response = await supertest(app)
      .post('/interest/resetInterestsWeightsByUser')
      .send(mockRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid resetInterestsWeightsByUser body');
  });
  it('should return 500 if an error occurs while resetting interests weights', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
    };

    resetInterestsWeightsByUserIdSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/resetInterestsWeightsByUser')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when resetting interests: Database error');
  });
});

describe('POST /getInterestsByTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should get interests by tag IDs successfully', async () => {
    const mockRequestBody = {
      tagIds: [dbTag1._id, dbTag2._id],
    };

    getInterestsByTagIdsSpy.mockResolvedValue(INTERESTS);

    const response = await supertest(app)
      .post('/interest/getInterestsByTags')
      .send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(INTERESTS.map(interest => simplifyInterest(interest)));
    expect(getInterestsByTagIdsSpy).toHaveBeenCalledWith(
      mockRequestBody.tagIds.map(tagId => tagId.toString()),
    );
  });
  it('should return 400 if tagIds are not provided', async () => {
    const mockRequestBody = {};

    const response = await supertest(app)
      .post('/interest/getInterestsByTags')
      .send(mockRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid getInterestsByTags body');
  });
  it('should return 500 if an error occurs while getting interests by tag IDs', async () => {
    const mockRequestBody = {
      tagIds: [dbTag1._id, dbTag2._id],
    };

    getInterestsByTagIdsSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/getInterestsByTags')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching interests: Database error');
  });
});

describe('POST /getInterestsByUserAndTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should get interests by user ID and tag IDs successfully', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
    };

    getInterestsByUserIdAndTagIdsSpy.mockResolvedValue(INTERESTS);

    const response = await supertest(app)
      .post('/interest/getInterestsByUserAndTags')
      .send(mockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(INTERESTS.map(interest => simplifyInterest(interest)));
    expect(getInterestsByUserIdAndTagIdsSpy).toHaveBeenCalledWith(
      mockRequestBody.userId.toString(),
      mockRequestBody.tagIds.map(tagId => tagId.toString()),
    );
  });
  it('should return 400 if userId is not provided', async () => {
    const mockRequestBody = {
      tagIds: [dbTag1._id, dbTag2._id],
    };

    const response = await supertest(app)
      .post('/interest/getInterestsByUserAndTags')
      .send(mockRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid getInterestsByUserAndTags body');
  });
  it('should return 400 if tagIds are not provided', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
    };

    const response = await supertest(app)
      .post('/interest/getInterestsByUserAndTags')
      .send(mockRequestBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid getInterestsByUserAndTags body');
  });
  it('should return 500 if an error occurs while getting interests by user ID and tag IDs', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
    };

    getInterestsByUserIdAndTagIdsSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/getInterestsByUserAndTags')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching interests: Database error');
  });
  it('should return 500 if an error occurs while getting interests by user ID', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
    };

    getInterestsByUserIdAndTagIdsSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/getInterestsByUserAndTags')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching interests: Database error');
  });
  it('should return 500 if an error occurs while getting interests by tag IDs', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
      tagIds: [dbTag1._id, dbTag2._id],
    };

    getInterestsByUserIdAndTagIdsSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .post('/interest/getInterestsByUserAndTags')
      .send(mockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching interests: Database error');
  });
});

describe('GET /getInterestsByUser/:userId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should get interests by user ID successfully', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
    };

    getInterestsByUserIdSpy.mockResolvedValue(INTERESTS);

    const response = await supertest(app)
      .get(`/interest/getInterestsByUser/${mockRequestBody.userId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(INTERESTS.map(interest => simplifyInterest(interest)));
    expect(getInterestsByUserIdSpy).toHaveBeenCalledWith(mockRequestBody.userId.toString());
  });
  it('should return 404 if userId is not provided', async () => {
    const response = await supertest(app).get('/interest/getInterestsByUser/').send({});

    expect(response.status).toBe(404);
  });
  it('should return 500 if an error occurs while getting interests by user ID', async () => {
    const mockRequestBody = {
      userId: mockSafeUser._id,
    };

    getInterestsByUserIdSpy.mockRejectedValue(new Error('Database error'));

    const response = await supertest(app)
      .get(`/interest/getInterestsByUser/${mockRequestBody.userId}`)
      .send();

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching interests: Database error');
  });
});
