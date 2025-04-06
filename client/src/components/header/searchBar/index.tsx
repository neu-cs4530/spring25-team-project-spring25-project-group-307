import { Box, TextField } from '@mui/material';

/**
 * Interface representing the props for the SearchBar component.
 *
 * handleInputChange - The function to handle the change in the input field.
 * handleKeyDown - The function to handle the 'Enter' key press and trigger a search.
 * val - The value of the input field.
 */
interface SearchBarProps {
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  val: string;
}

/**
 * SearchBar component that renders a search input field.
 * The search input field allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const SearchBar = ({ handleInputChange, handleKeyDown, val }: SearchBarProps) => (
  <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
    <TextField
      id='search'
      placeholder='Search...'
      variant='outlined'
      value={val}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      size='small'
      sx={{ width: '275px', backgroundColor: '#FDFBF7', borderRadius: '5px' }}
    />
  </Box>
);

export default SearchBar;
