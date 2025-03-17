import { Schema } from 'mongoose';

const interestSchema: Schema = new Schema(
  {
    weight: {
      type: Number,
      default: 1,
    },
  },
  { collection: 'Interest' },
);

export default interestSchema;
