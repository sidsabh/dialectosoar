import React from 'react';
import ReactPlayer from 'react-player/youtube'; // Import specifically for YouTube videos
import { useState, useEffect } from 'react';
// import { YoutubeTranscript } from 'youtube-transcript';


const VideoPlayer = ({ videoUrl }) => {
    const [transcript, setTranscript] = useState('');
    
    // useEffect(() => {
    //     YoutubeTranscript.fetchTranscript(videoUrl).then(
    //         (transcript) => {

    //             let text = '';
    //             transcript.forEach((item) => {
    //                 text += item.text + ' ';
    //             });
    //             setTranscript(text);
    //         }
    //     );
    // }, [videoUrl]);

    useEffect(() => {
        console.log('Transcript:', transcript);
    }, [transcript]);
    
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
