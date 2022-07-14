import React from 'react';
import { NavLink } from 'react-router-dom';

const Home = () => {
  return (
    <h1 className='text-2xl font-semibold underline hover:text-blue-500'>
      <NavLink to='/'>Home</NavLink>
    </h1>
  );
};

export default Home;
