import { useEffect, useState } from 'react';
import { UserPreference } from '@fake-stack-overflow/shared';
import addPreference from '../services/preferencesService';
import useUserContext from './useUserContext';

const useOptionsMenu = (communityTitle: string) => {
  const { user } = useUserContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const subMenuOpen = Boolean(subMenuAnchorEl);

  const [allNewCommunitiesChecked, setAllNewCommunitiesChecked] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
  };

  const handleSubMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSubMenuAnchorEl(event.currentTarget);
  };

  const allNewQuestionsCheckBoxOnChange = (event: React.MouseEvent<HTMLElement>) => {
    setAllNewCommunitiesChecked(prev => {
      const newValue = !prev;
      if (newValue) {
        addPreference('All Questions', user.username, communityTitle).then(result =>
          console.log(result),
        );
      } else {
        // remove pref her
        console.log('remove pref');
      }
      return newValue;
    });
  };

  useEffect(() => {
    console.log(`getting the preferences for ${communityTitle}`);
  }, []);

  return {
    handleClick,
    handleClose,
    handleSubMenuOpen,
    open,
    anchorEl,
    subMenuAnchorEl,
    subMenuOpen,
    allNewCommunitiesChecked,
    allNewQuestionsCheckBoxOnChange,
  };
};

export default useOptionsMenu;
