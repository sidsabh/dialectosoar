import React from 'react';
import ReactPlayer from 'react-player/youtube';
import { useState, useEffect, useRef } from 'react';
//import necessary stuff for firestore:
import { initializeApp } from 'firebase/app';
import { addDoc, collection } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAXP9shKP9Y7i2D-MBUoy-ZorzAhlZutAY",
    authDomain: "rowdyhacks-661ac.firebaseapp.com",
    projectId: "rowdyhacks-661ac",
    storageBucket: "rowdyhacks-661ac.appspot.com",
    messagingSenderId: "1065696678547",
    appId: "1:1065696678547:web:b04a49be56f5765d937366",
    measurementId: "G-V4GSNS6EH7"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const codeToFull = {
    en: 'English',
    es: 'Spanish',
    hi: 'Hindi',
    zh: 'Mandarin Chinese',
    fr: 'French',
    ar: 'Arabic',
    bn: 'Bengali',
    ru: 'Russian',
    pt: 'Portuguese',
    id: 'Indonesian',
    ur: 'Urdu',
    de: 'German',
    ja: 'Japanese',
    sw: 'Swahili',
    it: 'Italian',
    pa: 'Punjabi',
};


// const
const url = 'http://localho.st:3001';
const states = {
    PLAYING: 'PLAYING',
    MCQ: 'MCQ',
    WRITING: 'WRITING',
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
    secondsPerQuestion: 15,
    charsPerQuestion: 200,
    percentMCQ: 0.5
}

const VocabData = {
    data: []
}



