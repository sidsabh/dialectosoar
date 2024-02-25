import React, { useEffect, useState } from 'react';
import { setTheme, keepTheme } from './themes.js';

function Toggle({ setClassName }) {
  const [togClass, setTogClass] = useState('dark');

  const handleOnClick = () => {
    if (localStorage.getItem('theme') === 'theme-dark') {
      setTheme('theme-light', setClassName);
      setTogClass('light');
      keepTheme(setClassName);
    } else {
      setTheme('theme-dark', setClassName);
      setTogClass('dark');
      keepTheme(setClassName);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('theme') === 'theme-dark') {
      setTogClass('dark')
    } else if (localStorage.getItem('theme') === 'theme-light') {
      setTogClass('light')
    }
  }, []) // Run once on component mount to initialize state

  return (
    <div className="container--toggle">
      <input type="checkbox" id="toggle" className="toggle--checkbox" onClick={handleOnClick} />
      <label htmlFor="toggle" className="toggle--label">
        <span className="toggle--label-background"></span>
      </label>
    </div>
  )
}

export default Toggle;
