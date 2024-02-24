import React from 'react';
import ReactPlayer from 'react-player/youtube'; // Import specifically for YouTube videos
import { useState, useEffect } from 'react';

const url = 'http://localho.st:3001/video-data';

const VideoPlayer = ({ videoUrl }) => {
    const [subtitles, setSubtitles] = useState([]);
    const videoID = videoUrl.split('v=')[1];

    useEffect(() => {
        const fetchSubtitles = async () => {
            try {
                const response = await fetch(
                    `${url}?videoID=${videoID}&lang=en`
                    );
                const data = await response.json();
                setSubtitles(data.subtitles);
            } catch (error) {
                console.error('Error fetching video data:', error);
            }
        }
        fetchSubtitles();
    }, [videoID]);


    useEffect(() => {
        console.log('subtitles:', subtitles);
    }, [subtitles]);

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