const VideoPlayer = ({ videoUrl, sourceLanguage, targetLanguage }) => {

    // parent
    const [videoDetails, setVideoDetails] = useState({});
    const [seconds, setSeconds] = useState(0);

    // state
    const [state, setState] = useState(states.PLAYING);
    const [duration, setDuration] = useState(Infinity);

    // question
    const [generation, setGeneration] = useState(generated);
    
    // statistics
    const [statistic, setStatistic] = useState(statistics);

    // user
    const [config, setConfig] = useState(configuration);

    const pauseTimeRef = useRef(config.secondsPerQuestion);

    let currSubtitles = useRef("");
    let startTime = useRef(0);
    let allSubtitles = useRef("");


    // fetch subtitles
    useEffect(() => {
        const fetchSubtitles = async () => {
            try {
                const response = await fetch(
                    // `${url}/video-data?videoID=${videoUrl.split('v=')[1]}&lang=${sourceLanguage}`
                    `${url}/video-data?videoID=${videoUrl.split('v=')[1]}`
                    );
                const data = await response.json();
                setVideoDetails(data.videoDetails);
                allSubtitles.current = data.videoDetails.subtitles?.map(sub => sub.text).join(' ');
            } catch (error) {
                console.error('ERROR:', error);
            }
        }
        fetchSubtitles();
    }, [sourceLanguage, videoUrl]);

    useEffect(() => {
        if(state === states.STOPPED) {
            const getSet = async () => {
                try {
                    const response = await fetch(`${url}/extract-subtitles`, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: videoDetails.title,
                            description: videoDetails.description,
                            allSubtitles: allSubtitles.current,
                            targetLanguage: codeToFull[targetLanguage],
                            sourceLanguage: codeToFull[sourceLanguage],
                        }),
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    VocabData.data.push(data);
                    addDoc(collection(db, "vocab"), data);
                } catch (error) {
                    console.error('ERROR:', error);
                }

            }
            getSet();
        } else if (state === states.MCQ) {
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
                            // allSubtitles: allSubtitles.current,
                            currSubtitles: currSubtitles.current,
                            targetLanguage: codeToFull[targetLanguage],
                            sourceLanguage: codeToFull[sourceLanguage],
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
            getQuestion();
            currSubtitles.current = "";
        }
    }, [state, currSubtitles, videoDetails, sourceLanguage, targetLanguage]);

    useEffect(() => {

        const roundedSeconds = Math.floor(seconds) - 1;

        if (roundedSeconds >= duration) {
            setState(states.STOPPED);
            return;
        }

        for (let i = 0; i < videoDetails.subtitles?.length; i++) {
            
            let dur = parseFloat(videoDetails.subtitles[i].dur);
            let start = parseFloat(videoDetails.subtitles[i].start);
            
            // add subtitles to currSubtitles for part in (startTime, roundedSeconds)
            if (start + dur < startTime.current) {
                continue;
            }

            if (start > roundedSeconds) {
                break;
            }

            if (start <= roundedSeconds && start + dur >= roundedSeconds) {
                currSubtitles.current += videoDetails.subtitles[i].text + " ";
            }
            
        }

        if (roundedSeconds >= pauseTimeRef.current && currSubtitles.current.length > 50) {
            pauseTimeRef.current = roundedSeconds + config.secondsPerQuestion;
            
            if (Math.random() < configuration.percentMCQ) {
                setState(states.MCQ);
            } else {
                setState(states.WRITING);
            }
            startTime.current = roundedSeconds;
        }

    }, [seconds, config, videoDetails, sourceLanguage, targetLanguage, currSubtitles]);

    return (
        <div className="pt-12 space-y-4">
            {(state !== states.STOPPED )
            ?
            <div>
            <div className="w-full flex justify-center items-center">
                <ReactPlayer
                        className="react-player"
                        url={videoUrl}
                        controls={true}
                        onProgress={(s) => setSeconds(s.playedSeconds)}
                        playing={state === states.PLAYING}
                        onEnded={() => setState(states.STOPPED)}
                        onDuration={(duration) => duration && setDuration(duration)}
                />
            </div>
            <div className="flex justify-around border mt-5 rounded-lg p-2 w-1/2 mx-auto " 
                style={{ background: localStorage.getItem('theme') === 'theme-dark' ? 'rgba(116, 117, 121, 1.0)' : 'rgba(141, 176, 87, 0.8)' }}>
                <div className="text-green-900">Correct: {statistic.numCorrect}</div>
                <div className="text-red-700">Incorrect: {statistic.numIncorrect}</div>
                <div className="text-blue-800">Skipped: {statistic.numSkipped}</div>
            </div>
            </div>
            :
            <div>
            <div className="flex justify-around border border-gray-200 rounded-lg p-2 shadow w-1/2 mx-auto"
                style={{ background: localStorage.getItem('theme') === 'theme-dark' ? 'rgba(116, 117, 121, 1.0)' : 'rgba(141, 176, 87, 0.8)' }}>
                <div className="text-green-600">Correct: {statistic.numCorrect}</div>
                <div className="text-red-600">Incorrect: {statistic.numIncorrect}</div>
                <div className="text-blue-600">Skipped: {statistic.numSkipped}</div>
            </div>
                <Dictionary className="mt-5"/>
            </div>

            }

            <div className={`w-1/2 mx-auto ${(state === states.MCQ || state === states.WRITING) ? 'visible' : 'invisible'}`}>
                {
                    state === states.MCQ ? 
                    <GeneratedQuestion {...{generation, statistic, setStatistic, setState, setGeneration}}/> :
                    state === states.WRITING ? 
                    <GeneratedWriting {...{generation, statistic, setStatistic, setState, setGeneration, targetLanguage, sourceLanguage, currSubtitles}}/> :
                    <div className="w-full h-96"></div>
                }
            </div>

                
        </div>
    );
    
    
};

