import { useState } from 'react';
import { AiFillDislike, AiFillLike } from 'react-icons/ai';
import './Counter.scss';

const Counter = ({ answer }) => {
  const [likes, setLikes] = useState((answer.likedUsersIds || []).length);
  const [dislikes, setDislikes] = useState(
    (answer.dislikedUsersIds || []).length,
  );

  const likeAnswer = async (id, newCount) => {
    try {
      const response = await fetch(
        `http://localhost:3001/answers/${id}/count`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: newCount }),
        },
      );

      if (response.ok) {
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error('Error liking answer:', error);
    }
  };

  const dislikeAnswer = async (id, newCount) => {
    try {
      const response = await fetch(
        `http://localhost:3001/answers/${id}/count`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: newCount }),
        },
      );
      if (response.ok) {
        setDislikes(dislikes + 1);
      }
    } catch (error) {
      console.error('Error disliking answer:', error);
    }
  };

  return (
    <div className="counter">
      <button className="like" onClick={() => likeAnswer(answer._id)}>
        {likes}
        <AiFillLike />
      </button>

      <button className="dislike" onClick={() => dislikeAnswer(answer._id)}>
        {dislikes}
        <AiFillDislike />
      </button>
    </div>
  );
};

export default Counter;
