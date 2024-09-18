import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CustomLink = ({ to, children, userId, email }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Add userId and email to the query parameters
  searchParams.set('userId', userId);
  searchParams.set('email', email);

  const updatedTo = {
    pathname: to,
    search: `?${searchParams.toString()}`,
  };

  return <Link className='card-title' to={updatedTo}>{children}</Link>;
};

export default CustomLink;
