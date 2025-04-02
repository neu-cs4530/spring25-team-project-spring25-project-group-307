import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Checkbox, ListItemIcon, ListItemText } from '@mui/material';
import useOptionsMenu from '../../../../../hooks/useOptionsMenu';

const OptionsMenu = ({ communityTitle }: { communityTitle: string }) => {
  const {
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
  } = useOptionsMenu(communityTitle);
  return (
    <div>
      <Button
        id='demo-positioned-button'
        aria-controls={menuOpen ? 'demo-positioned-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={handleMenuOpen}>
        <MoreHorizIcon />
      </Button>

      <Menu
        id='demo-positioned-menu'
        aria-labelledby='demo-positioned-button'
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <MenuItem onClick={handleSubMenuOpen}>Notification Settings ▶</MenuItem>
      </Menu>
      <Menu
        anchorEl={subMenuAnchorEl}
        open={subMenuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <MenuItem onClick={allNewQuestionsCheckBoxOnChange}>
          <ListItemIcon>
            <Checkbox checked={allNewQuestionsChecked} />
          </ListItemIcon>
          <ListItemText primary='All New Questions' />
        </MenuItem>
        <MenuItem onClick={answersToMyQuestionsCheckedOnChange}>
          <ListItemIcon>
            <Checkbox checked={answersToMyQuestionsChecked} />
          </ListItemIcon>
          <ListItemText primary='Answers to my Questions' />
        </MenuItem>
        <MenuItem onClick={commentsOnMyAnswersCheckedOnChange}>
          <ListItemIcon>
            <Checkbox checked={commentsOnMyAnswersChecked} />
          </ListItemIcon>
          <ListItemText primary='Comments on my Questions' />
        </MenuItem>

        {/* TODO: add more notification preferences here in future */}
      </Menu>
    </div>
  );
};
export default OptionsMenu;
