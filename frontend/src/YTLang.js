import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { codeToFull } from './constants';
import { useEffect } from 'react';

const YTLang = () => {
    const [submitted, setSubmitted] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('');

    useEffect(() => {
        if (submitted) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }, [submitted]);

    return (
       
        <>
         <div className="flex flex-col items-center justify-center p-5 space-y-4 w-full max-w-md mx-auto">
            <input
                type="text"
                className="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube Video URL"
            />
            
            <select
                className="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
            >
                <option value="">Select Source Language</option>
                {codeToFull.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <select
                className="w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
            >
                <option value="">Select Target Language</option>
                {codeToFull.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button
                className={`w-full p-3 text-white font-bold rounded-md transition ease-in-out duration-150 ${!videoUrl || !sourceLanguage || !targetLanguage ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                onClick={() => setSubmitted(true)}
                disabled={!videoUrl || !sourceLanguage || !targetLanguage}
            >
                Learn
            </button>
        </div>
        {submitted && (
            <div className="w-full mt-8">
                <VideoPlayer
                    videoUrl={videoUrl}
                    sourceLanguage={sourceLanguage}
                    targetLanguage={targetLanguage}
                />
            </div>
        )}
        </>
    );
};

export default YTLang;
