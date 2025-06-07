
import React from 'react';
import { User } from '../types';
import { TrashIcon, LoadingSpinner, UserIcon } from './icons';

interface UserListProps {
  users: User[];
  onDeleteUser: (username: string) => Promise<void>;
  deletingUser: string | null; // Username of the user being deleted
}

const UserList: React.FC<UserListProps> = ({ users, onDeleteUser, deletingUser }) => {
  if (users.length === 0) {
    return <p className="text-center text-gray-400 py-4">No users found in this realm.</p>;
  }

  return (
    <div className="overflow-x-auto bg-slate-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Username
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Realm
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {users.map((user) => (
            <tr key={user.username} className="hover:bg-slate-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-slate-400" />
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {user.realm}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onDeleteUser(user.username)}
                  disabled={deletingUser === user.username}
                  className="text-red-500 hover:text-red-400 disabled:text-gray-500 disabled:cursor-not-allowed p-1 rounded-md hover:bg-red-500/10 transition-colors flex items-center"
                  aria-label={`Delete user ${user.username}`}
                >
                  {deletingUser === user.username ? (
                    <LoadingSpinner className="w-5 h-5" />
                  ) : (
                    <TrashIcon className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
