import { useParams, Link, generatePath, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { COMMENTS_ROUTE } from '../../routes/const';
import { RiQuestionnaireFill } from 'react-icons/ri';
import { AiFillDelete } from 'react-icons/ai';
import Button from '../../components/Button/Button';
import { QUESTIONS_ROUTE } from '../../routes/const';
import { NEW_QUESTION_ROUTE } from '../../routes/const';
import './Questions.scss';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [sort, setSort] = useState('asc');
  const [filter, setFilter] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleFilter = (option) => {
    if (filter === option) {
      setFilter('');
    } else {
      setFilter(option);
    }
  };

  const handleSort = (option) => {
    if (sort === option) {
      setSort(`-${option}`);
    } else {
      setSort(option);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/questions/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setQuestions(questions.filter((question) => question._id !== id));
        navigate(QUESTIONS_ROUTE);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  useEffect(() => {
    fetch(
      `http://localhost:3001/questions?sort=${sort}${
        filter ? `&filter=${filter}` : ''
      }`,
    )
      .then((resp) => resp.json())
      .then((response) => {
        setQuestions(response);
      });
  }, [sort, filter]);

  return (
    <div className="questions">
      <div className="container">
        <h1>Questions</h1>
        <Link className="addquestion" to={NEW_QUESTION_ROUTE}>
          <RiQuestionnaireFill />
          Add Question
        </Link>

        <div>
          <div className="sortContainer">
            <Button
              className="sort-button"
              onClick={() => handleSort('answerCount')}
            >
              Sort by Answers
            </Button>
            <Button className="sort-button" onClick={() => handleSort('date')}>
              Sort by Date
            </Button>
          </div>
          <div className="filterContainer">
            <Button
              className="sort-button"
              onClick={() => handleFilter('unanswered')}
            >
              {filter === 'unanswered' ? 'Show All' : 'Unanswered'}
            </Button>
          </div>
        </div>

        {questions.map((question) => (
          <div className="mapContainer" key={question._id}>
            <Link
              className="delete-button"
              onClick={() => handleDelete(question._id)}
            >
              <AiFillDelete />
            </Link>
            <Link to={generatePath(COMMENTS_ROUTE, { id: question._id })}>
              <h2> {question.title}</h2>
            </Link>
            <p>{question.question}</p>
            <div className="info">
              {question.updated ? (
                <span>Updated: {new Date(question.date).toLocaleString()}</span>
              ) : (
                <span>Date: {new Date(question.date).toLocaleString()}</span>
              )}
              <span> Comments: {question.answers.length}</span>{' '}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Questions;
