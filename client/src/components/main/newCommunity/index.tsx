import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import useNewCommunity from '../../../hooks/UseNewCommunity';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import Input from '../baseComponents/input';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewCommunityPage = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    tagNames,
    setTagNames,
    setPrivateCommunity,
    titleErr,
    descriptionErr,
    tagErr,
    postCommunity,
  } = useNewCommunity();

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
      <FormControlLabel
        sx={{ mb: 2 }}
        control={
          <Switch
            onChange={e => {
              setPrivateCommunity(e.currentTarget.checked);
            }}
          />
        }
        label='Private (only added members will see your community)'
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
