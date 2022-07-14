import React from 'react';
import { NavLink } from 'react-router-dom';

const About = () => {
  return (
    <div>
      <h1 className='text-2xl font-semibold underline hover:text-blue-500'>
        <NavLink to='/about'>About</NavLink>
      </h1>
    </div>
  );
};

export default About;
