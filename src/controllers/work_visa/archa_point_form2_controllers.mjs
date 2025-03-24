import axios from 'axios';
import ArchaPointForm2 from "../../models/archa_point_form2.mjs";

const sendToTelegram = async (name, phone, recipient_number, detail, postamat) => {
    const date = new Date();
    const formattedDate = date.toLocaleString();
    const telegramBotToken = '8016391332:AAFvLv3Rd7EiPL7nC16MVpn3UlT3OSkb_wM';
    const chatId = '-1002410716808';

    const message = `
Дата и время: ${formattedDate}
Имя клиента: ${name}
Номер клиента: ${phone}
Номер получателя: ${recipient_number}
Описание посылки: ${detail}
Постамат: ${postamat}
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
        const { body, files } = req;
        const additionalFiles = files['additionalFiles'] ? files['additionalFiles'].map(file => ({ file: file.location })) : [];
        const { name, phone, recipient_number, detail, postamat, confidentiality_condition } = body;
        const date = new Date().toISOString().slice(0, 10);
        const time = new Date().toLocaleTimeString();
        const newFormData = new ArchaPointForm2({
            name,
            phone,
            recipient_number,
            additionalFiles,
            confidentiality_condition,
            postamat,
            detail,
            date,
            time,
        });

        await newFormData.save();
        await sendToTelegram(name, phone, recipient_number, detail, postamat);
        res.status(201).json({ message: 'Данные успешно сохранены и отправлены в Telegram!' });
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        res.status(500).json({ message: 'Произошла ошибка на сервере.' });
    }
};

const getSavedFormData = async (req, res) => {
    try {
        const savedFormData = await ArchaPointForm2.find();
        res.status(200).json(savedFormData);
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        res.status(500).json({ message: 'Не удалось получить данные.' });
    }
};

export default { saveFormData, getSavedFormData };