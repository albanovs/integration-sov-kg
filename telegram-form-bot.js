import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';

dotenv.config();

const app = express();
const PORT = '5000';
const BOT_TOKEN = '9089226489:AAHCb6OJfdFhbU4S-mO6ExQgNX3IzD06390';
const CHAT_ID = '-1003997479661';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'New Telegram form bot is running' });
});

app.post('/send-form', async (req, res) => {
    try {
        const user = req.body?.user || req.body;

        if (!user) {
            return res.status(400).json({ ok: false, message: 'Нет данных формы' });
        }

        const payload = {
            name: user.name || 'Не указано',
            phone: user.phone || 'Не указано',
            email: user.email || 'Не указано',
        };

        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({
                ok: false,
                message: 'Укажите BOT_TOKEN и CHAT_ID в окружении',
            });
        }

        const text = [
            'Новая заявка:',
            `Имя: ${payload.name}`,
            `Телефон: ${payload.phone}`,
            `Email: ${payload.email}`,
        ].join('\n');

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text,
        });

        return res.json({
            ok: true,
            message: 'Форма успешно отправлена в Telegram',
            user: payload,
        });
    } catch (error) {
        console.error('Telegram send error:', error?.response?.data || error.message);

        return res.status(500).json({
            ok: false,
            message: 'Ошибка отправки формы в Telegram',
            error: error?.response?.data || error.message,
        });
    }
});

export const startTelegramFormBot = () => {
    app.listen(PORT, () => {
        console.log(`New Telegram form bot running on http://localhost:${PORT}`);
        console.log('POST /send-form with body: { user: { name, phone, email } }');
    });

    return app;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    startTelegramFormBot();
}
