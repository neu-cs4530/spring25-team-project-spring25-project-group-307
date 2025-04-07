import { ObjectId } from 'mongodb';
import {
  Community,
  DatabaseAnswer,
  DatabaseComment,
  DatabaseCommunity,
  DatabaseQuestion,
  DatabaseTag,
  PopulatedDatabaseCommunity,
  PopulatedDatabaseQuestion,
  SafeDatabaseUser,
  User,
} from '../types/types';
import { T1_DESC, T2_DESC, T3_DESC } from '../data/posts_strings';

export const tag1: DatabaseTag = {
  _id: new ObjectId('507f191e810c19729de860ea'),
  name: 'react',
  description: T1_DESC,
};

export const tag2: DatabaseTag = {
  _id: new ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  name: 'javascript',
  description: T2_DESC,
};

export const tag3: DatabaseTag = {
  _id: new ObjectId('65e9b4b1766fca9451cba653'),
  name: 'android',
  description: T3_DESC,
};

export const com1: DatabaseComment = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'com1',
  commentBy: 'com_by1',
  commentDateTime: new Date('2023-11-18T09:25:00'),
  upVotes: [],
  downVotes: [],
};

export const ans1: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'ans1',
  ansBy: 'ansBy1',
  ansDateTime: new Date('2023-11-18T09:24:00'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

export const ans2: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'ans2',
  ansBy: 'ansBy2',
  ansDateTime: new Date('2023-11-20T09:24:00'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

export const ans3: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'ans3',
  ansBy: 'ansBy3',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

export const ans4: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'ans4',
  ansBy: 'ansBy4',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
  upVotes: [],
  downVotes: [],
};

export const QUESTIONS: DatabaseQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3._id, tag2._id],
    answers: [ans1._id, ans2._id],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1._id, tag2._id],
    answers: [ans1._id, ans2._id, ans3._id],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
];

export const POPULATED_QUESTIONS: PopulatedDatabaseQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
    ],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
      { ...ans3, comments: [] },
    ],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
    reportedBy: [],
  },
];

export const user: User = {
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

export const safeUser: SafeDatabaseUser = {
  _id: new ObjectId(),
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

export const safeUser2: SafeDatabaseUser = {
  _id: new ObjectId(),
  username: 'user2',
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

export const safeUser3: SafeDatabaseUser = {
  _id: new ObjectId(),
  username: 'user3',
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

export const COMMUNITIES: DatabaseCommunity[] = [
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Community 1',
    description: 'Description 1',
    isPrivate: false,
    admins: [],
    moderators: [],
    members: [safeUser._id, safeUser2._id],
    pinnedQuestions: [],
    questions: [],
    tags: [tag1._id, tag2._id],
  },
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Community 2',
    description: 'Description 2',
    isPrivate: true,
    admins: [],
    moderators: [safeUser._id],
    members: [],
    pinnedQuestions: [],
    questions: [],
    tags: [tag1._id],
  },
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dd'),
    title: 'Community 3',
    description: 'Description 3',
    isPrivate: false,
    admins: [safeUser2._id],
    moderators: [],
    members: [],
    pinnedQuestions: [],
    questions: [],
    tags: [],
  },
];

export const newCommunity1: Community = {
  title: 'New Community',
  description: 'This is a new community',
  isPrivate: false,
  admins: [],
  moderators: [],
  members: [],
  pinnedQuestions: [],
  questions: [],
  tags: [],
};

export const populatedCommunity1: PopulatedDatabaseCommunity = {
  _id: new ObjectId('65e9b5a995b6c7045a30d823'),
  title: 'Community 1',
  description: 'Description 1',
  isPrivate: false,
  admins: [],
  moderators: [],
  members: [safeUser, safeUser2],
  pinnedQuestions: [],
  questions: [],
  tags: [tag1, tag2],
};
