import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../context/UserContext';
import Button from '../Button/Button';
import Reply from '../Reply/Reply';
import Counter from '../Counter/Counter';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import './Answer.scss';

const Answer = ({ id, question }) => {
  const { user } = useContext(UserContext);
  const [isCommentEditing, setIsCommentEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);

  const handleAnswerEditSubmit = async (answerID) => {
    try {
      const response = await fetch(
        `http://localhost:3001/answers/${answerID}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: editedAnswer }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setIsCommentEditing(false);
        window.location.reload();
      } else {
        console.error('Error editing question:', response.status);
      }
    } catch (error) {
      console.error('Error editing question:', error);
    }
  };

  const handleCommentDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/answers/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Question successfully deleted!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Deleting error:', error);
    }
  };

  const handleAnswerInputChange = (e) => {
    setEditedAnswer(e.target.value);
  };

  const handleCommentEdit = (ans, id) => {
    setEditedAnswer(ans);
    setIsCommentEditing(true);
    setSelectedAnswerId(id);
  };

  return (
    <div className="answer">
      <p>Answers:</p>
      {question.answers.length === 0 ? (
        <p>No answers..</p>
      ) : (
        <div>
          {question.answers.map((answer, index) => (
            <div
              className={
                isCommentEditing ? 'answerContainer' : 'answerContainer shadow'
              }
              key={answer._id}
            >
              <div>
                {isCommentEditing ? (
                  <div
                    className={
                      answer._id === selectedAnswerId
                        ? 'editComment displayFlex'
                        : 'editComment displayNone'
                    }
                    key={answer._id}
                  >
                    <textarea
                      type="text"
                      value={editedAnswer}
                      onChange={handleAnswerInputChange}
                    />

                    <Button
                      className="save"
                      onClick={() => handleAnswerEditSubmit(answer._id)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="ansContainer">
                      <h4>{answer.answer}</h4>
                    </div>
                    <div className="info">
                      {answer.updated ? (
                        <span>
                          Updated: {new Date(answer.created).toLocaleString()}
                        </span>
                      ) : (
                        <span>
                          Date: {new Date(answer.created).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
                <Counter answer={answer} />

                {user && answer.userId === user._id && !isCommentEditing && (
                  <div className="btnContainer">
                    <Button
                      onClick={() =>
                        handleCommentEdit(answer.answer, answer._id)
                      }
                    >
                      <AiFillEdit />
                    </Button>
                    <Button
                      color={'error'}
                      onClick={() => handleCommentDelete(answer._id)}
                    >
                      <AiFillDelete />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user && <Reply id={id} />}
    </div>
  );
};

export default Answer;

Answer.protoTypes = {
  id: PropTypes.string,
  question: PropTypes.object,
};
