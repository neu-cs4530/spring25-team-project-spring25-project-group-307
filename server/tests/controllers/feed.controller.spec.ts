import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as feedUtil from '../../services/feed.service';
import {
  DatabaseCommunity,
  DatabaseFeed,
  DatabaseFeedItem,
  DatabaseQuestion,
  DatabaseTag,
  PopulatedDatabaseAnswer,
  SafeDatabaseUser,
  Tag,
} from '../../types/types';

const updateFeedLastViewedRankingSpy = jest.spyOn(feedUtil, 'updateFeedLastViewedRanking');
const getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy = jest.spyOn(
  feedUtil,
  'getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndex',
);
const getAllQuestionsInOrderAndSaveToFeedSpy = jest.spyOn(
  feedUtil,
  'getAllQuestionsInOrderAndSaveToFeed',
);
const getFeedHistoryByUserSpy = jest.spyOn(feedUtil, 'getFeedHistoryByUser');
const getQuestionsForInfiniteScrollSpy = jest.spyOn(feedUtil, 'getQuestionsForInfiniteScroll');

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

const FEEDS: DatabaseFeed[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    userId: mockSafeUser._id,
    lastViewedRanking: 0,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    userId: mockSafeUser2._id,
    lastViewedRanking: 2,
  },
];

const ans1: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'Answer 1 Text',
  ansBy: 'answer1_user',
  ansDateTime: new Date('2024-06-09'), // The mock date is string type but in the actual implementation it is a Date type
  comments: [],
  upVotes: [],
  downVotes: [],
};

