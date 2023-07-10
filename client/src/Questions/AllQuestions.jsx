import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Questions/AllQuestions.scss';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleDelete = async (questionId) => {
    try {
      // Add logic to check if the user is the owner of the question before allowing deletion
      await axios.delete(`/questions/${questionId}`);
      // Remove the deleted question from the state
      setQuestions(questions.filter((question) => question._id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="questions-page">
      <h2>All Questions</h2>
      {questions.map((question) => (
        <div key={question._id}>
          <h2>{question.username}</h2>
          <h3>{question.title}</h3>
          <p>{question.text}</p>
          <p>
            Created Date:{' '}
            {question.updatedDate ? question.updatedDate : question.createdDate}
          </p>
          {question.updatedDate && <p>Updated Date: {question.updatedDate}</p>}
          <p>Number of Answers: {question.answerCount}</p>
          {/* Display the delete button only if the user is the owner of the question */}
          {question.isOwner && (
            <button onClick={() => handleDelete(question._id)}>Delete</button>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default QuestionsPage;
