import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import TopUserCard from './topUserCard';

const TopUsersTab = ({ users }: { users: Omit<SafeDatabaseUser, '_id'>[] }) => (
  <div>
    {users.map(user => (
      <TopUserCard key={user.username} user={user} />
    ))}
  </div>
);

export default TopUsersTab;
