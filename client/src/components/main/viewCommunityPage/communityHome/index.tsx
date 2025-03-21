import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { Box, Typography } from '@mui/material';
import QuestionView from '../../questionPage/question';
import AskCommunityQuestion from '../../askCommunityQuestion';

interface CommunityHomeProps {
  community: PopulatedDatabaseCommunity | null;
}

const CommunityHome = ({ community }: CommunityHomeProps) => (
  <div>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant='h3'>{community?.title}</Typography>
      <AskCommunityQuestion communityID={community?._id.toString() || ''} />
    </Box>
    <Typography variant='h5' sx={{ my: '5px' }}>
      {community?.description}
    </Typography>
    {community?.questions.map(question => <QuestionView key={question._id} question={question} />)}
  </div>
);

export default CommunityHome;
