require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

// const invokeGeminiAi = require("./src/services/ai.service");

connectDB();


// invokeGeminiAi();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});