import express from 'express';
import { connect } from './db.js';
import cors from 'cors';
import bodyParser from 'body-parser'
import work_visa from './src/router/work_visa/work_visa.mjs';
import LoginModel from './src/models/login.mjs';
import ArchaPointForm from './src/router/archa_point/archa_point_form.mjs';
import { bot } from './src/controllers/archa_point/bot_form.mjs';

const app = express();
app.use(cors());
const PORT = '5000';
connect();
app.use(express.json());
app.use(bodyParser.json());

bot.launch();

app.use('/', work_visa);
app.use('/', ArchaPointForm);
// app.use('/uploads', express.static('uploads'));
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const isUser = await LoginModel.findOne({ email, password });
        if (isUser) {
            res.status(200).json({ message: 'Вход выполнен успешно' });
        } else {
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (error) {

    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});