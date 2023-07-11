import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiFillHome, AiFillDelete, AiFillEdit } from 'react-icons/ai';
import axios from 'axios';
import '../Questions/AllQuestions.scss';
import CreateAnswerForm from '../Answers/CreateAnswer';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  // const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`http://localhost:3001/question/${questionId}`);
      setQuestions(questions.filter((question) => question._id !== questionId));
      navigate('/questions');
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="questions-page">
      <Link to="/" className="home-button">
        <AiFillHome />
      </Link>
      <h2>All Questions</h2>
      {questions.map((question) => (
        <div key={question._id}>
          <Link
            className="delete-button"
            onClick={() => handleDelete(question._id)}
          >
            <AiFillDelete />
          </Link>

          <Link to={`/question/${question._id}`} className="question-link">
            <h3>{question.title}</h3>
          </Link>
          <p>{question.text}</p>
          <p>
            Created Date:{' '}
            {question.updatedDate ? question.updatedDate : question.createdDate}
          </p>
          {question.updatedDate && <p>Updated Date: {question.updatedDate}</p>}
          <p>Number of Answers: {question.answerCount}</p>

          <Link className="edit-button" to={`/questions`}>
            <AiFillEdit />
          </Link>
          <hr />
          <CreateAnswerForm></CreateAnswerForm>
        </div>
      ))}
    </div>
  );
};

export default QuestionsPage;
