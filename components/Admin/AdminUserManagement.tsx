

import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { mockApiService } from '../../services/mockApiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const { addToast } = useNotification();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await mockApiService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      addToast({ message: 'Failed to load users.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  const handleSaveUserRole = async () => {
    if (!editingUser) return;
    try {
      const updatedUser = await mockApiService.updateUserRole(editingUser.id, newRole);
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      addToast({ message: `User ${updatedUser.username}'s role updated to ${newRole}.`, type: 'success' });
      setEditingUser(null);
    } catch (error) {
      addToast({ message: 'Failed to update user role.', type: 'error' });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}? This action is irreversible.`)) {
      try {
        await mockApiService.deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        addToast({ message: `User ${username} deleted successfully.`, type: 'success' });
      } catch (error: any) {
        const message = error?.message || `Failed to delete user ${username}. An unknown error occurred.`;
        addToast({ message, type: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-primary-800 dark:text-primary-100">User Management</h3>
      {users.length === 0 ? <p className="text-primary-600 dark:text-primary-300">No users found.</p> : (
        <div className="overflow-x-auto bg-white dark:bg-primary-800 shadow-sm rounded-lg border border-secondary-200 dark:border-primary-700">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-primary-700">
            <thead className="bg-secondary-100 dark:bg-primary-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-primary-800 divide-y divide-secondary-200 dark:divide-primary-700">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700 dark:text-primary-200">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">
                    {editingUser?.id === user.id ? (
                      <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="block w-full pl-3 pr-10 py-1.5 text-base border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm rounded-lg"
                      >
                        {Object.values(UserRole).map(role => (
                          <option key={role} value={role} disabled={role === UserRole.ADMIN && user.role !== UserRole.ADMIN }>{role}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300' : 
                        user.role === UserRole.EDITOR ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                        'bg-accent-100 text-accent-700 dark:bg-accent-800/30 dark:text-accent-300' 
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    {editingUser?.id === user.id ? (
                      <>
                        <Button size="sm" onClick={handleSaveUserRole}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)} title="Edit Role" className="p-1.5">
                        <PencilSquareIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-accent-400 dark:hover:text-accent-300"/>
                      </Button>
                    )}
                    {user.role !== UserRole.ADMIN && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id, user.username)} title="Delete User" className="p-1.5">
                        <TrashIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 hover:text-red-500 dark:hover:text-red-400"/>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