const ans2: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'Answer 2 Text',
  ansBy: 'answer2_user',
  ansDateTime: new Date('2024-06-10'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

const ans3: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'Answer 3 Text',
  ansBy: 'answer3_user',
  ansDateTime: new Date('2024-06-11'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

const ans4: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'Answer 4 Text',
  ansBy: 'answer4_user',
  ansDateTime: new Date('2024-06-14'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

const MOCK_DATABASE_QUESTIONS: DatabaseQuestion[] = [
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Question 1 Title',
    text: 'Question 1 Text',
    tags: [dbTag1._id],
    answers: [ans1._id],
    askedBy: 'question1_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new mongoose.Types.ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Question 2 Title',
    text: 'Question 2 Text',
    tags: [dbTag2._id],
    answers: [ans2._id, ans3._id],
    askedBy: 'question2_user',
    askDateTime: new Date('2024-06-04'),
    views: ['question1_user', 'question2_user', 'question3_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new mongoose.Types.ObjectId('34e9b58910afe6e94fc6e99f'),
    title: 'Question 3 Title',
    text: 'Question 3 Text',
    tags: [dbTag1._id, dbTag2._id],
    answers: [ans4._id],
    askedBy: 'question3_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question3_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6de'),
    title: 'Question 4 Title',
    text: 'Question 4 Text',
    tags: [],
    answers: [],
    askedBy: 'question4_user',
    askDateTime: new Date('2024-06-03'),
    views: ['question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
];

const MOCK_COMMUNITIES: DatabaseCommunity[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Community 1',
    description: 'Community 1 Description',
    isPrivate: false,
    admins: [mockSafeUser._id],
    moderators: [],
    members: [mockSafeUser2._id],
    questions: [MOCK_DATABASE_QUESTIONS[0]._id, MOCK_DATABASE_QUESTIONS[2]._id],
    pinnedQuestions: [],
    tags: [],
  },
];

const MOCK_FEED_ITEMS: DatabaseFeedItem[] = [
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[0]._id,
    question: MOCK_DATABASE_QUESTIONS[0]._id,
    community: MOCK_COMMUNITIES[0]._id,
    viewedRanking: 0,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[0]._id,
    question: MOCK_DATABASE_QUESTIONS[2]._id,
    community: MOCK_COMMUNITIES[0]._id,
    viewedRanking: 1,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[0]._id,
    question: MOCK_DATABASE_QUESTIONS[3]._id,
    viewedRanking: 2,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[0]._id,
    question: MOCK_DATABASE_QUESTIONS[1]._id,
    viewedRanking: 3,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[1]._id,
    question: MOCK_DATABASE_QUESTIONS[2]._id,
    community: MOCK_COMMUNITIES[0]._id,
    viewedRanking: 0,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[1]._id,
    question: MOCK_DATABASE_QUESTIONS[1]._id,
    viewedRanking: 1,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[1]._id,
    question: MOCK_DATABASE_QUESTIONS[0]._id,
    community: MOCK_COMMUNITIES[0]._id,
    viewedRanking: 2,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    feed: FEEDS[1]._id,
    question: MOCK_DATABASE_QUESTIONS[3]._id,
    viewedRanking: 3,
  },
];

const simplifyDatabaseQuestion = (question: DatabaseQuestion) => ({
  ...question,
  _id: question._id.toString(), // Converting ObjectId to string
  tags: question.tags.map(tag => tag.toString()), // Converting tag ObjectId to string
  answers: question.answers.map(answer => answer.toString()), // Converting answer ObjectId to string
  askDateTime: question.askDateTime.toISOString(),
});

const simplifyDatabaseFeedItem = (feedItem: DatabaseFeedItem) => ({
  ...feedItem,
  _id: feedItem._id.toString(), // Converting ObjectId to string
  feed: feedItem.feed.toString(), // Converting feed ObjectId to string
  question: feedItem.question.toString(), // Converting question ObjectId to string
  ...(feedItem.community && { community: feedItem.community.toString() }), // Converting community ObjectId to string if present
});

describe('POST /refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should refresh the feed for a new user with no interests', async () => {
    const userId1 = mockSafeUser._id.toString();
    const mockQuestions1 = [
      MOCK_DATABASE_QUESTIONS[0],
      MOCK_DATABASE_QUESTIONS[2],
      MOCK_DATABASE_QUESTIONS[3],
      MOCK_DATABASE_QUESTIONS[1],
    ];

    getAllQuestionsInOrderAndSaveToFeedSpy.mockResolvedValue(mockQuestions1);
    updateFeedLastViewedRankingSpy.mockResolvedValue(FEEDS[0]);

    const response = await supertest(app).post('/feed/refresh').send({ userId: userId1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockQuestions1.map(question => simplifyDatabaseQuestion(question)),
    );
    expect(getAllQuestionsInOrderAndSaveToFeedSpy).toHaveBeenCalledWith(userId1);
    expect(updateFeedLastViewedRankingSpy).toHaveBeenCalledWith(userId1, 0);
  });
  it('should refresh the feed for a user with existing interests', async () => {
    const userId2 = mockSafeUser2._id.toString();
    const mockQuestions2 = [
      MOCK_DATABASE_QUESTIONS[2],
      MOCK_DATABASE_QUESTIONS[1],
      MOCK_DATABASE_QUESTIONS[0],
      MOCK_DATABASE_QUESTIONS[3],
    ];

    getAllQuestionsInOrderAndSaveToFeedSpy.mockResolvedValue(mockQuestions2);
    updateFeedLastViewedRankingSpy.mockResolvedValue(FEEDS[1]);

    const response = await supertest(app).post('/feed/refresh').send({ userId: userId2 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockQuestions2.map(question => simplifyDatabaseQuestion(question)),
    );
    expect(getAllQuestionsInOrderAndSaveToFeedSpy).toHaveBeenCalledWith(userId2);
    expect(updateFeedLastViewedRankingSpy).toHaveBeenCalledWith(userId2, 0);
  });
  it('should return 400 if userId is not provided', async () => {
    const response = await supertest(app).post('/feed/refresh').send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid user ID');
  });
  it('should return 500 if an error occurs while getting all questions in order and saving to feed', async () => {
    const userId = 'dummyUserId';
    const errorMessage = 'Database error';
    getAllQuestionsInOrderAndSaveToFeedSpy.mockRejectedValue(new Error(errorMessage));

    const response = await supertest(app).post('/feed/refresh').send({ userId });

    expect(response.status).toBe(500);
    expect(response.text).toBe(`Error when refreshing feed: Error: ${errorMessage}`);
  });
  it('should return 500 if an error occurs while updating last viewed ranking', async () => {
    const userId = 'dummyUserId';
    const errorMessage = 'Database error';
    getAllQuestionsInOrderAndSaveToFeedSpy.mockResolvedValue(MOCK_DATABASE_QUESTIONS);
    updateFeedLastViewedRankingSpy.mockRejectedValue(new Error(errorMessage));

    const response = await supertest(app).post('/feed/refresh').send({ userId });

    expect(response.status).toBe(500);
    expect(getAllQuestionsInOrderAndSaveToFeedSpy).toHaveBeenCalledWith(userId);
    expect(response.text).toBe(`Error when refreshing feed: Error: ${errorMessage}`);
  });
});

describe('POST /next', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should get the next feed items for a new user with no interests', async () => {
    const userId1 = mockSafeUser._id.toString();
    const limit = 3;
    const mockQuestions1 = [
      MOCK_DATABASE_QUESTIONS[0],
      MOCK_DATABASE_QUESTIONS[2],
      MOCK_DATABASE_QUESTIONS[3],
      MOCK_DATABASE_QUESTIONS[1],
    ];
    const mockFeedItems1 = [
      MOCK_FEED_ITEMS[0],
      MOCK_FEED_ITEMS[1],
      MOCK_FEED_ITEMS[2],
      MOCK_FEED_ITEMS[3],
    ];

    getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy.mockResolvedValue(mockQuestions1);
    getQuestionsForInfiniteScrollSpy.mockResolvedValue(
      mockFeedItems1.slice(FEEDS[0].lastViewedRanking, FEEDS[0].lastViewedRanking + limit),
    );

    const response = await supertest(app).post('/feed/next').send({ userId: userId1, limit });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockFeedItems1
        .slice(FEEDS[0].lastViewedRanking, FEEDS[0].lastViewedRanking + limit)
        .map(item => simplifyDatabaseFeedItem(item)),
    );
    expect(getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy).toHaveBeenCalledWith(userId1);
    expect(getQuestionsForInfiniteScrollSpy).toHaveBeenCalledWith(userId1, limit);
  });
  it('should get the next feed items for a user with existing interests', async () => {
    const userId2 = mockSafeUser2._id.toString();
    const limit = 2;
    const mockQuestions2 = [
      MOCK_DATABASE_QUESTIONS[2],
      MOCK_DATABASE_QUESTIONS[1],
      MOCK_DATABASE_QUESTIONS[0],
      MOCK_DATABASE_QUESTIONS[3],
    ];
    const mockFeedItems2 = [
      MOCK_FEED_ITEMS[4],
      MOCK_FEED_ITEMS[5],
      MOCK_FEED_ITEMS[6],
      MOCK_FEED_ITEMS[7],
    ];

    getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy.mockResolvedValue(mockQuestions2);
    getQuestionsForInfiniteScrollSpy.mockResolvedValue(
      mockFeedItems2.slice(FEEDS[1].lastViewedRanking, FEEDS[1].lastViewedRanking + limit),
    );

    const response = await supertest(app).post('/feed/next').send({ userId: userId2, limit });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockFeedItems2
        .slice(FEEDS[1].lastViewedRanking, FEEDS[1].lastViewedRanking + limit)
        .map(item => simplifyDatabaseFeedItem(item)),
    );
    expect(getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy).toHaveBeenCalledWith(userId2);
    expect(getQuestionsForInfiniteScrollSpy).toHaveBeenCalledWith(userId2, limit);
  });
  it('should return 400 if userId or limit is not provided', async () => {
    const response = await supertest(app).post('/feed/next').send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid user ID or limit');
  });
  it('should return 500 if an error occurs while getting all questions in order and saving to feed', async () => {
    const userId = 'dummyUserId';
    const limit = 2;
    const errorMessage = 'Database error';
    getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy.mockRejectedValue(
      new Error(errorMessage),
    );

    const response = await supertest(app).post('/feed/next').send({ userId, limit });

    expect(response.status).toBe(500);
    expect(response.text).toBe(`Error when getting next feed items: Error: ${errorMessage}`);
  });
  it('should return 500 if an error occurs while getting questions for infinite scroll', async () => {
    const userId = 'dummyUserId';
    const limit = 2;
    const errorMessage = 'Database error';
    getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy.mockResolvedValue(
      MOCK_DATABASE_QUESTIONS,
    );
    getQuestionsForInfiniteScrollSpy.mockRejectedValue(new Error(errorMessage));

    const response = await supertest(app).post('/feed/next').send({ userId, limit });

    expect(response.status).toBe(500);
    expect(getAllQuestionsInOrderAndSaveToFeedFromLastViewedIndexSpy).toHaveBeenCalledWith(userId);
    expect(response.text).toBe(`Error when getting next feed items: Error: ${errorMessage}`);
  });
});

