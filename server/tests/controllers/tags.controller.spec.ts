import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as tagUtil from '../../services/tag.service';
import TagModel from '../../models/tags.model';
import { DatabaseTag, Tag } from '../../types/types';

const getTagCountMapSpy: jest.SpyInstance = jest.spyOn(tagUtil, 'getTagCountMap');
// Spy on the TagModel.findOne method
const findOneSpy = jest.spyOn(TagModel, 'findOne');

describe('Test tagController', () => {
  describe('GET /getTagByName/:name', () => {
    it('should return the tag when found', async () => {
      // Mock a tag object to be returned by the findOne method
      const mockTag: Tag = { name: 'exampleTag', description: 'This is a test tag' };
      const mockDatabaseTag: DatabaseTag = { ...mockTag, _id: new mongoose.Types.ObjectId() };

      findOneSpy.mockResolvedValueOnce(mockDatabaseTag);

      const response = await supertest(app).get('/tag/getTagByName/exampleTag');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockDatabaseTag, _id: mockDatabaseTag._id.toString() });
    });

    it('should return 404 if the tag is not found', async () => {
      // Mock findOne to return null to simulate tag not found
      findOneSpy.mockResolvedValueOnce(null);

      const response = await supertest(app).get('/tag/getTagByName/nonExistentTag');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Tag with name "nonExistentTag" not found');
    });

    it('should return 500 if there is an error fetching the tag', async () => {
      // Mock findOne to throw an error
      findOneSpy.mockRejectedValueOnce(new Error('Error fetching tag'));

      const response = await supertest(app).get('/tag/getTagByName/errorTag');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching tag: Error fetching tag');
    });
  });

  describe('GET /getTagsWithQuestionNumber', () => {
    it('should return tags with question numbers', async () => {
      const mockTagCountMap = new Map<string, number>();
      mockTagCountMap.set('tag1', 2);
      mockTagCountMap.set('tag2', 1);
      getTagCountMapSpy.mockResolvedValueOnce(mockTagCountMap);

      const response = await supertest(app).get('/tag/getTagsWithQuestionNumber');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { name: 'tag1', qcnt: 2 },
        { name: 'tag2', qcnt: 1 },
      ]);
    });

    it('should return error 500 if getTagCountMap returns null', async () => {
      getTagCountMapSpy.mockResolvedValueOnce(null);

      const response = await supertest(app).get('/tag/getTagsWithQuestionNumber');

      expect(response.status).toBe(500);
    });

    it('should return error 500 if getTagCountMap throws an error', async () => {
      getTagCountMapSpy.mockRejectedValueOnce(new Error('Error fetching tags'));

      const response = await supertest(app).get('/tag/getTagsWithQuestionNumber');

      expect(response.status).toBe(500);
    });
  });
});

describe('POST /getTagsByIds', () => {
  const findSpy = jest.spyOn(TagModel, 'find');

  it('should return tags when found by IDs', async () => {
    const mockTag1: DatabaseTag = {
      _id: new mongoose.Types.ObjectId(),
      name: 'tag1',
      description: 'desc1',
    };
    const mockTag2: DatabaseTag = {
      _id: new mongoose.Types.ObjectId(),
      name: 'tag2',
      description: 'desc2',
    };

    findSpy.mockResolvedValueOnce([mockTag1, mockTag2]);

    const response = await supertest(app)
      .post('/tag/getTagsByIds')
      .send({ tagIds: [mockTag1._id.toString(), mockTag2._id.toString()] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { ...mockTag1, _id: mockTag1._id.toString() },
      { ...mockTag2, _id: mockTag2._id.toString() },
    ]);
  });
  it('should return 500 if tags are not found by IDs', async () => {
    const mockTagIds = [
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
    ];

    // Mock find to return null (this will hit the "if (!tags)" line)
    findSpy.mockResolvedValueOnce(null as unknown as ReturnType<typeof TagModel.find>);

    const response = await supertest(app).post('/tag/getTagsByIds').send({ tagIds: mockTagIds });

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when fetching tags by IDs');
  });

  it('should return 500 if there is an error fetching tags by IDs', async () => {
    findSpy.mockRejectedValueOnce(new Error('DB Error'));

    const response = await supertest(app)
      .post('/tag/getTagsByIds')
      .send({ tagIds: ['someid1', 'someid2'] });

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when fetching tags by IDs: DB Error');
  });
});

describe('GET /tag/getAllTags', () => {
  const findSpy = jest.spyOn(TagModel, 'find');
  it('should return 500 if tags is null', async () => {
    findSpy.mockResolvedValueOnce(null as unknown as ReturnType<typeof TagModel.find>); // force tags to be null

    const response = await supertest(app).get('/tag/getAllTags');

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when fetching tags');
  });

  it('should return all tags', async () => {
    const mockTag1: DatabaseTag = {
      _id: new mongoose.Types.ObjectId(),
      name: 'tag1',
      description: 'desc1',
    };
    const mockTag2: DatabaseTag = {
      _id: new mongoose.Types.ObjectId(),
      name: 'tag2',
      description: 'desc2',
    };

    findSpy.mockResolvedValueOnce([mockTag1, mockTag2]);

    const response = await supertest(app).get('/tag/getAllTags');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { ...mockTag1, _id: mockTag1._id.toString() },
      { ...mockTag2, _id: mockTag2._id.toString() },
    ]);
  });

  it('should return 500 if there is an error fetching all tags', async () => {
    findSpy.mockRejectedValueOnce(new Error('DB Error'));

    const response = await supertest(app).get('/tag/getAllTags');

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error when fetching tags: DB Error');
  });
});
