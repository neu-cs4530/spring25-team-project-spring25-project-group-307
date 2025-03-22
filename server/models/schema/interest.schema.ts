import { Schema } from 'mongoose';

const interestSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    },
    weight: {
      type: Number,
      default: 1,
    },
    priority: {
      type: String,
      enum: ['moderate', 'high'],
      default: 'moderate',
    },
  },
  { collection: 'Interest' },
);

export default interestSchema;
