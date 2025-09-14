const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// member routes
const membersRouter = require('./routes/members');
app.use('/api/members', membersRouter);

// default
app.get('/', (req, res) => res.send('Member backend running'));

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error('DB connection error', err));


