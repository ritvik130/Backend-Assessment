const express = require('express');
const cron = require('node-cron');
const twilio = require('twilio');
const router = require('./router/routes');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

app.use('/', router);

// Cron Jobs

// 1. Cron Logic for Changing Task Priority
cron.schedule('0 0 * * *', () => {
  try {
    // Implementation details for changing task priority based on due_date
    // ...
  } catch (error) {
    console.error(error);
  }
});

// 2. Cron Logic for Voice Calling using Twilio
cron.schedule('0 12 * * *', () => {
  try {
    // Implementation details for voice calling using Twilio
    // ...
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
