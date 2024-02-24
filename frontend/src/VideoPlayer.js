import React from 'react';
import ReactPlayer from 'react-player/youtube'; // Import specifically for YouTube videos
import { useState, useEffect } from 'react';
import { getSubtitles, getVideoDetails } from 'youtube-caption-extractor';


const VideoPlayer = ({ videoUrl }) => {
    const [subtitles, setSubtitles] = useState([]);
    const videoID = videoUrl.split('v=')[1];


    // Fetching Subtitles
    const fetchSubtitles = async (videoID, lang = 'en') => {
        try {
            const subtitles = await getSubtitles({ videoID, lang });
            console.log(subtitles);
            setSubtitles(subtitles);
        } catch (error) {
            console.error('Error fetching subtitles:', error);
        }
    };

    // Fetching Video Details
    const fetchVideoDetails = async (videoID, lang = 'en') => {
    try {
        const videoDetails = await getVideoDetails({ videoID, lang });
        console.log(videoDetails);
    } catch (error) {
        console.error('Error fetching video details:', error);
    }
    };

    const lang = 'en'; // Optional, default is 'en' (English)

    // fetchSubtitles(videoID, lang);
    // fetchVideoDetails(videoID, lang);

    useEffect(() => {
        async function fetchData() {
            await fetchSubtitles(videoID, lang);
            await fetchVideoDetails(videoID, lang);
        }
        fetchData();
    }, [videoID, lang]);

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
