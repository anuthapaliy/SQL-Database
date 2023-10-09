// Import required modules
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Define routes and middleware here
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
