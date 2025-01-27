import axios from 'axios';
import ArchaPointForm from "../../models/archa_point_form.mjs";

const sendToTelegram = async (name, phone, from, detail, postamat) => {
    const date = new Date();
    const formattedDate = date.toLocaleString();
    const telegramBotToken = '7353979355:AAEANOLa4VLA399--RQ0R5vwZPL_NOveIj4';
    const chatId = '-1002410716808';

    const message = `
Дата и время: ${formattedDate}
Имя клиента: ${name}
Номер клиента: ${phone}
Забрать посылку с адреса: ${from}
Описание посылки: ${detail}
Доставить в постамат: ${postamat}
    `;

    try {
        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
        });
    } catch (error) {
        console.error('Ошибка при отправке сообщения в Telegram:', error);
    }
};

const saveFormData = async (req, res) => {
    try {
        const { name, phone, from, postamat, detail } = req.body;
        const date = new Date().toISOString().slice(0, 10);
        const time = new Date().toLocaleTimeString();
        const newFormData = new ArchaPointForm({
            name,
            phone,
            from,
            postamat,
            date,
            time,
            detail
        });

        await newFormData.save();
        await sendToTelegram(name, phone, from, postamat);
        res.status(201).json({ message: 'Данные успешно сохранены и отправлены в Telegram!' });
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере.' });
    }
};

const getSavedFormData = async (req, res) => {
    try {
        const savedFormData = await ArchaPointForm.find();
        res.status(200).json(savedFormData);
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        res.status(500).json({ message: 'Не удалось получить данные.' });
    }
};

export default { saveFormData, getSavedFormData };
