import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { codeToFull } from './constants';
import { useEffect } from 'react';
import './Header.css';
import './App.css';
import Toggle from './Toggle.js';
import { keepTheme } from './themes.js';

const App = () => {
    const [submitted, setSubmitted] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('');
    const [className, setClassName] = useState('theme-dark');

    useEffect(() => {

        // scroll to the top of the youtube player
        const player = document.getElementById('player');
        if (player) {
            // player.scrollIntoView({ behavior: 'smooth' });
            // player.scrollIntoView({ block: 'start', behavior: 'smooth' });

            // scroll so player is at the top of the page
            const rect = player.getBoundingClientRect();
            const offset = window.pageYOffset;
            const top = rect.top + offset;
            window.scrollTo({ top, behavior: 'smooth' });
            
        }
    }, [submitted]);

    useEffect(() => {
        keepTheme(setClassName);
        console.log(className); // Add this line to log className
    }, [setClassName]);

    useEffect(() => {
        console.log(className);
    }, [className]);

    return (
        (localStorage.getItem('theme') ==='theme-dark') ? 
            <div className="background" style = {{background: '#606060', height: '1400px'}}>
                <div className="header" style={{display: 'flex', alignItems: 'center' }}>
                    <div className="third" style = {{flex: 2}}>
                        <div className="logo">
                            <img src='/logo.png' alt = "Dialectosoar" style ={{ width: '200px', height: '100px' }}/>
                        </div>
                    </div>

                    <div className="third" style = {{ flex: 2}}>
                        <div className="text" style={{ marginLeft: '10px', color: '#C0C0C0', fontSize: '60px', font: 'RussoOne' }}>
                            Dialectosoar
                        </div>
                    </div>
                    
                    <div className="third" style={{ flex: 1, marginLeft: '10px', color: '#C0C0C0', fontSize: '20px', font: 'RussoOne', alignItems: 'self-end' }}>
                            Dark Mode?
                    </div>
                    <div className="third" style = {{flex: 1, alignItems: 'self-start', marginLeft: '10px'}}>
                        <Toggle setClassName={setClassName}/>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-5 space-y-4 w-full max-w-md mx-auto mt-5"
                    style = {{ background: "#747579"}}>
                    <input
                        type="text"
                        className="w-full p-3 bg-gray-200 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                        style = {{background: '#606060', color: '#C0C0C0'}}
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Enter YouTube Video URL"
                    />
                    
                    <select
                        className="w-full p-3 bg-gray-200 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                        style = {{background: '#606060', color: '#C0C0C0'}}
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
                        className="w-full p-3 bg-gray-200 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                        style = {{background: '#606060', color: '#C0C0C0'}}
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
                        style = {{background: '#606060', color: '#C0C0C0'}}
                        onClick={() => setSubmitted(true)}
                        disabled={!videoUrl || !sourceLanguage || !targetLanguage}
                    >
                        Learn
                    </button>
                </div>
                {submitted && (
                    <div className="w-full">
                        <VideoPlayer
                            videoUrl={videoUrl}
                            sourceLanguage={sourceLanguage}
                            targetLanguage={targetLanguage}
                        />
                    </div>
                )}
            </div>
            :
            <div className="background" style = {{background: '#ABC388', height: '1400px'}}>
                <div className="header" style={{display: 'flex', alignItems: 'center', background: '#4C2E05' }}>
                    <div className="third" style = {{flex: 2}}>
                        <div className="logo">
                            <img src='/logo.png' alt = "Dialectosoar" style ={{ width: '200px', height: '100px' }}/>
                        </div>
                    </div>

                    <div className="third" style = {{ flex: 2}}>
                        <div className="text" style={{ marginLeft: '10px', color: '#E0E0E0', fontSize: '60px', font: 'RussoOne' }}>
                            Dialectosoar
                        </div>
                    </div>
                    
                    <div className="third" style={{ flex: 1, marginLeft: '10px', color: '#E0E0E0', fontSize: '20px', font: 'RussoOne', alignItems: 'self-end' }}>
                            Dark Mode?
                    </div>
                    <div className="third" style = {{flex: 1, alignItems: 'self-start', marginLeft: '10px'}}>
                        <Toggle setClassName={setClassName}/>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-5 space-y-4 w-full max-w-md mx-auto  mt-5"
                    style = {{ background: "#8DB057"}}>
                    <input
                        type="text"
                        className="w-full p-3 bg-gray-200 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                        style = {{background: '#ABC388', color: 'black'}}
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Enter YouTube Video URL"
                    />
                    
                    <select
                        className="w-full p-3 bg-gray-200 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                        style = {{background: '#ABC388', color: 'black'}}
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
                        className="w-full p-3 bg-gray-200 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm transition ease-in-out duration-150"
                        style = {{background: '#ABC388', color: 'black'}}
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
                        style = {{background: '#ABC388', color: 'black'}}
                        onClick={() => setSubmitted(true)}
                        disabled={!videoUrl || !sourceLanguage || !targetLanguage}
                    >
                        Learn
                    </button>
                </div>
                {submitted && (
                     <div className="w-full" id="player">
                        <VideoPlayer
                            videoUrl={videoUrl}
                            sourceLanguage={sourceLanguage}
                            targetLanguage={targetLanguage}
                        />
                    </div>
                )}
            </div>
    );
};

export default App;
