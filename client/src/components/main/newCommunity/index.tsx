import React from 'react';
import useNewCommunity from '../../../hooks/UseNewCommunity';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import Input from '../baseComponents/input';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewCommunityPage = () => {
  const { title, setTitle, description, setDescription, titleErr, descriptionErr, postCommunity } =
    useNewCommunity();

  return (
    <Form>
      <Input
        title={'Community Title'}
        hint={'Limit title to 100 characters or less'}
        id={'formTitleInput'}
        val={title}
        setState={setTitle}
        err={titleErr}
      />
      <TextArea
        title={'Community Description'}
        hint={'Add details'}
        id={'formTextInput'}
        val={description}
        setState={setDescription}
        err={descriptionErr}
      />
      <div className='btn_indicator_container'>
        <button
          className='form_postBtn'
          onClick={() => {
            postCommunity();
          }}>
          Post Community
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewCommunityPage;
