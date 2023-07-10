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

// Parodo visus vartotojus
app.get('/users', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Users')
      .find()
      .sort({ username: 1 })
      // Rūšiuoti naudotojų vardus didėjančia tvarka (1)
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

// +++Parodo visus klausimus vartotoju (Rikiuoja ir duoda galimybę filtravimu )
app.get('/questions', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Questions')
      .aggregate([
        {
          $lookup: {
            from: 'Answers',
            localField: '_id',
            foreignField: 'questionId',
            as: 'answers',
          },
        },
        {
          // Kokia informacija parodys rezultate
          $project: {
            _id: 1,
            username: 1,
            createdDate: 1,
            title: 1,
            questionId: 1,
            answerCount: {
              $size: {
                $ifNull: ['$answers', [{ message: 'No answers available' }]],
              },
            },
          },
        },
        {
          $match: {
            createdDate: { $lte: new Date() },
            // Filtruoja pagal dat1
            answerCount: { $gte: 0 },
            // Filtruoja klausimus su bet kokiu atsakymų skaičiumi
          },
        },
        {
          $sort: {
            createdDate: req.query.sortBy === 'date' ? -1 : 1,
            // rikiuoja pagal datą
            answerCount: req.query.sortBy === 'answers' ? -1 : 1,
            // rikiuoja pagal atsakymus
          },
        },
      ])
      .toArray();
    await con.close();
    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// +++ Parodo klausimo atsakymus
app.get('/question/:questionId/answers', async (req, res) => {
  const { questionId } = req.params;

  try {
    const con = await client.connect();

    const questions = await con
      .db(dbName)
      .collection('Questions')
      .find()
      .toArray();

    const answers = await con
      .db(dbName)
      .collection('Answers')
      .find({ questionId: { $in: questionId } })
      .toArray();

    await con.close();

    const data = {
      questions,
      answers,
    };

    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// +++ Prideti nauja vartotoja
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
    const createdUser = data.ops[0];
    // Prieiga prie sukurto pirmo vartotojo ops masyve
    res.send({
      message: 'User registered successfully',
      user: createdUser,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// +++ Prisijungimas ir login duomenu patikrinimas
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

// +++ Prideta klausima i musus duombaze (gali tik registruoti nariai)
app.post('/question', async (req, res) => {
  const { username, title, text } = req.body;
  const userId = req?.session?.userId;
  // ? if the properties in the chain is null or undefined, return undefined

  // Tikrina ar vartotojas prisijunges
  if (!userId) {
    return res
      .status(401)
      .send('You must be a registered user to add a question');
  }
  try {
    const currentDate = new Date();
    // get the current date and time
    const con = await client.connect();
    const data = await con
      .db(dbName)
      .collection('Questions')
      .insertOne({
        username,
        createdDate: currentDate.toISOString(),
        updatedDate: currentDate.toISOString(),
        //  Convert the date to an ISO string format
        title,
        text,
        answers: 0,
        userId: new ObjectId(userId),
        questionId: new ObjectId(req.params),
      });
    await con.close();
    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// ++ Prideti atsakymą i musus duombaze (gali tik registruoti nariai)
app.post('/questions/:questionId/answers', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text } = req.body;
    const { userId } = req.session.userId;
    const con = await client.connect();
    const currentDate = new Date();

    // Tikrina ar vartotojas prisijunges
    if (!userId) {
      return res
        .status(401)
        .send('You must be a registered user to add a answer');
    }
    // Pridėti atsakymą
    const data = await con.db(dbName).collection('Answers').insertOne({
      text,
      questionId,
      userId,
      createdDate: currentDate.toISOString(),
      updatedDate: currentDate.toISOString(),
      likes: [],
      dislikes: [],
    });

    // Koreguoja klausimo atsakymo skaičių
    await con
      .db(dbName)
      .collection('Questions')
      .updateOne(
        { _id: new ObjectId(questionId) },
        { $inc: { answerCount: +1 } },
        // $inc butent padidina arba sumazina skaitinio lauko reiksme dokumente
      );
    await con.close();

    return res.send(data.ops[0]);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// ++ Prideta like prie atsakymo (gali tik registruoti nariai)
app.post('/:questionId/answers/:answerId/like', async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { userId } = req.session.userId;

    const con = await client.connect();
    // Tikrina ar vartotojas prisijunges
    if (!userId) {
      return res
        .status(401)
        .send('You must be a registered user to add a like');
    }
    // Tikrina ar toks atsakymas yra
    const answer = await con
      .db(dbName)
      .collection('Answers')
      .findOne({ _id: new ObjectId(answerId), questionId });

    if (!answer) {
      return res.status(404).send('Answer not found');
    }

    // Prideda vartotoją prie like masyvo
    const updatedAnswer = await con
      .db(dbName)
      .collection('Answers')
      .findOneAndUpdate(
        { _id: new ObjectId(answerId), questionId },
        { $addToSet: { likes: userId }, $pull: { dislikes: userId } },
        { returnOriginal: false },
      );

    await con.close();

    return res.send(updatedAnswer.value);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// ++ Prideta dislike prie atsakymo (gali tik registruoti nariai)
app.post('/:questionId/answers/:answerId/dislike', async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { userId } = req.session.userId;

    const con = await client.connect();

    // Tikrina ar vartotojas prisijunges
    if (!userId) {
      return res
        .status(401)
        .send('You must be a registered user to add a dislike');
    }
    // Tikrina ar toks atsakymas yra
    const answer = await con
      .db(dbName)
      .collection('Answers')
      .findOne({ _id: new ObjectId(answerId), questionId });

    if (!answer) {
      return res.status(404).send('Answer not found');
    }

    // Prideda vartotoją prie dislike masyvo
    const updatedAnswer = await con
      .db(dbName)
      .collection('Answers')
      .findOneAndUpdate(
        { _id: new ObjectId(answerId), questionId },
        { $addToSet: { dislikes: userId }, $pull: { likes: userId } },
        { returnOriginal: false },
      );

    await con.close();

    return res.send(updatedAnswer.value);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// ++++ Istrina klausima is duombazes (gali tik pats klausimo savininkas, prisijunges)
// eslint-disable-next-line consistent-return
app.delete('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userId } = req.body.userId;
    const con = await client.connect();
    const question = await con
      .db(dbName)
      .collection('Questions')
      .findOne({ _id: new ObjectId(questionId) });

    // tikrina ar yra toks klausimas
    if (!question) {
      return res.status(404).send('Post not found');
    }
    // tikrina ar vartotojas yra tas pats kas sukure klausima
    if (question.userId !== userId) {
      return res
        .status(401)
        .send('You are not authorized to delete this question');
    }

    const data = await con
      .db(dbName)
      .collection('Questions')
      .deleteOne({ _id: new ObjectId(questionId) });

    if (data.deletedCount === 1) {
      await con.close();
      return res.send('Question deleted successfully');
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

// ++  Koreguoja klausimą (tik registruoti nariai ir klausimo savininkas, prisijunges )
// eslint-disable-next-line consistent-return
app.patch('/questions/:questionId', async (req, res) => {
  try {
    const { username, title, text } = req.body;
    const { userId } = req.session.userId;
    const { questionId } = req.params;
    const currentDate = new Date();

    // Tikrina ar vartotojas prisijunges
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
            updatedDate: currentDate.toISOString(),
          },
        },
      );

    await con.close();

    if (data.modifiedCount === 1) {
      res.send('Question updated successfully');
    } else {
      return res
        .status(404)
        .send('Question not found or you are not authorized to update it');
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

//  ++ Ištrina atsakymą (gali,tik atsakymo savininkas)
app.delete('/questions/:questionId/answers/:answerId', async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { userId } = req.session.userId;
    const con = await client.connect();

    // Tikrina ar atsakymas yra to vartotojo, kuris parašė
    const answer = await con
      .db(dbName)
      .collection('Answers')
      .findOne({ _id: new ObjectId(answerId), questionId, userId });

    if (!answer) {
      return res
        .status(404)
        .send('Answer not found or you are not authorized to delete it');
    }

    // Ištrinti atsakymą
    await con
      .db(dbName)
      .collection('Answers')
      .deleteOne({ _id: new ObjectId(answerId) });

    // Koreguoja klausimo atsakymo skaičių
    await con
      .db(dbName)
      .collection('Questions')
      .updateOne(
        { _id: new ObjectId(questionId) },
        { $inc: { answerCount: -1 } },
      );

    await con.close();

    return res.send('Answer deleted successfully');
  } catch (error) {
    return res.status(500).send(error);
  }
});

// ++ Koreguoja atsakymą (gali,tik atsakymo savininkas)
app.patch('/questions/:questionId/answer/:answerId', async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { userId } = req.session.userId;
    const { text } = req.body;
    const con = await client.connect();
    const currentDate = new Date();
    // Tikrina ar vartotojas prisijunges
    if (!userId) {
      return res
        .status(401)
        .send('You must be a registered user to update answer');
    }

    // Tikrina ar atsakymas yra to vartotojo, kuris parašė
    const answer = await con
      .db(dbName)
      .collection('Answers')
      .findOne({ _id: new ObjectId(answerId), questionId, userId });

    if (!answer) {
      return res
        .status(404)
        .send('Answer not found or you are not authorized to update it');
    }

    // koreguoja atsakymą
    await con
      .db(dbName)
      .collection('Answers')
      .updateOne(
        { _id: new ObjectId(answerId) },
        { $set: { text, updatedDate: currentDate.toISOString() } },
      );

    await con.close();

    return res.send('Answer updated successfully');
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on the ${port} port`);
});
