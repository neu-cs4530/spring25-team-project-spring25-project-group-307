import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import QuestionView from '../../questionPage/question';

interface CommunityHomeProps {
  community: PopulatedDatabaseCommunity | null;
}

const CommunityHome = ({ community }: CommunityHomeProps) => (
  <div>
    <h1>{community?.title}</h1>
    <p>{community?.description}</p>
    {community?.questions.map(question => <QuestionView key={question._id} question={question} />)}
  </div>
);

export default CommunityHome;
