import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { Box, Typography } from '@mui/material';
import QuestionView from '../../questionPage/question';
import AskCommunityQuestion from '../../askCommunityQuestion';

interface CommunityHomeProps {
  community: PopulatedDatabaseCommunity | null;
  currentRole: string;
}

const CommunityHome = ({ community, currentRole }: CommunityHomeProps) => {
  if (!community) {
    return <Typography variant='h5'>Loading community...</Typography>;
  }
  const pinnedQuestions = community.pinnedQuestions || [];
  const unpinnedQuestions = community.questions.filter(
    question => !pinnedQuestions.some(pinned => pinned._id === question._id),
  );

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='h3'>{community?.title}</Typography>
        <AskCommunityQuestion communityID={community?._id.toString() || ''} />
      </Box>

      {/* Community description */}
      <Typography variant='h5' sx={{ my: '5px' }}>
        {community?.description}
      </Typography>

      {/* Pinned Questions */}
      {pinnedQuestions.length > 0 ? (
        <>
          <Typography variant='h6' sx={{ mt: 2 }}>
            Pinned Questions
          </Typography>
          {pinnedQuestions.map(question => (
            <QuestionView
              key={question._id}
              question={question}
              community={community}
              pinnedQuestion={true}
              currentRole={currentRole}
            />
          ))}
        </>
      ) : null}

      {/* Unpinned Questions */}
      <Typography variant='h6' sx={{ mt: 2 }}>
        Questions
      </Typography>
      {unpinnedQuestions.map(question => (
        <QuestionView
          key={question._id}
          question={question}
          community={community}
          pinnedQuestion={false}
          currentRole={currentRole}
        />
      ))}
    </div>
  );
};

export default CommunityHome;
