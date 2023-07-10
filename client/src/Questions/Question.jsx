import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Questions/Question.scss';

const QuestionPage = ({ match }) => {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/questions/${match.params.id}`);
        setQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    const fetchAnswers = async () => {
      try {
        const response = await axios.get(
          `/questions/${match.params.id}/answers`,
        );
        setAnswers(response.data);
      } catch (error) {
        console.error('Error fetching answers:', error);
      }
    };

    fetchQuestion();
    fetchAnswers();
  }, [match.params.id]);

  const handleDeleteAnswer = async (answerId) => {
    try {
      await axios.delete(`/questions/${match.params.id}/answers/${answerId}`);
      setAnswers(answers.filter((answer) => answer._id !== answerId));
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  const handleLikeAnswer = async (answerId) => {
    try {
      await axios.post(`/${match.params.id}/answers/${answerId}/like`);
    } catch (error) {
      console.error('Error liking answer:', error);
    }
  };

  const handleDislikeAnswer = async (answerId) => {
    try {
      await axios.post(`/${match.params.id}/answers/${answerId}/dislike`);
    } catch (error) {
      console.error('Error disliking answer:', error);
    }
  };

  return (
    <div>
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
            <button onClick={() => handleDeleteAnswer(answer._id)}>
              Delete
            </button>
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
    </div>
  );
};

export default QuestionPage;
