import mongoose, { Model } from 'mongoose';
import interestSchema from './schema/interest.schema';
import { Interest } from '../types/types';

const InterestModel: Model<Interest> = mongoose.model<Interest>('Interest', interestSchema);

export default InterestModel;
