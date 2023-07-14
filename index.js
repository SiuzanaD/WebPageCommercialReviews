const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

const port = process.env.PORT || 8080;
const URI = process.env.DB_CONNECTION_STRING;
const dbName = process.env.DB_NAME;

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient(URI);

app.get('/users', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db(dbName).collection('Users').find().toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/register', async (req, res) => {
  try {
    // eslint-disable-next-line object-curly-newline
    const { username, password, passwordConfirmation } = req.body;

    const user = {
      username,
      password,
    };

    const con = await client.connect();

    if (!username || !password || !passwordConfirmation) {
      res.status(400).send({
        error: 'Username, password are required.',
      });
      return;
    }

    if (password !== passwordConfirmation) {
      res
        .status(400)
        .send({ error: 'Password and password confirmation do not match.' });
      return;
    }

    const existingUser = await con
      .db(dbName)
      .collection('Users')
      .findOne({ username });

    if (existingUser) {
      res.status(400).send({ error: 'Username already exists.' });
      return;
    }

    const data = await con.db(dbName).collection('Users').insertOne(user);
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    const con = await client.connect();
    const user = await con
      .db(dbName)
      .collection('Users')
      .findOne({ username: req.body.username });
    if (user && user.password === req.body.password) {
      res.status(200).json({
        message: 'Successfully connected!',
        loggedIn: true,
        user,
      });
    } else {
      res
        .status(401)
        .json({ message: 'Wrong password or username!', loggedIn: false });
    }
    await con.close();
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/questions', async (req, res) => {
  try {
    const { sort, filter, sortOrder } = req.query;

    const con = await client.connect();
    let pipeline = [
      {
        $lookup: {
          from: 'Answers',
          localField: '_id',
          foreignField: 'questionId',
          as: 'answers',
        },
      },
      {
        $addFields: {
          answerCount: { $size: '$answers' }, // Add a new field to hold the count of answers
        },
      },
    ];

    if (filter === 'answered') {
      pipeline = [
        ...pipeline,
        {
          $match: {
            answerCount: { $gt: 0 }, // Filter for questions with answers
          },
        },
      ];
    } else if (filter === 'unanswered') {
      pipeline = [
        ...pipeline,
        {
          $match: {
            answerCount: { $eq: 0 }, // Filter for questions without answers
          },
        },
      ];
    }

    if (sort === 'date') {
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      pipeline = [
        ...pipeline,
        {
          $sort: {
            date: sortDirection,
          },
        },
      ];
    } else if (sort === 'answerCount') {
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      pipeline = [
        ...pipeline,
        {
          $sort: {
            answerCount: sortDirection,
          },
        },
      ];
    }

    const data = await con
      .db(dbName)
      .collection('Questions')
      .aggregate(pipeline)
      .toArray();

    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const objectId = new ObjectId(id);

    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Questions')
      .aggregate([
        {
          $match: {
            _id: objectId,
          },
        },
        {
          $lookup: {
            from: 'Answers',
            localField: '_id',
            foreignField: 'questionId',
            as: 'answers',
          },
        },
        {
          $limit: 1,
        },
      ])
      .toArray();

    await con.close();
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/questions', async (req, res) => {
  try {
    const con = await client.connect();
    const { question, title, userId } = req.body;
    const userIdObject = new ObjectId(userId);
    const createdDate = new Date();

    const quest = {
      userId: userIdObject,
      title,
      question,
      date: createdDate,
      updated: false,
      answers: [],
    };

    const data = await con.db(dbName).collection('Questions').insertOne(quest);
    res.status(200).json(data);
    await con.close();
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/questions/:id', async (req, res) => {
  try {
    const con = await client.connect();

    const { id } = req.params;
    const userIdObject = new ObjectId(id);

    const data = await con
      .db(dbName)
      .collection('Questions')
      .updateOne(
        { _id: userIdObject },
        { $set: { question: req.body.question, updated: true } },
      );
    await con.close();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.delete('/questions/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const question = await con
      .db(dbName)
      .collection('Questions')
      .findOne({ _id: new ObjectId(id) });

    const data = await con
      .db(dbName)
      .collection('Questions')
      .deleteOne(question);
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/questions/:id/answers', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const answer = await con
      .db(dbName)
      .collection('Answers')
      .insertOne({
        answer: req.body.answer,
        count: 0,
        updated: false,
        created: new Date(),
        questionId: new ObjectId(id),
        userId: new ObjectId(req.body.userId),
      });
    res.status(200).json(answer);
    await con.close();
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/answers/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const data = await con
      .db(dbName)
      .collection('Answers')
      .deleteOne({ _id: new ObjectId(id) });
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/answers/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const data = await con
      .db(dbName)
      .collection('Answers')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { answer: req.body.answer, updated: true } },
      );
    await con.close();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/answers/:id/count', async (req, res) => {
  try {
    const con = await client.connect();
    const { id } = req.params;
    const data = await con
      .db(dbName)
      .collection('Answers')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { count: req.body.count } },
      );
    await con.close();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on the ${port}`);
});