describe('POST /history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should get the feed history for a new user with no interests', async () => {
    const userId1 = mockSafeUser._id.toString();
    const numFeedQuestionsBeforeNav = 2;
    const mockFeedItems1 = [
      MOCK_FEED_ITEMS[0],
      MOCK_FEED_ITEMS[1],
      MOCK_FEED_ITEMS[2],
      MOCK_FEED_ITEMS[3],
    ];

    getFeedHistoryByUserSpy.mockResolvedValue(mockFeedItems1.slice(0, numFeedQuestionsBeforeNav));

    const response = await supertest(app)
      .post('/feed/history')
      .send({ userId: userId1, numFeedQuestionsBeforeNav });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockFeedItems1
        .slice(0, numFeedQuestionsBeforeNav)
        .map(item => simplifyDatabaseFeedItem(item)),
    );
    expect(getFeedHistoryByUserSpy).toHaveBeenCalledWith(userId1, numFeedQuestionsBeforeNav);
  });
  it('should get the feed history for a user with existing interests', async () => {
    const userId2 = mockSafeUser2._id.toString();
    const numFeedQuestionsBeforeNav = 2;
    const mockFeedItems2 = [
      MOCK_FEED_ITEMS[4],
      MOCK_FEED_ITEMS[5],
      MOCK_FEED_ITEMS[6],
      MOCK_FEED_ITEMS[7],
    ];

    getFeedHistoryByUserSpy.mockResolvedValue(mockFeedItems2.slice(0, numFeedQuestionsBeforeNav));

    const response = await supertest(app)
      .post('/feed/history')
      .send({ userId: userId2, numFeedQuestionsBeforeNav });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      mockFeedItems2
        .slice(0, numFeedQuestionsBeforeNav)
        .map(item => simplifyDatabaseFeedItem(item)),
    );
    expect(getFeedHistoryByUserSpy).toHaveBeenCalledWith(userId2, numFeedQuestionsBeforeNav);
  });
  it('should return 400 if the userId or numFeedQuestionsBeforeNav is not provided', async () => {
    const response = await supertest(app).post('/feed/history').send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid user ID');
  });
  it('should return 500 if an error occurs while getting feed history', async () => {
    const userId = 'dummyUserId';
    const numFeedQuestionsBeforeNav = 2;
    const errorMessage = 'Database error';
    getFeedHistoryByUserSpy.mockRejectedValue(new Error(errorMessage));

    const response = await supertest(app)
      .post('/feed/history')
      .send({ userId, numFeedQuestionsBeforeNav });

    expect(response.status).toBe(500);
    expect(response.text).toBe(`Error when getting feed history: Error: ${errorMessage}`);
  });
});
