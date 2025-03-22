import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import {
  MenuItem,
  Paper,
  Select,
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
  admins: SafeDatabaseUser[] | undefined;
  moderators: SafeDatabaseUser[] | undefined;
  members: SafeDatabaseUser[] | undefined;
  userRole: string;
}

const CommunityUsers = ({ admins, moderators, members, userRole }: CommunityUsersProps) => (
  <div>
    <h2>Community Members</h2>
    <TableContainer
      component={Paper}
      sx={{ display: 'inline-block', width: 'auto', margin: '0 auto' }}>
      <Table sx={{ width: 'auto' }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell align='right'>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {admins?.map(admin => (
            <TableRow
              key={admin.username}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component='th' scope='row'>
                {admin.username}
              </TableCell>
              <TableCell component='th' scope='row' align='right'>
                Admin
              </TableCell>
            </TableRow>
          ))}
          {moderators?.map(moderator => (
            <TableRow
              key={moderator.username}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component='th' scope='row'>
                {moderator.username}
              </TableCell>
              {userRole === 'ADMIN' ? (
                <TableCell component='th' scope='row' align='right'>
                  <Select label='Role' defaultValue='MODERATOR' size='small'>
                    <MenuItem value='ADMIN'>Admin</MenuItem>
                    <MenuItem value='MODERATOR'>Moderator</MenuItem>
                    <MenuItem value='MEMBER'>Member</MenuItem>
                  </Select>
                </TableCell>
              ) : (
                <TableCell align='right'>Moderator</TableCell>
              )}
            </TableRow>
          ))}
          {members?.map(member => (
            <TableRow
              key={member.username}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component='th' scope='row'>
                {member.username}
              </TableCell>
              {userRole === 'ADMIN' ? (
                <TableCell component='th' scope='row' align='right'>
                  <Select label='Role' defaultValue='MEMBER' size='small'>
                    <MenuItem value='ADMIN'>Admin</MenuItem>
                    <MenuItem value='MODERATOR'>Moderator</MenuItem>
                    <MenuItem value='MEMBER'>Member</MenuItem>
                  </Select>
                </TableCell>
              ) : (
                <TableCell align='right'>Member</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
);

export default CommunityUsers;
