import { Telegraf, Markup } from 'telegraf'
import ArchaPointForm from '../../models/archa_point_form.mjs';
import axios from 'axios';

const bot = new Telegraf('8016391332:AAFvLv3Rd7EiPL7nC16MVpn3UlT3OSkb_wM');

const userData = {};

const sendToTelegram = async (name, phone, from, detail, postamat) => {
    const date = new Date();
    const formattedDate = date.toLocaleString();
    const telegramBotToken = '8016391332:AAFvLv3Rd7EiPL7nC16MVpn3UlT3OSkb_wM';
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

bot.start((ctx) => {
    const chatId = ctx.chat.id;
    userData[chatId] = {};
    ctx.reply('Пожалуйста, введите имя:');
});

bot.on('text', (ctx) => {
    const chatId = ctx.chat.id;
    const message = ctx.message.text;

    if (!userData[chatId].name) {
        userData[chatId].name = message;
        ctx.reply(`Имя: ${message}\nТеперь введите номер телефона для связи:`);
        return;
    }

    if (!userData[chatId].phone) {
        userData[chatId].phone = message;
        ctx.reply(
            `Имя: ${userData[chatId].name}\nНомер телефона: ${message}\nВведите адрес откуда забрать посылку:`
        );
        return;
    }

    if (!userData[chatId].from) {
        userData[chatId].from = message;
        ctx.reply(
            `Имя: ${userData[chatId].name}\nНомер телефона: ${userData[chatId].phone}\nАдрес посылки: ${message} \nПожалуйста, опишите ваш товар:`
        );
        return;
    }

    if (!userData[chatId].detail) {
        userData[chatId].detail = message;

        ctx.reply(
            `Имя: ${userData[chatId].name}\nНомер телефона: ${userData[chatId].phone}\nАдрес посылки: ${userData[chatId].from}\nОписание товара: ${message}\nВыберите постамат для доставки:`,
            Markup.inlineKeyboard([
                [Markup.button.callback('ул.Нуркамал Жетикашкаевой 29, ТЦ “ДК”', 'postamat1')],
                [Markup.button.callback('ул.Льва Толстого 24, супермаркет «Азия»', 'postamat2')],
                [Markup.button.callback('Киевская 148 ТЦ «Бишкек Парк», этаж B2', 'postamat3')],
                [Markup.button.callback('ул.Горького 1/2, гипермаркет «Азия»', 'postamat4')],
                [Markup.button.callback('ул.Аалы Токомбаева 17/2, ТЦ Tommi Mall', 'postamat5')],
            ])
        );
        return;
    }
});

bot.action(/postamat(\d+)/, (ctx) => {
    const chatId = ctx.chat.id;
    const postamatId = ctx.match[1];

    userData[chatId].postamat = postamatId === 1 ? 'ул.Нуркамал Жетикашкаевой 29, ТЦ “ДК”'
        : postamatId === 2 ? 'ул.Льва Толстого 24, супермаркет «Азия»'
            : postamatId === 3 ? 'Киевская 148 ТЦ «Бишкек Парк», этаж B2'
                : postamatId === 4 ? 'ул.Горького 1/2, гипермаркет «Азия»' : 'ул.Аалы Токомбаева 17/2, ТЦ Tommi Mall';

    const { name, phone, from, postamat, detail } = userData[chatId];

    ctx.reply(
        `Вы ввели следующие данные:\n\nИмя: ${name}\nТелефон: ${phone}\nАдрес посылки: ${from} \nОписание товара: ${detail}\nПостамат: ${postamat}\n\nВсе ли данные введены верно?`,
        Markup.inlineKeyboard([
            [Markup.button.callback('Оформить заказ', 'confirm')],
            [Markup.button.callback('Заполнять заново', 'restart')],
            [Markup.button.callback('Сбросить', 'cancel')],
        ])
    );
});

bot.action('restart', (ctx) => {
    const chatId = ctx.chat.id;
    userData[chatId] = {};
    ctx.reply('Данные сброшены. Введите ваше имя:');
});

bot.action('confirm', async (ctx) => {
    const { name, phone, from, postamat, detail } = userData[ctx.chat.id];
    await saveFormData({ name, phone, from, postamat, detail });
    ctx.reply('Ваш заказ оформлен! Спасибо за использование нашего сервиса.');
});

bot.action('cancel', (ctx) => {
    const chatId = ctx.chat.id;
    userData[chatId] = {};
    ctx.reply('Ваши данные сброшены. Если нужно, начните заново, отправив /start.');
});

const saveFormData = async ({ name, phone, from, postamat, detail }) => {
    try {
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
        await sendToTelegram(name, phone, from, detail, postamat);
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
    }
};

export { bot };