const Dictionary = () => {
    return (
        <>
            <div className='flex flex-col justify-center text-center items-centerrounded-lg shadow-lg p-6 space-y-4 border border-gray-300 mt-5 w-1/2 mx-auto'
            style={{ background: localStorage.getItem('theme') === 'theme-dark' ? 'rgba(116, 117, 121, 1.0)' : 'rgba(141, 176, 87, 0.8)' }}>
                <div className='text-xl font-bold mb-4'
                style={{ color: localStorage.getItem('theme') === 'theme-dark' ? '#C0C0C0' : 'black' }}
                >
                    Vocabulary
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className='w-full' style={{ color: localStorage.getItem('theme') === 'theme-dark' ? '#C0C0C0' : 'black' }}>
                        <thead>
                            <tr>
                                <th className='border'>Word</th>
                                <th className='border '>Translation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VocabData.data.map((vocab, index) => (
                                    Object.keys(vocab).map((word, index) => (
                                        <tr key={index} className='border-b'>
                                            <td className='px-4 py-2'>{word}</td>
                                            <td className='px-4 py-2'>{vocab[word]}</td>
                                        </tr>
                                    ))
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};



const GeneratedWriting = (props) => {
    const { statistic, setStatistic, setState } = props;
    const { numCorrect, numIncorrect, numSkipped } = statistic;

    const { currSubtitles, targetLanguage, sourceLanguage } = props;

    const [submitted, setSubmitted] = useState(false);
    const [answer, setAnswer] = useState('');
    

    const handleAnswer = (event) => {
        setAnswer(event.target.value);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        const checkAnswer = async () => {
            try {
                const response = await fetch(`${url}/check-writing`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        currSubtitles: currSubtitles.current,
                        writtenSubtitles: answer,
                        targetLanguage: codeToFull[targetLanguage],
                        sourceLanguage: codeToFull[sourceLanguage],
                        
                      }),
                  });
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                const data = await response.json();
                return data.result === "PASS";
            } catch (error) {
                console.error('ERROR:', error);
            }
        }
        checkAnswer().then((r) => {
            if (r) {
                setStatistic({ ...statistic, numCorrect: numCorrect + 1 });
            } else {
                setStatistic({ ...statistic, numIncorrect: numIncorrect + 1 });
            }
        });
    };

    const handleSkipOrDone = () => {
        if (!submitted) {
            setStatistic({ ...statistic, numSkipped: numSkipped + 1 });
        }
        setState(states.PLAYING);
        setSubmitted(false);
    };

    return (
        <div className='flex flex-col justify-center text-center items-center w-full h-96 bg-gray-50 shadow-lg p-6 space-y-4  border border-gray-300 rounded-md'
        style={{ background: localStorage.getItem('theme') === 'theme-dark' ? 'rgba(116, 117, 121, 1.0)' : 'rgba(141, 176, 87, 0.8)' }}>
            <div className='text-xl font-bold text-gray-800 mb-4'>{`Type out your understanding of the last section in ${codeToFull[targetLanguage]} or transliterate/type it in ${codeToFull[sourceLanguage]}.`}</div>
            <textarea
                className='w-full h-32 p-2 border rounded-lg' 
                style={{ background: localStorage.getItem('theme') === 'theme-dark' ? 'rgba(116, 117, 121, 1.0)' : 'rgba(141, 176, 87, 0.8)' }}
                value={answer}
                onChange={handleAnswer}
                disabled={submitted}
            />
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
};



const GeneratedQuestion = (props) => {
    const { generation, statistic, setStatistic, setState, setGeneration } = props;
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
            setStatistic({ ...statistic, numSkipped: numSkipped + 1 });
        }
        setState(states.PLAYING);
        setSelectedAnswer(-1);
        setSubmitted(false);
        setGeneration(generated);
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
        <div className='flex flex-col justify-center items-center w-full h-96 rounded-lg shadow-lg p-6 space-y-4 text-center  border border-gray-300 rounded-md"'
        style={{ background: localStorage.getItem('theme') === 'theme-dark' ? 'rgba(116, 117, 121, 1.0)' : 'rgba(141, 176, 87, 0.8)' }}>
            <div className='text-xl font-bold text-gray-800 mb-4'>{question}</div>
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