import { Schema } from 'mongoose';

const feedItemSchema: Schema = new Schema(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    viewedRanking: {
      type: Number,
      required: true,
    },
  },
  { collection: 'FeedItem' },
);

export default feedItemSchema;
