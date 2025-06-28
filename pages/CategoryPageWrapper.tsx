
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CategoryPage from './CategoryPage'; // We will create this next

const CategoryPageWrapper: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();

  if (!categoryName) {
    // This case should ideally not be hit if routes are set up correctly,
    // but as a fallback, navigate to a general blogs page or home.
    return <Navigate to="/blogs" replace />;
  }

  return <CategoryPage categoryName={decodeURIComponent(categoryName)} />;
};

export default CategoryPageWrapper;
