
import React, { useState, useEffect, useCallback } from 'react';
import { User, NewUserCredentials } from '../types';
import * as turnAdminService from '../services/turnAdminService';
import AddUserForm from './AddUserForm';
import UserList from './UserList';
import AlertMessage from './AlertMessage';
import { LoadingSpinner } from './icons';
import { DEFAULT_REALM } from '../constants';


const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null); // Stores username of user being deleted

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const displayMessage = (message: string, type: 'success' | 'error') => {
    clearMessages();
    if (type === 'success') setSuccessMessage(message);
    else setError(message);
    setTimeout(clearMessages, 5000); // Auto-clear message after 5 seconds
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    clearMessages();
    try {
      const fetchedUsers = await turnAdminService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users.';
      displayMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUsers]); // fetchUsers is memoized with useCallback

  const handleAddUser = async (credentials: NewUserCredentials) => {
    setIsAddingUser(true);
    clearMessages();
    try {
      const newUser = await turnAdminService.addUser(credentials);
      setUsers(prevUsers => [...prevUsers, newUser]);
      displayMessage(`User '${newUser.username}' added successfully to realm '${DEFAULT_REALM}'.`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user.';
      displayMessage(errorMessage, 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete user '${username}'?`)) {
      return;
    }
    setDeletingUser(username);
    clearMessages();
    try {
      await turnAdminService.deleteUser(username);
      setUsers(prevUsers => prevUsers.filter(user => user.username !== username));
      displayMessage(`User '${username}' deleted successfully from realm '${DEFAULT_REALM}'.`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user.';
      displayMessage(errorMessage, 'error');
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10 space-y-8 text-gray-100">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          TURN User Management
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Simulated interface for managing users on realm: <strong className="text-gray-200">{DEFAULT_REALM}</strong>
        </p>
      </header>
      
      {error && <AlertMessage message={error} type="error" onClose={clearMessages} />}
      {successMessage && <AlertMessage message={successMessage} type="success" onClose={clearMessages} />}

      <section className="bg-slate-800/50 p-6 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-4 text-gray-200 border-b border-slate-700 pb-2">Add New User</h2>
        <AddUserForm onAddUser={handleAddUser} isAdding={isAddingUser} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-200 border-b border-slate-700 pb-2">Current Users</h2>
        {isLoading ? (
          <div className="flex items-center justify-center text-gray-400 py-8">
            <LoadingSpinner className="w-8 h-8 mr-3" />
            <span>Loading users...</span>
          </div>
        ) : (
          <UserList users={users} onDeleteUser={handleDeleteUser} deletingUser={deletingUser} />
        )}
      </section>
       <footer className="text-center text-xs text-gray-500 pt-4 border-t border-slate-700">
        This is a client-side simulation. No actual 'turnadmin' commands are executed.
      </footer>
    </div>
  );
};

export default UserManagementPage;
