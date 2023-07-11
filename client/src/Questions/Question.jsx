import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Questions/Question.scss';
import CreateAnswerForm from '../Answers/CreateAnswer';

const QuestionPage = ({ match }) => {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/questions/${question._id}`,
        );
        setQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    const fetchAnswers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/questions/${question._id}/answers`,
        );
        setAnswers(response.data);
      } catch (error) {
        console.error('Error fetching answers:', error);
      }
    };

    fetchQuestion();
    fetchAnswers();
  });

  const handleDeleteAnswer = async (answerId) => {
    try {
      await axios.delete(
        `http://localhost:3001/questions/${question._id}/answers/${answerId}`,
      );
      setAnswers(answers.filter((answer) => answer._id !== answerId));
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  const handleLikeAnswer = async (answerId) => {
    try {
      await axios.post(
        `http://localhost:3001/${question._id}/answers/${answerId}/like`,
      );
    } catch (error) {
      console.error('Error liking answer:', error);
    }
  };

  const handleDislikeAnswer = async (answerId) => {
    try {
      await axios.post(
        `http://localhost:3001/${question._id}/answers/${answerId}/dislike`,
      );
    } catch (error) {
      console.error('Error disliking answer:', error);
    }
  };

  const handleEditAnswer = async (answerId, newText) => {
    try {
      await axios.put(
        `http://localhost:3001/questions/${question._id}/answers/${answerId}`,
        {
          text: newText,
        },
      );
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer._id === answerId ? { ...answer, text: newText } : answer,
        ),
      );
    } catch (error) {
      console.error('Error editing answer:', error);
    }
  };

  return (
    <div className="question-page">
      {question && (
        <div>
          <h2>{question.title}</h2>
          <p>{question.text}</p>
          <p>Username: {question.username}</p>
          <p>
            Created Date:{' '}
            {question.updatedDate ? question.updatedDate : question.createdDate}
          </p>
        </div>
      )}

      <h3>Answers ({answers.length})</h3>
      {answers.map((answer) => (
        <div key={answer._id}>
          <p>{answer.text}</p>
          <p>Username: {answer.username}</p>
          <p>
            Created Date:{' '}
            {answer.updatedDate ? answer.updatedDate : answer.createdDate}
          </p>

          {/* Display the delete button only for the owner of the answer */}
          {answer.isOwner && (
            <>
              <button onClick={() => handleDeleteAnswer(answer._id)}>
                Delete
              </button>
              <button
                onClick={() => {
                  const newText = prompt('Enter the new text:');
                  if (newText) {
                    handleEditAnswer(answer._id, newText);
                  }
                }}
              >
                Edit
              </button>
            </>
          )}

          <div>
            <button onClick={() => handleLikeAnswer(answer._id)}>Like</button>
            <button onClick={() => handleDislikeAnswer(answer._id)}>
              Dislike
            </button>
          </div>

          <hr />
        </div>
      ))}

      <Link to={`http://localhost:3001/questions/${match.params.id}/answers`}>
        Add Answer
      </Link>
      {/* Render the answer creation form */}
      <CreateAnswerForm questionId={match.params.id} />
    </div>
  );
};

export default QuestionPage;
