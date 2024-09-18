import express from 'express';
import bodyParser from 'body-parser';
import messageController from "./controllers/messageController.js";

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.post('/', (req, res) => {
    messageController.getMessage(req, res);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});