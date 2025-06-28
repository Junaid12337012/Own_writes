
import React from 'react';
import { useParams } from 'react-router-dom';
import AuthorProfile from '../components/Blog/AuthorProfile';

const AuthorPageWrapper: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>();

  if (!authorId) {
    return <div className="text-center py-10 text-red-500">Error: Author ID is missing.</div>;
  }

  return <AuthorProfile authorId={authorId} />;
};

export default AuthorPageWrapper;