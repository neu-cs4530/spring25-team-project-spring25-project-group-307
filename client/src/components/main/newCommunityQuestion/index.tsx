import { Button, Typography } from '@mui/material';
import useNewCommunityQuestion from '../../../hooks/useNewCommunityQuestion';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';

const NewCommunityQuestion = () => {
  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
  } = useNewCommunityQuestion();
  return (
    <Form>
      <Input
        title={'Question Title'}
        hint={'Limit title to 100 characters or less'}
        id={'formTitleInput'}
        val={title}
        setState={setTitle}
        err={titleErr}
      />
      <TextArea
        title={'Question Text'}
        hint={'Add details'}
        id={'formTextInput'}
        val={text}
        setState={setText}
        err={textErr}
      />
      <Input
        title={'Tags'}
        hint={'Add keywords separated by whitespace'}
        id={'formTagInput'}
        val={tagNames}
        setState={setTagNames}
        err={tagErr}
      />
      <div className='btn_indicator_container'>
        <Button
          variant='contained'
          onClick={() => {
            postQuestion();
          }}
          sx={{ mb: 1 }}>
          Post Question
        </Button>
        <Typography variant='body1' color='error'>
          * indicates mandatory fields
        </Typography>
      </div>
    </Form>
  );
};

export default NewCommunityQuestion;
