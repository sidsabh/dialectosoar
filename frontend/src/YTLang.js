import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'hi', label: 'Hindi' },
];

const YTLang = () => {
    const [submitted, setSubmitted] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('');

    return (
        <div className="flex flex-col items-center justify-center p-5 space-y-4">
            <input
                type="text"
                className="input border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube Video URL"
            />
            
            <select
                className="select border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
            >
                <option value="">Select Source Language</option>
                {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <select
                className="select border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
            >
                <option value="">Select Target Language</option>
                {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <button
                className={`btn ${!videoUrl || !sourceLanguage || !targetLanguage ? 'bg-gray-500 text-white' : 'bg-indigo-600 text-white'} font-bold py-2 px-4 rounded`}
                onClick={() => setSubmitted(true)}
                disabled={!videoUrl || !sourceLanguage || !targetLanguage}
            >
                Learn
            </button>
            <div className="w-full h-full">
                {submitted && (
                    <VideoPlayer
                        videoUrl={videoUrl}
                        sourceLanguage={sourceLanguage}
                        targetLanguage={targetLanguage}
                    />
                )}
            </div>
        </div>
    );
};

export default YTLang;
