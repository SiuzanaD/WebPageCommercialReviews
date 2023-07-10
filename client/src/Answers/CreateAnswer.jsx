import React, { useState } from 'react';
import axios from 'axios';
import '../Answers/CreateAnswers.scss';

const CreateAnswerForm = ({ questionId }) => {
  const [answerText, setAnswerText] = useState('');

  const handleAnswerTextChange = (e) => {
    setAnswerText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/questions/${questionId}/answers`, {
        text: answerText,
      });

      setAnswerText('');
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  };

  return (
    <form className="create-answer-form" onSubmit={handleSubmit}>
      <textarea
        value={answerText}
        onChange={handleAnswerTextChange}
        placeholder="Your answer..."
      ></textarea>
      <button type="submit">Submit Answer</button>
    </form>
  );
};

export default CreateAnswerForm;
