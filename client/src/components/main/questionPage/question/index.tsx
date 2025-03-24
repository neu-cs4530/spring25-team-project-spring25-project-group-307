import React, { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import PushPinIcon from '@mui/icons-material/PushPin';
import { Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseCommunity, PopulatedDatabaseQuestion } from '../../../../types/types';
import { pinQuestion, unpinQuestion } from '../../../../services/communityService';

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
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({ question, community, pinnedQuestion, currentRole }: QuestionProps) => {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState<boolean>(false);

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

  /**
   * Function to pin the question to the community.
   */
  const handleTogglePinQuestion = async () => {
    if (community && !pinned) {
      // pin question
      const res = await pinQuestion(community._id, question._id);
      if (res) {
        setPinned(true);
      }
    } else if (community && pinned) {
      // unpin question
      const res = await unpinQuestion(community._id, question._id);
      if (res) {
        setPinned(false);
      }
    }
  };

  useEffect(() => {
    if (pinnedQuestion) {
      setPinned(true);
    }
  }, [pinnedQuestion]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <div
        className='question right_padding'
        style={{ flexGrow: 1 }}
        onClick={() => {
          if (question._id) {
            handleAnswer(question._id);
          }
        }}>
        <div className='postStats'>
          <div>{question.answers.length || 0} answers</div>
          <div>{question.views.length} views</div>
        </div>
        <div className='question_mid'>
          <div className='postTitle'>{question.title}</div>
          <div className='question_tags'>
            {question.tags.map(tag => (
              <button
                key={String(tag._id)}
                className='question_tag_button'
                onClick={e => {
                  e.stopPropagation();
                  clickTag(tag.name);
                }}>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div className='lastActivity'>
          <div className='question_author'>{question.askedBy}</div>
          <div>&nbsp;</div>
          <div className='question_meta'>asked {getMetaData(new Date(question.askDateTime))}</div>
        </div>
      </div>
      {community && (currentRole === 'ADMIN' || currentRole === 'MODERATOR') ? (
        <IconButton onClick={handleTogglePinQuestion} color={pinned ? 'secondary' : 'default'}>
          <PushPinIcon />
        </IconButton>
      ) : (
        pinnedQuestion && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PushPinIcon color='secondary' />
          </Box>
        )
      )}
    </Box>
  );
};

export default QuestionView;
