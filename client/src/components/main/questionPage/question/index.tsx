import React from 'react';
import { ObjectId } from 'mongodb';
import PushPinIcon from '@mui/icons-material/PushPin';
import { Box, Card, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseCommunity, PopulatedDatabaseQuestion } from '../../../../types/types';

/**
 * Interface representing the props for the Question component.
 *
 * q - The question object containing details about the question.
 */
interface QuestionProps {
  question: PopulatedDatabaseQuestion;
  community?: PopulatedDatabaseCommunity;
  pinnedQuestion?: boolean;
  currentRole?: string;
  handleTogglePinQuestion?: (question: PopulatedDatabaseQuestion) => void;
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({
  question,
  community,
  pinnedQuestion,
  currentRole,
  handleTogglePinQuestion,
}: QuestionProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param tagName - The name of the tag to be added to the search parameters.
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);

    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Function to navigate to the specified question page based on the question ID.
   *
   * @param questionID - The ID of the question to navigate to.
   */
  const handleAnswer = (questionID: ObjectId) => {
    navigate(`/question/${questionID}`);
  };

  return (
    <Card
      sx={{
        'display': 'flex',
        'justifyContent': 'space-between',
        'marginBottom': 2,
        'borderRadius': 5,
        'boxShadow': 3,
        'backgroundColor': '#FDFBF7',
        '&:hover': {
          backgroundColor: '#F7F7F7',
        },
      }}>
      <CardContent
        sx={{
          flexGrow: 1,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          transition: 'background-color 0.3s',
          px: 3,
        }}
        onClick={() => {
          if (question._id) {
            handleAnswer(question._id);
          }
        }}>
        <Box sx={{ width: '15%' }}>
          <Typography variant='body2'>{question.answers.length || 0} answers</Typography>
          <Typography variant='body2'>{question.views.length} views</Typography>
        </Box>
        <Box sx={{ width: '65%' }}>
          <Typography variant='h6' sx={{ fontWeight: 550, marginBottom: 2 }}>
            {question.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {question.tags.map(tag => (
              <Chip
                key={String(tag._id)}
                label={tag.name}
                size='small'
                onClick={e => {
                  e.stopPropagation();
                  clickTag(tag.name);
                }}
                sx={{ padding: 1 }}
              />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            width: '20%',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
          <Typography component='span' variant='body2' color='primary.main'>
            {question.askedBy}{' '}
          </Typography>
          <Typography component='span' variant='body2' color='text.secondary'>
            asked {getMetaData(new Date(question.askDateTime))}
          </Typography>
        </Box>
        {community && (currentRole === 'ADMIN' || currentRole === 'MODERATOR') ? (
          <CardActions>
            <IconButton
              onClick={event => {
                event.stopPropagation();
                if (handleTogglePinQuestion) {
                  handleTogglePinQuestion(question);
                }
              }}
              color={pinnedQuestion ? 'secondary' : 'default'}>
              <PushPinIcon />
            </IconButton>
          </CardActions>
        ) : (
          pinnedQuestion && (
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
              <PushPinIcon color='secondary' />
            </Box>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionView;
