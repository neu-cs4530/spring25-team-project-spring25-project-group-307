import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import RecommendedQuestionCard from '../recommendedQuestionCard';

const RecommendedContentPanel = ({
  questions,
}: {
  questions: Omit<PopulatedDatabaseQuestion, '_id'>[];
}) => (
  <div>
    {questions.map(question => (
      <RecommendedQuestionCard key={question.title} question={question} />
      // Todo make this key the id
    ))}
  </div>
);

export default RecommendedContentPanel;
