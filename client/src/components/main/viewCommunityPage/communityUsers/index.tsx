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
import { ObjectId } from 'mongodb';
import useCommunityUsers from '../../../../hooks/useCommunityUsers';
import HeaderCommunityUsers from '../headerCommunityUsers';

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
  communityID?: ObjectId;
}

const CommunityUsers = ({
  admins,
  moderators,
  members,
  userRole,
  communityID,
}: CommunityUsersProps) => {
  const {
    handleRoleChange,
    handleAddUser,
    open,
    handleOpen,
    handleClose,
    userToAdd,
    handleSetUsername,
  } = useCommunityUsers({
    communityID,
  });
  return (
    <div>
      <TableContainer component={Paper} sx={{ display: 'inline-block' }}>
        <HeaderCommunityUsers
          handleAddUser={handleAddUser}
          open={open}
          handleOpen={handleOpen}
          handleClose={handleClose}
          userToAdd={userToAdd}
          handleSetUsername={handleSetUsername}
        />
        <Table aria-label='simple table'>
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
                    <Select
                      label='Role'
                      value='moderators'
                      size='small'
                      onChange={e => {
                        handleRoleChange(moderator.username, e.target.value as string);
                      }}>
                      <MenuItem value='admins'>Admin</MenuItem>
                      <MenuItem value='moderators'>Moderator</MenuItem>
                      <MenuItem value='members'>Member</MenuItem>
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
                    <Select
                      label='Role'
                      defaultValue='members'
                      size='small'
                      onChange={e => {
                        handleRoleChange(member.username, e.target.value as string);
                      }}>
                      <MenuItem value='admins'>Admin</MenuItem>
                      <MenuItem value='moderators'>Moderator</MenuItem>
                      <MenuItem value='members'>Member</MenuItem>
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
};

export default CommunityUsers;
