import { Schema } from 'mongoose';

/**
 * Mongoose schema for Achievements.
 */
const achievementSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
  },
  { collection: 'Achievement' },
);

export default achievementSchema;
