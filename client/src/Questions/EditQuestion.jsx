import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const QuestionPage = ({ match }) => {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedText, setEditedText] = useState('');
  const { questionId } = useParams();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/questions/${questionId}`,
        );
        setQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    const fetchAnswers = async (answersId) => {
      try {
        const response = await axios.get(
          `http://localhost:3001/questions/${answersId}/answers`,
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
      await axios.delete(
        `http://localhost:3001/questions/${match.params.id}/answers/${answerId}`,
      );
      setAnswers(answers.filter((answer) => answer._id !== answerId));
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  const handleLikeAnswer = async (answerId) => {
    try {
      await axios.post(
        `http://localhost:3001/${match.params.id}/answers/${answerId}/like`,
      );
    } catch (error) {
      console.error('Error liking answer:', error);
    }
  };

  const handleDislikeAnswer = async (answerId) => {
    try {
      await axios.post(
        `http://localhost:3001/${match.params.id}/answers/${answerId}/dislike`,
      );
    } catch (error) {
      console.error('Error disliking answer:', error);
    }
  };

  const handleEditQuestion = () => {
    setEditMode(true);
    setEditedTitle(question.title);
    setEditedText(question.text);
  };

  const handleSaveQuestion = async () => {
    try {
      await axios.put(`http://localhost:3001/questions/${match.params.id}`, {
        title: editedTitle,
        text: editedText,
      });
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        title: editedTitle,
        text: editedText,
      }));
      setEditMode(false);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  return (
    <div className="question-container ">
      {question && (
        <div>
          {editMode ? (
            <>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              ></textarea>
              <button onClick={handleSaveQuestion}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              <h2>{question.title}</h2>
              <p>{question.text}</p>
              <p>Username: {question.username}</p>
              <p>
                Created Date:{' '}
                {question.updatedDate
                  ? question.updatedDate
                  : question.createdDate}
              </p>
              <button onClick={handleEditQuestion}>Edit</button>
            </>
          )}
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
