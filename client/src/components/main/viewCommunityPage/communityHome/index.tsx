import { PopulatedDatabaseCommunity, PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import { Box, Button, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import QuestionView from '../../questionPage/question';
import AskCommunityQuestion from '../../askCommunityQuestion';

interface CommunityHomeProps {
  community: PopulatedDatabaseCommunity | null;
  currentRole: string;
  handleTogglePinQuestion: (question: PopulatedDatabaseQuestion) => void;
}

const CommunityHome = ({ community, currentRole, handleTogglePinQuestion }: CommunityHomeProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const fromFeed = location.state?.fromFeed || false;
  const scrollPosition = location.state?.scrollPosition || 0;
  const numFeedQuestionsBeforeNav = location.state?.numFeedQuestionsBeforeNav || 0;

  if (!community) {
    return <Typography variant='h5'>Loading community...</Typography>;
  }

  const pinnedQuestions = community.pinnedQuestions || [];
  const unpinnedQuestions = community.questions.filter(
    question => !pinnedQuestions.some(pinned => pinned._id === question._id),
  );

  return (
    <Box sx={{ padding: '0% 5%' }}>
      {fromFeed && (
        <Button
          variant='outlined'
          startIcon={<ArrowBackIosIcon />}
          sx={{
            my: 2,
          }}
          onClick={() => {
            navigate('/feed', {
              state: { fromFeed, scrollPosition, numFeedQuestionsBeforeNav },
            });
          }}>
          Back to Feed
        </Button>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          Welcome to {community?.title}!
        </Typography>
        <AskCommunityQuestion communityID={community?._id.toString() || ''} />
      </Box>

      {/* Community description */}
      <Typography variant='subtitle1' sx={{ my: '5px' }}>
        {community?.description}
      </Typography>

      {/* Pinned Questions */}
      {pinnedQuestions.length > 0 ? (
        <>
          <Typography variant='h6' sx={{ mt: 3, mb: 1 }}>
            Pinned Questions
          </Typography>
          <Box>
            {pinnedQuestions.map(question => (
              <QuestionView
                key={question._id}
                question={question}
                community={community}
                pinnedQuestion={true}
                currentRole={currentRole}
                handleTogglePinQuestion={handleTogglePinQuestion}
              />
            ))}
          </Box>
        </>
      ) : null}

      {/* Unpinned Questions */}
      <Typography variant='h6' sx={{ mt: 3, mb: 1 }}>
        Questions
      </Typography>
      {unpinnedQuestions.map(question => (
        <QuestionView
          key={question._id}
          question={question}
          community={community}
          pinnedQuestion={false}
          currentRole={currentRole}
          handleTogglePinQuestion={handleTogglePinQuestion}
        />
      ))}
    </Box>
  );
};

export default CommunityHome;
