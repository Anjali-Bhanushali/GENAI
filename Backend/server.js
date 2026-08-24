require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
 
const PORT = process.env.PORT || 3000;
// const invokeGeminiAi = require("./src/services/ai.service");

connectDB();


// invokeGeminiAi();


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});