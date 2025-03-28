import { useEffect, useMemo, useState } from 'react';
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
  const [answersToMyQuestionsChecked, setanswersToMyQuestionsChecked] = useState(false);
  const [commentsOnMyAnswersChecked, setcommentsOnMyAnswersChecked] = useState(false);

  const preferenceToSetter: Record<UserPreference, (value: boolean) => void> = useMemo(
    () => ({
      'All Questions': setAllNewQuestionsChecked,
      'Answers to my Questions': setanswersToMyQuestionsChecked,
      'Comments on my Questions': setcommentsOnMyAnswersChecked,
    }),
    [],
  );

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

  const answersToMyQuestionsCheckedOnChange = (event: React.MouseEvent<HTMLElement>) => {
    setanswersToMyQuestionsChecked(prev => {
      const newValue = !prev;
      if (newValue) {
        addPreference('Answers to my Questions', user.username, communityTitle);
      } else {
        // remove pref here
        removePreference('Answers to my Questions', user.username, communityTitle);
      }
      return newValue;
    });
  };

  const commentsOnMyAnswersCheckedOnChange = (event: React.MouseEvent<HTMLElement>) => {
    setcommentsOnMyAnswersChecked(prev => {
      const newValue = !prev;
      if (newValue) {
        addPreference('Comments on my Questions', user.username, communityTitle);
      } else {
        // remove pref here
        removePreference('Comments on my Questions', user.username, communityTitle);
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
  }, [communityTitle, preferenceToSetter, user.username]);

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
    answersToMyQuestionsChecked,
    answersToMyQuestionsCheckedOnChange,
    commentsOnMyAnswersChecked,
    commentsOnMyAnswersCheckedOnChange,
  };
};

export default useOptionsMenu;
