require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT;

// Connect to MongoDB
connectDB();

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
