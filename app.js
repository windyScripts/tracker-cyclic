
const fs = require('fs');
const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');

const app = express();

const mongoose = require('mongoose');
const morgan = require('morgan');

require('dotenv').config();

const expensesRoutes = require('./routes/expenses');
const passwordRoutes = require('./routes/password');
const purchaseRoutes = require('./routes/purchase');
const authRoutes = require('./routes/user');

const environment = process.env.NODE_ENV;
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
  { flags: 'a' },
);

// allows authorization header from front-end
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  next();
});

if (environment === 'production') {
  const helmet = require('helmet');
  app.use(helmet());

  const compression = require('compression');
  app.use(compression());
} else if (environment === 'development') {
  const cors = require('cors');
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
  }));
}

app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use(expensesRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/password', passwordRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.url));
});

async function connectDB() {
  try{
  await mongoose.connect(process.env.DB_STRING);
  console.log('Database connected. :)');
  }
  catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectDB().then(()=>{
  app.listen(process.env.PORT || 3000);
  console.log("listening for requests!")
});
