const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

const port = process.env.PORT || 8080;
const URI = process.env.DB_CONNECTION_STRING;
const dbName = process.env.DB_NAME;

const client = new MongoClient(URI);

const app = express();
app.use(express.json()); // aplikacija moka apdoroti JSON formatu ateinancius requestus
app.use(cors());

// Parodo visus vartotojus (rikiuoja abeceles tvarka pagal username)
app.get('/', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Users')
      .find()
      .sort({ username: 1 })
      // Sort usernames in ascending order (1)
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Parodo visus klausimus vartotoju (Rikiuoja pagal datą ir duoda galimybę filtravimu )
app.get('/questions', async (req, res) => {
  try {
    const { date, username, title } = req.query;
    const filter = {};
    if (date) {
      filter.createdDate = { $gte: new Date(date) };
      // Filter by date greater than or equal to the provided date
    }
    if (username) {
      filter.username = username; // Filter by username
    }
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
      // Filter by title using case-insensitive regex matching
    }
    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Questions')
      .find(filter)
      .sort({ createdDate: -1 })
      .toArray(); // išsitraukiame duomenis iš duomenų bazęs
    await con.close(); // uždarom prisijungimą prie duomenų bazės
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Prideti nauja vartotoja
app.post('/register', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db(dbName).collection('Users').insertOne({
      password: req.body.password,
      email: req.body.email,
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,
    });
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// prisijungimas ir login duomenu patikrinimas
app.post('/login', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const con = await client.connect();
    const user = await con
      .db(dbName)
      .collection('Users')
      .findOne({ email, password });
    await con.close();
    if (user) {
      const passwordMatch = password === user.password;
      if (passwordMatch) {
        res.send(`Successful login: Hello, ${username}!`);
      } else {
        res.status(401).send('User email or password is incorrect.');
      }
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Prideta klausima i musus duombaze (gali tik registruoti nariai
app.post('/question', async (req, res) => {
  try {
    const { username, title, text, userId } = req.body;
    // Check if the userId is present

    if (!userId) {
      return res
        .status(401)
        .send('You must be a registered user to add a question');
    }
    const currentDate = new Date();
    // get the current date and time
    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Questions')
      .insertOne({
        username,
        createdDate: currentDate.toISOString(),
        //  Convert the date to an ISO string format
        title,
        text,
        userId: new ObjectId(userId),
        questionId: new ObjectId(req.params),
      });
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Istrina klausima is duombazes (gali tik pats klausimo savininkas)
app.delete('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userId } = req.body.userId;

    const con = await client.connect();
    const question = await con
      .db(dbName)
      .collection('Questions')
      .findOne({ _id: new ObjectId(questionId) });

    if (!question) {
      await con.close();
      return res.status(404).send('Post not found');
    }

    if (question.userId !== userId) {
      await con.close();
      return res.status(401).send('You are not authorized to delete this post');
    }

    const data = await con
      .db(dbName)
      .collection('Questions')
      .deleteOne({ _id: new ObjectId(questionId) });

    await con.close();

    if (data.deletedCount === 1) {
      res.send('Post deleted successfully');
    } else {
      res.status(404).send('Post not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Koreguoja klausimą (tik registruoti nariai ir klausimo savininkas)
app.put('/question/:questionId', async (req, res) => {
  try {
    const { username, title, text, userId } = req.body;
    const { questionId } = req.params;

    // Check if the userId is present
    if (!userId) {
      return res
        .status(401)
        .send('You must be a registered user to update a question');
    }

    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Questions')
      .updateOne(
        { _id: new ObjectId(questionId), userId: new ObjectId(userId) },
        {
          $set: {
            username,
            title,
            text,
          },
        },
      );

    await con.close();

    if (data.modifiedCount === 1) {
      res.send('Question updated successfully');
    } else {
      res
        .status(404)
        .send('Question not found or you are not authorized to update it');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on the ${port} port`);
});
