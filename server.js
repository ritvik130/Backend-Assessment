const express = require('express');
const router = require('./router/routes');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
