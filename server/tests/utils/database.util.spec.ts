import { populateDocument } from '../../utils/database.util';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';
import ChatModel from '../../models/chat.model';
import UserModel from '../../models/users.model';
import getUpdatedRank from '../../utils/userstat.util';

jest.mock('../../models/questions.model');
jest.mock('../../models/answers.model');
jest.mock('../../models/chat.model');
jest.mock('../../models/messages.model');
jest.mock('../../models/users.model');
jest.mock('../../models/tags.model');
jest.mock('../../models/comments.model');

describe('populateDocument', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and populate a question document', async () => {
    const mockQuestion = {
      _id: 'questionId',
      tags: ['tagId'],
      answers: ['answerId'],
      comments: ['commentId'],
    };
    (QuestionModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockQuestion),
    });

    const result = await populateDocument('questionId', 'question');

    expect(QuestionModel.findOne).toHaveBeenCalledWith({ _id: 'questionId' });
    expect(result).toEqual(mockQuestion);
  });

  it('should return an error message if question document is not found', async () => {
    (QuestionModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const questionID = 'invalidQuestionId';
    const result = await populateDocument(questionID, 'question');

    expect(result).toEqual({
      error: `Error when fetching and populating a document: Failed to fetch and populate question with ID: ${
        questionID
      }`,
    });
  });

  it('should return an error message if fetching a question document throws an error', async () => {
    (QuestionModel.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await populateDocument('questionId', 'question');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Database error',
    });
  });

  it('should fetch and populate an answer document', async () => {
    const mockAnswer = {
      _id: 'answerId',
      comments: ['commentId'],
    };
    (AnswerModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockAnswer),
    });

    const result = await populateDocument('answerId', 'answer');

    expect(AnswerModel.findOne).toHaveBeenCalledWith({ _id: 'answerId' });
    expect(result).toEqual(mockAnswer);
  });

  it('should return an error message if answer document is not found', async () => {
    (AnswerModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const answerID = 'invalidAnswerId';
    const result = await populateDocument(answerID, 'answer');

    expect(result).toEqual({
      error: `Error when fetching and populating a document: Failed to fetch and populate answer with ID: ${
        answerID
      }`,
    });
  });

  it('should return an error message if fetching an answer document throws an error', async () => {
    (AnswerModel.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await populateDocument('answerId', 'answer');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Database error',
    });
  });

  it('should fetch and populate a chat document', async () => {
    const mockChat = {
      _id: 'chatId',
      messages: [
        {
          _id: 'messageId',
          msg: 'Hello',
          msgFrom: 'user1',
          msgDateTime: new Date(),
          type: 'text',
        },
      ],
      toObject: jest.fn().mockReturnValue({
        _id: 'chatId',
        messages: [
          {
            _id: 'messageId',
            msg: 'Hello',
            msgFrom: 'user1',
            msgDateTime: new Date(),
            type: 'text',
          },
        ],
      }),
    };
    const mockUser = {
      _id: 'userId',
      username: 'user1',
    };
    (ChatModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockChat),
    });
    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await populateDocument('chatId', 'chat');

    expect(ChatModel.findOne).toHaveBeenCalledWith({ _id: 'chatId' });
    expect(result).toEqual({
      ...mockChat.toObject(),
      messages: [
        {
          _id: 'messageId',
          msg: 'Hello',
          msgFrom: 'user1',
          msgDateTime: mockChat.messages[0].msgDateTime,
          type: 'text',
          user: {
            _id: 'userId',
            username: 'user1',
          },
        },
      ],
    });
  });

  it('should return an error message if chat document is not found', async () => {
    (ChatModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const result = await populateDocument('invalidChatId', 'chat');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Chat not found',
    });
  });

  it('should return an error message if fetching a chat document throws an error', async () => {
    (ChatModel.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await populateDocument('chatId', 'chat');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Database error',
    });
  });

  it('should return an error message if type is invalid', async () => {
    const invalidType = 'invalidType' as 'question' | 'answer' | 'chat';
    const result = await populateDocument('someId', invalidType);
    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Invalid type provided.',
    });
  });
});

describe('getUpdatedRank', () => {
  it('returns "Newcomer Newbie" for score below 50', () => {
    expect(getUpdatedRank(0)).toBe('Newcomer Newbie');
    expect(getUpdatedRank(49)).toBe('Newcomer Newbie');
  });

  it('returns "Common Contributor" for score 50-149', () => {
    expect(getUpdatedRank(50)).toBe('Common Contributor');
    expect(getUpdatedRank(149)).toBe('Common Contributor');
  });

  it('returns "Skilled Solver" for score 150-299', () => {
    expect(getUpdatedRank(150)).toBe('Skilled Solver');
    expect(getUpdatedRank(299)).toBe('Skilled Solver');
  });

  it('returns "Expert Explorer" for score 300-499', () => {
    expect(getUpdatedRank(300)).toBe('Expert Explorer');
    expect(getUpdatedRank(499)).toBe('Expert Explorer');
  });

  it('returns "Mentor Maven" for score 500-749', () => {
    expect(getUpdatedRank(500)).toBe('Mentor Maven');
    expect(getUpdatedRank(749)).toBe('Mentor Maven');
  });

  it('returns "Master Maverick" for score 750 and above', () => {
    expect(getUpdatedRank(750)).toBe('Master Maverick');
    expect(getUpdatedRank(1000)).toBe('Master Maverick');
  });
});
