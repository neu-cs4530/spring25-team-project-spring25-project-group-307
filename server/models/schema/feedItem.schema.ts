import { Schema } from 'mongoose';

const feedItemSchema: Schema = new Schema(
  {
    feed: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: false },
    viewedRanking: {
      type: Number,
      required: true,
    },
  },
  { collection: 'FeedItem' },
);

export default feedItemSchema;
