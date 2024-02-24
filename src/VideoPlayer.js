import React from 'react';
import ReactPlayer from 'react-player/youtube'; // Import specifically for YouTube videos

const VideoPlayer = ({ videoUrl }) => {
  return (
    <>
        <div className='w-100 h-300 flex justify-center items-center'>
            <ReactPlayer
                className='react-player'
                url={videoUrl}
                controls={true} // Show video controls
            />
        </div>
    </>
  );
};

export default VideoPlayer;
