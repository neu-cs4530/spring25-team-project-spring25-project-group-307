import { SafeDatabaseUser } from '@fake-stack-overflow/shared';

/**
 * Props for the CommunityUsers component.
 *
 * @param users - The list of users to display.
 */
interface CommunityUsersProps {
  users: SafeDatabaseUser[];
}

const CommunityUsers = ({ users }: CommunityUsersProps) => (
  <div className='community-users'>
    <h2>Community Users</h2>
    <div className='users'>
      {users.map(user => (
        <div key={user.username} className='user'>
          <h3>{user.username}</h3>
          <p>{user.biography}</p>
        </div>
      ))}
    </div>
  </div>
);

export default CommunityUsers;
