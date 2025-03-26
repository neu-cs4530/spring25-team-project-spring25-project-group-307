import { useEffect, useState } from 'react';
import { UserPreference } from '@fake-stack-overflow/shared';
import { addPreference, getPreferences, removePreference } from '../services/preferencesService';
import useUserContext from './useUserContext';

const useOptionsMenu = (communityTitle: string) => {
  const { user } = useUserContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const subMenuOpen = Boolean(subMenuAnchorEl);

  const [allNewQuestionsChecked, setAllNewQuestionsChecked] = useState(false);
  const preferenceToSetter: Record<UserPreference, (value: boolean) => void> = {
    'All Questions': setAllNewQuestionsChecked,
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
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
    setAllNewQuestionsChecked(prev => {
      const newValue = !prev;
      if (newValue) {
        addPreference('All Questions', user.username, communityTitle);
      } else {
        // remove pref here
        removePreference('All Questions', user.username, communityTitle);
      }
      return newValue;
    });
  };

  useEffect(() => {
    getPreferences(user.username, communityTitle)
      .then(result => {
        result.userPreferences.forEach(preference => {
          preferenceToSetter[preference](true);
        });
      })
      .catch(() => {
        // set all check box to false

        Object.keys(preferenceToSetter).forEach(key => {
          preferenceToSetter[key as UserPreference](false);
        });
      });
  }, []);

  return {
    handleMenuOpen,
    handleClose,
    handleSubMenuOpen,
    menuOpen,
    anchorEl,
    subMenuAnchorEl,
    subMenuOpen,
    allNewQuestionsChecked,
    allNewQuestionsCheckBoxOnChange,
  };
};

export default useOptionsMenu;
