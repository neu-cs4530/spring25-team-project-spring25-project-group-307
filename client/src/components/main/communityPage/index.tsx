import React from 'react';
import { Grid2 } from '@mui/material';
import CommuntiyHeader from './header';
import useCommunityPage from '../../../hooks/useCommunityPage';
import CommunityView from './community';

/**
 * CommunityPage component renders a page displaying a list of questions
 * based on filters such as order and search terms.
 * It includes a header with order buttons and a button to ask a new question.
 */
const CommunityPage = () => {
  const {
    val,
    titleText,
    communityList,
    handleJoinCommunity,
    handleLeaveCommunity,
    isUserInCommunity,
    toggleCommunityView,
    handleInputChange,
    handleKeyDown,
  } = useCommunityPage();

  return (
    <div style={{ marginRight: '2%' }}>
      <CommuntiyHeader
        val={val}
        titleText={titleText}
        communityCount={communityList.length}
        toggleCommunityView={toggleCommunityView}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
      />
      <div id='community_list' className='right_padding'>
        <Grid2 container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {communityList.map(c => (
            <Grid2 key={String(c._id)} size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
              <CommunityView
                community={c}
                key={String(c._id)}
                handleJoinCommunity={handleJoinCommunity}
                handleLeaveCommunity={handleLeaveCommunity}
                UserInCommunity={isUserInCommunity(c.title)}
              />
            </Grid2>
          ))}
        </Grid2>
        {titleText === 'Search Results' && !communityList.length && (
          <div className='bold_title right_padding'>No Communities Found</div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
