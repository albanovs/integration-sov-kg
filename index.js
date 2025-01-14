import express from 'express';
import { connect } from './db.js';
import cors from 'cors';
import bodyParser from 'body-parser'
import work_visa from './src/router/work_visa/work_visa.mjs';


const app = express();
app.use(cors());
const PORT = '5000';
connect();
app.use(express.json());
app.use(bodyParser.json());

app.use('/', work_visa);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});