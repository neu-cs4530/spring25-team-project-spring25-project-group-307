import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * Props for the CommunityUsers component.
 *
 * @param users - The list of users to display.
 */
interface CommunityUsersProps {
  users: SafeDatabaseUser[];
}

const CommunityUsers = ({ users }: CommunityUsersProps) => (
  <div>
    <h2>Community Members</h2>
    <TableContainer
      component={Paper}
      sx={{ display: 'inline-block', width: 'auto', margin: '0 auto' }}>
      <Table sx={{ width: 'auto' }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell align='right'>User ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow
              key={user._id.toString()}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component='th' scope='row'>
                {user.username}
              </TableCell>
              <TableCell align='right'>{user._id.toString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
);

export default CommunityUsers;
