import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AiFillHome } from 'react-icons/ai';
import '../Questions/AskQuestion.scss';

function AddQuestionPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [createdQuestion, setCreatedQuestion] = useState(null);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/question', {
        title,
        text,
      });
      const createdQuestion = response.data;
      setCreatedQuestion(createdQuestion);
      setTitle('');
      setText('');
      setError('');
    } catch (error) {
      setError('Error submitting question');
    }
  };

  const handleAskQuestion = () => {
    // Check if user is logged in
    const isLoggedIn = true; // Replace with actual check for logged in user
    if (isLoggedIn) {
      // User is logged in, show the question form
      return (
        <div className="add-question-page">
          <Link to="/" className="home-button">
            <AiFillHome />
          </Link>
          <h2>Add Question</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <div>
              <label>Text:</label>
              <textarea
                id="text"
                value={text}
                onChange={handleTextChange}
              ></textarea>
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit">Submit</button>
          </form>
          {createdQuestion && (
            <div className="success-message">
              <p>Question created successfully!</p>
              <p>
                View <Link to={`/questions`}>All questions</Link>
              </p>
            </div>
          )}
        </div>
      );
    }
  };

  return <div>{handleAskQuestion()}</div>;
}

export default AddQuestionPage;
