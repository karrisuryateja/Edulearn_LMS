const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});