import React from 'react';
import ReactPlayer from 'react-player/youtube';
import { useState, useEffect, useRef } from 'react';


const codeToFull = {
    en: 'English',
    es: 'Spanish',
    hi: 'Hindi',
}


// const
const url = 'http://localho.st:3001';
const states = {
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    STOPPED: 'STOPPED'
};
const generated = {
    question: "",
    answers: [],
    correctAnswerIndex: 0
};
const statistics = {
    numCorrect: 0,
    numIncorrect: 0,
    numSkipped: 0
};

const configuration = {
    questionDelay: 5,
    numQuestions: 5,
    charsPerQuestion: 200
}

const fakeGenerateQuestion = () => {
    return {
        json: () => {
            return {
                question: "What is the capital of France?",
                answers: ["Paris", "London", "Berlin", "Madrid"],
                correctAnswerIndex: 0
            };
        }
    };
}

const VideoPlayer = ({ videoUrl, sourceLanguage, targetLanguage }) => {

    // parent
    const [videoDetails, setVideoDetails] = useState({});
    const [seconds, setSeconds] = useState(0);

    // state
    const [state, setState] = useState(states.PLAYING);

    // question
    const [generation, setGeneration] = useState(generated);
    
    // statistics
    const [statistic, setStatistic] = useState(statistics);

    // user
    const [config, setConfig] = useState(configuration);

    const pauseTimeRef = useRef(config.questionDelay);

    let runningSubtitles = useRef([]);


    // fetch subtitles
    useEffect(() => {
        const fetchSubtitles = async () => {
            try {
                const response = await fetch(
                    `${url}/video-data?videoID=${videoUrl.split('v=')[1]}&lang=${sourceLanguage}`
                    );
                const data = await response.json();
                setVideoDetails(data.videoDetails);
            } catch (error) {
                console.error('ERROR:', error);
            }
        }
        fetchSubtitles();
    }, [sourceLanguage, videoUrl]);


    useEffect(() => {
        const getQuestion = async () => {
            try {
                const response = await fetch(`${url}/generate-question`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title: videoDetails.title,
                      description: videoDetails.description,
                      subtitles: runningSubtitles.current.join(' '),
                      targetLanguage,
                      sourceLanguage,
                    }),
                  });
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                const data = await response.json();
                setGeneration(data);
                
            } catch (error) {
                console.error('ERROR:', error);
            }
        }

        const roundedSeconds = Math.round(seconds);
        runningSubtitles.current = [];
        for (let i = 0; i < videoDetails.subtitles?.length; i++) {
            if (seconds > parseFloat(videoDetails.subtitles[i].start) + parseFloat(videoDetails.subtitles[i].dur)) {
                runningSubtitles.current.push(videoDetails.subtitles[i].text);
            } else {
                break;
            }
        }
        if (roundedSeconds >= pauseTimeRef.current) {
            pauseTimeRef.current += config.questionDelay;
            setState(states.PAUSED);
            getQuestion();
        }

    }, [seconds, config, videoDetails, sourceLanguage, targetLanguage, runningSubtitles]);

    useEffect(() => {
        console.log(videoDetails);
    }, [videoDetails]);


    return (
        <div className="pt-24 space-y-4">

            <div className="w-full flex justify-center items-center">
                <ReactPlayer
                    className="react-player"
                    url={videoUrl}
                    controls={false}
                    onProgress={(s) => setSeconds(s.playedSeconds)}
                    playing={state === states.PLAYING}
                />
            </div>
            <div className="flex justify-around border border-gray-200 rounded-lg p-2 shadow w-1/2 mx-auto">
                <div className="text-green-600">Correct: {statistic.numCorrect}</div>
                <div className="text-red-600">Incorrect: {statistic.numIncorrect}</div>
                <div className="text-gray-600">Skipped: {statistic.numSkipped}</div>
            </div>
            <div
                className={`w-1/2 mx-auto ${state === states.PLAYING ? 'invisible' : 'visible'}`}>
                <GeneratedQuestion {...{generation, statistic, setStatistic, setState}}/>
            </div>
                
        </div>
    );
    
    
};

const GeneratedQuestion = (props) => {
    const { generation, statistic, setStatistic, setState } = props;
    const { question, answers, correctAnswerIndex } = generation;
    const { numCorrect, numIncorrect, numSkipped } = statistic;

    const [selectedAnswer, setSelectedAnswer] = useState(-1);
    const [submitted, setSubmitted] = useState(false);

    const handleAnswer = (index) => {
        if (submitted) {
            return;
        }
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        if (selectedAnswer === correctAnswerIndex) {
            setStatistic({ ...statistic, numCorrect: numCorrect + 1 });
        } else {
            setStatistic({ ...statistic, numIncorrect: numIncorrect + 1 });
        }
    };

    const handleSkipOrDone = () => {
        if (!submitted) {
            // If not submitted, treat this as a skip
            setStatistic({ ...statistic, numSkipped: numSkipped + 1 });
        }
        setState(states.PLAYING);
        setSelectedAnswer(-1);
        setSubmitted(false);
    };

    const buttonStyle = (index) => {
        if (submitted) {
            if (index === correctAnswerIndex) {
                return 'bg-green-500 hover:bg-green-600 text-white';
            } else if (index === selectedAnswer) {
                return 'bg-red-500 hover:bg-red-600 text-white';
            } else {
                return 'bg-gray-200 text-gray-600';
            }
        } else if (index === selectedAnswer) {
            return 'bg-indigo-700 hover:bg-indigo-800 text-white';
        }
        return 'bg-indigo-400 hover:bg-indigo-600 text-white';
    };

    return (
        <div className='flex flex-col justify-center items-center w-full h-96 bg-gray-50 rounded-lg shadow-lg p-6 space-y-4'>
            <div className='text-2xl font-bold text-gray-800 mb-4'>{question}</div>
            {answers.map((answer, index) => (
                <button
                    key={index}
                    className={`btn ${buttonStyle(index)} font-bold py-2 px-4 rounded-lg transition-colors duration-150 ease-in-out transform hover:scale-105 ${submitted ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => handleAnswer(index)}
                    disabled={submitted}
                >
                    {answer}
                </button>
            ))}
            <div className='flex space-x-2'>
                <button
                    className={`btn transition-colors duration-150 ease-in-out font-bold py-2 px-4 rounded-lg ${submitted ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    onClick={handleSubmit}
                    disabled={submitted}
                >
                    Submit
                </button>
                <button
                    className={`btn transition-colors duration-150 ease-in-out font-bold py-2 px-4 rounded-lg ${submitted ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                    onClick={handleSkipOrDone}
                >
                    {submitted ? 'Done' : 'Skip'}
                </button>
            </div>
        </div>
    );    
}

export default VideoPlayer;