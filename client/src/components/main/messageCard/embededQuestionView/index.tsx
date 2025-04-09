import { Typography, Card, CardContent, Divider } from '@mui/material';
import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';

const EmbededQuestionView = ({ question }: { question: PopulatedDatabaseQuestion }) => {
  const { title, text, askedBy, askDateTime, answers, views, upVotes, downVotes, comments } =
    question;
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => {
        navigate(`/question/${question._id}`);
      }}
      variant='outlined'
      sx={{
        'margin': '20px auto',
        'cursor': 'pointer',
        'transition': 'background-color 0.3s ease',
        '&:hover': { backgroundColor: '#f5f5f5' },
        'display': 'flex',
        'width': '100%',
      }}>
      <CardContent>
        <Typography variant='h5' component='div' gutterBottom>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary' paragraph>
          {text}
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          <strong>Asked By:</strong> {askedBy}
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          <strong>Asked On:</strong> {new Date(askDateTime).toDateString()}
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          <strong>Answers:</strong> {answers.length}
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          <strong>Views:</strong> {views.length}
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          <strong>Upvotes:</strong> {upVotes.length}
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          <strong>Downvotes:</strong> {downVotes.length}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant='h6' gutterBottom>
          Comments: {comments.length}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EmbededQuestionView;
