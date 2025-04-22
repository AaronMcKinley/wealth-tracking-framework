const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.send('Server is running!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log('Press Ctrl+C to stop the server.'); // Helpful message
});