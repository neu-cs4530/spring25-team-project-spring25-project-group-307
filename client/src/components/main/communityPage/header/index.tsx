import React from 'react';
import { Switch, TextField } from '@mui/material';
import CreateCommunityButton from '../../createCommunityButton';

/**
 * Interface representing the props for the QuestionHeader component.
 *
 * titleText - The title text displayed at the top of the header.
 * communityCount - The number of communities to be displayed in the header.
 */
interface CommunityHeaderProps {
  val: string;
  titleText: string;
  communityCount: number;
  toggleCommunityView: () => void;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * CommunityHeader component displays the header section for a list of communities.
 * It includes the title, a button to create a new community, the number of the communities,
 * and buttons to view the user's joined communities.
 *
 * @param titleText - The title text to display in the header.
 * @param communityCount - The number of questions displayed in the header.
 */
const CommunityHeader = ({
  val,
  titleText,
  communityCount,
  toggleCommunityView,
  handleInputChange,
  handleKeyDown,
}: CommunityHeaderProps) => (
  <div>
    <div className='space_between right_padding'>
      <div className='bold_title'>{titleText}</div>
      <TextField
        sx={{ width: '20%' }}
        id='search'
        label='Search for Communities'
        variant='outlined'
        size='small'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <CreateCommunityButton />
    </div>
    <div className='space_between right_padding'>
      <div id='question_count'>{communityCount} communities</div>
      <div>
        <span>Joined</span>
        <Switch defaultChecked onChange={toggleCommunityView} />
        <span>All</span>
      </div>
    </div>
  </div>
);

export default CommunityHeader;
