import React, { useState } from 'react';
import axios from 'axios';
import '../Answers/CreateAnswer.scss';

const CreateAnswerForm = () => {
  const [answerText, setAnswerText] = useState('');
  const [{ questionId }] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:3001/question/${questionId}/answers`,

        {
          text: answerText,
        },
      );
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  };

  return (
    <form className="create-answer-form" onSubmit={handleSubmit}>
      <textarea
        id="content"
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        placeholder="Your answer..."
      ></textarea>
      <button type="submit">Submit Answer</button>
    </form>
  );
};

export default CreateAnswerForm;
