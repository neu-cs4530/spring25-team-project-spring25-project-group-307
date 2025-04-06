import { FeedItem } from '@fake-stack-overflow/shared';
import { ObjectId } from 'mongodb';
import RecommendedQuestionCard from '../recommendedQuestionCard';

const RecommendedContentPanel = ({
  feedItems,
  onNavToCommunity,
  onNavToQuestion,
  onJoinLeaveCommunity,
}: {
  feedItems: Omit<FeedItem, '_id'>[];
  onNavToCommunity: (communityId: ObjectId) => void;
  onNavToQuestion: (questionId: ObjectId) => void;
  onJoinLeaveCommunity: (communityId: ObjectId, isJoined: boolean) => void;
}) => (
  <div>
    {feedItems.map(feedItem => (
      <RecommendedQuestionCard
        key={feedItem.question._id}
        item={feedItem}
        onNavToCommunity={onNavToCommunity}
        onNavToQuestion={onNavToQuestion}
        onJoinLeaveCommunity={onJoinLeaveCommunity}
      />
    ))}
  </div>
);

export default RecommendedContentPanel;
