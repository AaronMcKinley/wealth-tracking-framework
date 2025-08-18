import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-darkBg text-textLight px-4 py-16">
      <h1 className="text-6xl font-bold text-primaryGreen mb-4">404</h1>
      <p className="text-xl text-textMuted mb-8">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <Link to="/dashboard" className="btn btn-primary px-6 py-2 text-lg font-semibold rounded">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
