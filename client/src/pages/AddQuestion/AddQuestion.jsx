import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Button from '../../components/Button/Button';
import './AddQuestion.scss';

const AddQuestion = () => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const userId = user._id;

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/questions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, title, userId }),
      });

      if (response.ok) {
        setTitle('');
        setQuestion('');
        setError('');
        setSuccess(true);
      } else {
        throw new Error('An error occurred while submitting the question.');
      }
    } catch (err) {
      setError('An error occurred while submitting the question.');
    }
  };

  return (
    <div className="new">
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form">
          <div>
            <label>Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <label htmlFor="question">Question:</label>
          <textarea
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        <div className="success-message">
          {success && (
            <p>
              Question created successfully! View{' '}
              <Link to={`/`}>All questions</Link>
            </p>
          )}
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default AddQuestion;
