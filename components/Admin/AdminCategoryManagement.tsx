

import React, { useState, useEffect, useCallback } from 'react';
import { mockApiService } from '../../services/mockApiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { TrashIcon, TagIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ManagedCategoryWithCount {
    name: string;
    count: number;
}

const AdminCategoryManagement: React.FC = () => {
  const [categoriesWithCount, setCategoriesWithCount] = useState<ManagedCategoryWithCount[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useNotification();

  const fetchManagedCategoriesData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedCategories = await mockApiService.getManagedCategoriesWithCount();
      setCategoriesWithCount(fetchedCategories);
    } catch (error) {
      addToast({ message: 'Failed to load categories and their counts.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchManagedCategoriesData();
  }, [fetchManagedCategoriesData]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      addToast({ message: 'Category name cannot be empty.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await mockApiService.addManagedCategory(newCategoryName.trim());
      addToast({ message: `Managed category "${newCategoryName.trim()}" added successfully.`, type: 'success' });
      setNewCategoryName('');
      fetchManagedCategoriesData(); // Refresh list with counts
    } catch (error: any) {
      addToast({ message: error.message || 'Failed to add category.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete the managed category "${categoryName}"? This will also remove this tag from all posts.`)) {
      setIsSubmitting(true); // Indicate loading for delete action as well
      try {
        await mockApiService.deleteManagedCategory(categoryName);
        addToast({ message: `Managed category "${categoryName}" deleted successfully.`, type: 'success' });
        fetchManagedCategoriesData(); // Refresh list
      } catch (error) {
        addToast({ message: 'Failed to delete category.', type: 'error' });
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading managed categories..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-primary-900 dark:text-primary-100 flex items-center">
        <TagIcon className="h-7 w-7 mr-2 text-accent-500 dark:text-accent-400" />
        Managed Category Control
      </h3>
      <p className="text-sm text-primary-600 dark:text-primary-400">
        These categories will appear as selectable chips in the blog editor. Deleting a category here will remove it from the selectable list and also untag it from any posts currently using it.
      </p>

      <form onSubmit={handleAddCategory} className="space-y-3 sm:space-y-0 sm:flex sm:items-end sm:space-x-3 p-4 bg-secondary-50 dark:bg-primary-700/50 rounded-lg border border-secondary-200 dark:border-primary-600">
        <div className="flex-grow">
          <label htmlFor="newCategoryName" className="block text-sm font-medium text-primary-700 dark:text-primary-300">
            New Managed Category Name
          </label>
          <input
            type="text"
            id="newCategoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-secondary-300 dark:border-primary-600 bg-white dark:bg-primary-700 text-primary-700 dark:text-primary-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-primary-700 focus:ring-accent-400 dark:focus:ring-accent-500 focus:border-accent-400 dark:focus:border-accent-500 sm:text-sm"
            placeholder="e.g., Artificial Intelligence"
            disabled={isSubmitting}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} leftIcon={<PlusIcon className="h-5 w-5"/>} className="w-full sm:w-auto">
          Add Category
        </Button>
      </form>

      {categoriesWithCount.length === 0 ? (
        <p className="text-primary-600 dark:text-primary-300 py-4">No managed categories found. Add some above to make them available as chips in the editor!</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-primary-800 shadow-sm rounded-lg border border-secondary-200 dark:border-primary-700">
          <table className="min-w-full divide-y divide-secondary-200 dark:divide-primary-700">
            <thead className="bg-secondary-100 dark:bg-primary-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider">Category Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider whitespace-nowrap">
                    <DocumentTextIcon className="h-4 w-4 inline mr-1" /> Posts Using
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 dark:text-primary-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-primary-800 divide-y divide-secondary-200 dark:divide-primary-700">
              {categoriesWithCount.map(category => (
                <tr key={category.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700 dark:text-primary-200">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">{category.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category.name)}
                      title={`Delete category "${category.name}"`}
                      className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:!bg-red-100 dark:hover:!bg-primary-700"
                      isLoading={isSubmitting} 
                      disabled={isSubmitting} 
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
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

export default AdminCategoryManagement;
