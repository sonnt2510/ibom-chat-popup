import React from 'react';
import './Loading.css';

function Loading({ isFullScreen }) {
  return (
    <div
      className={`Loading ${isFullScreen ? 'Loading--isFullScreen' : ''}`}
    ></div>
  );
}

export default Loading;
