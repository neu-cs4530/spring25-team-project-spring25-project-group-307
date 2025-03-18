import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';

const RecommendedQuestionCard = ({
  question,
}: {
  question: Omit<PopulatedDatabaseQuestion, '_id'>;
}) => {
  const handleClick = () => {};

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}>
      <Card
        onClick={handleClick}
        sx={{
          'minWidth': 275,
          'width': '50%',
          'p': 2,
          'border': '1px dashed grey',
          'cursor': 'pointer',
          'transition': 'background-color 0.3s ease',
          '&:hover': { backgroundColor: '#f5f5f5' },
        }}>
        <CardContent>
          {/* Header Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid lightgrey',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='subtitle1' fontWeight='bold'>
                {'question.community'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                • {question.askDateTime.toLocaleString()}
              </Typography>
            </Box>
            <Button variant='contained' size='small' sx={{ borderRadius: 20 }}>
              Join
            </Button>
          </Box>

          {/* Card Content */}
          <Typography sx={{ mt: 1.5 }} variant='h5' component='div'>
            {question.title}
          </Typography>

          <Typography variant='body2'>
            {question.text}
            <br />
          </Typography>
        </CardContent>
        <CardActions>
          <Button size='small'>View Post</Button>
        </CardActions>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#ebedef',
            borderRadius: '20px',
            px: 2,
            py: 0.5,
            width: 'auto',
          }}>
          <Typography variant='body2'>Tag</Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default RecommendedQuestionCard;
