import React from 'react';
import ReactPlayer from 'react-player/youtube'; // Import specifically for YouTube videos
import { useState, useEffect } from 'react';

const url = 'http://localho.st:3001';

const states = {
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    STOPPED: 'STOPPED',
};

const VideoPlayer = ({ videoUrl }) => {
    const [subtitles, setSubtitles] = useState([]);
    const videoID = videoUrl.split('v=')[1];
    const [seconds, setSeconds] = useState(0);


    useEffect(() => {
        const fetchSubtitles = async () => {
            try {
                const response = await fetch(
                    `${url}/video-data?videoID=${videoID}&lang=en`
                    );
                const data = await response.json();
                setSubtitles(data.subtitles);
            } catch (error) {
                console.error('Error fetching video data:', error);
            }
        }
        fetchSubtitles();
    }, [subtitles, videoID]);

    useEffect(() => {
        // IMPLEMENT STATE MACHINE
    }, [seconds]);


    return (
        <>
            <div className='w-100 h-300 flex justify-center items-center'>
                <ReactPlayer
                    className='react-player'
                    url={videoUrl}
                    controls={true} // Show video controls
                    onProgress={(state) => {
                        setSeconds(state.playedSeconds);
                    } }
                />
            </div>
        </>
    );
};

export default VideoPlayer;
