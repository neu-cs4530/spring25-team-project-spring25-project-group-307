import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Checkbox, ListItemIcon, ListItemText } from '@mui/material';
import useOptionsMenu from '../../../../../hooks/useOptionsMenu';

const OptionsMenu = ({ communityTitle }: { communityTitle: string }) => {
  const {
    handleClick,
    handleClose,
    handleSubMenuOpen,
    open,
    anchorEl,
    subMenuAnchorEl,
    subMenuOpen,
    allNewCommunitiesChecked,
    allNewQuestionsCheckBoxOnChange,
  } = useOptionsMenu(communityTitle);
  return (
    <div>
      <Button
        id='demo-positioned-button'
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}>
        <MoreHorizIcon />
      </Button>

      <Menu
        id='demo-positioned-menu'
        aria-labelledby='demo-positioned-button'
        anchorEl={anchorEl}
        open={open}
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
            <Checkbox checked={allNewCommunitiesChecked} />
          </ListItemIcon>
          <ListItemText primary='All New Questions' />
        </MenuItem>

        {/* TODO: add more notification preferences here in future */}
      </Menu>
    </div>
  );
};
export default OptionsMenu;
