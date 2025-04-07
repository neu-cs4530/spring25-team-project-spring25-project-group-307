import './index.css';
import { Button, Typography } from '@mui/material';
import React from 'react';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import useAnswerForm from '../../../hooks/useAnswerForm';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewAnswerPage = () => {
  const { text, textErr, setText, postAnswer } = useAnswerForm();

  return (
    <Form>
      <TextArea
        title={'Answer Text'}
        id={'answerTextInput'}
        val={text}
        setState={setText}
        err={textErr}
      />
      <div className='btn_indicator_container'>
        <Button
          variant='contained'
          onClick={() => {
            postAnswer();
          }}
          sx={{ mb: 1 }}>
          Post Answer
        </Button>
        <Typography variant='body1' color='error'>
          * indicates mandatory fields
        </Typography>
      </div>
    </Form>
  );
};

export default NewAnswerPage;
