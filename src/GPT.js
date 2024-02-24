import React, { useState } from 'react';

const GPTComponent = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleGenerateClick = async () => {
    try {
      const response = await fetch('https://api.openai.com/v1/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: inputText,
          // Add any other parameters required by the API
        }),
      });

      const result = await response.json();
      setOutputText(result.data); // Assuming the API response has a 'data' field
    } catch (error) {
      console.error('Error fetching GPT API:', error);
    }
  };

  return (
    <div>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter your prompt"
      />
      <button onClick={handleGenerateClick}>Generate</button>
      <div>
        <strong>Output:</strong>
        <p>{outputText}</p>
      </div>
    </div>
  );
};

export default GPTComponent;