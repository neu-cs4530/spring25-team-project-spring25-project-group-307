import { ObjectId } from 'mongodb';
import { useState } from 'react';
import TopUserCard from './topUserCard';

const TopUsersTab = () => {
  const [users, setUsers] = useState([
    {
      username: 'User1',
      dateJoined: new Date(2025, 2, 10),
    },
    {
      username: 'User2',
      dateJoined: new Date(2025, 10, 9),
    },
    {
      username: 'User3',
      dateJoined: new Date(2025, 7, 16),
    },
  ]);

  return (
    <div>
      {users.map(user => (
        <TopUserCard key={user.username} user={user} />
      ))}
    </div>
  );
};

export default TopUsersTab;
