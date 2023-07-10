import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import '../Questions/AskQuestion.scss';

const AddQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [createdQuestion, setCreatedQuestion] = useState(null);
  const history = useHistory();

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/question', {
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
        <div>
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
            <div>
              <p>Question created successfully!</p>
              <p>
                View the question:{' '}
                <Link to={`/questions/${createdQuestion._id}`}>
                  Question Link
                </Link>
              </p>
            </div>
          )}
        </div>
      );
    } else {
      // User is not logged in, redirect to the registration page
      history.push('/register');
      return null;
    }
  };

  return <div>{handleAskQuestion()}</div>;
};

export default AddQuestionPage;
