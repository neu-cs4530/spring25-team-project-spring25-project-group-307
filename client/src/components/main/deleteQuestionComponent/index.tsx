import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import useDeleteQuestionComponent from '../../../hooks/useDeleteQuestionComponent';

/**
 * Props for the DeleteQuestionComponent.
 * @param deleteQuestionFromCommunity - Function to delete the question from the community.
 * @param deleteQuestionGlobal - Function to delete the question globally.
 */
interface DeleteQuestionComponentProps {
  deleteQuestionFromCommunity: () => void;
  deleteQuestionGlobal: () => void;
}

/**
 * Component to display the delete question icon and menu.
 */
const DeleteQuestionComponent = ({
  deleteQuestionFromCommunity,
  deleteQuestionGlobal,
}: DeleteQuestionComponentProps) => {
  const { anchorEl, open, handleClick, handleClose } = useDeleteQuestionComponent();
  return (
    <Box sx={{ mr: 1 }}>
      <IconButton size='small' onClick={handleClick}>
        <DeleteIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose}>
        <MenuItem onClick={deleteQuestionFromCommunity}>Delete from Community</MenuItem>
        <MenuItem onClick={deleteQuestionGlobal}>Delete Globally</MenuItem>
      </Menu>
    </Box>
  );
};

export default DeleteQuestionComponent;
