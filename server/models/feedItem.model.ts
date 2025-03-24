import mongoose, { Model } from 'mongoose';
import feedItemSchema from './schema/feedItem.schema';
import { FeedItem } from '../types/types';

const FeedItemModel: Model<FeedItem> = mongoose.model<FeedItem>('FeedItem', feedItemSchema);

export default FeedItemModel;
