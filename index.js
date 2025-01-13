import express from 'express';
import multer from 'multer';
import path from 'path';
import { connect } from './db.js';
import Visa from './models/visa.mjs';
import cors from 'cors';
import SaveFromVisa from './models/save_from_data.js';
import bodyParser from 'body-parser'
import FormModel from './models/form_model.mjs';

const app = express();
app.use(cors());
const PORT = '5000';
connect();
app.use(express.json());
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const originalName = file.originalname;
        const extname = path.extname(originalName);
        const baseName = path.basename(originalName, extname);
        cb(null, baseName + '-' + uniqueSuffix + extname);
    },
});

const upload = multer({ storage });
app.use(express.json());

app.get('/visa/all', async (req, res) => {
    try {
        const visas = await Visa.find();
        res.status(200).json(visas);
    } catch (error) {
        console.error('Error fetching visas:', error);
        res.status(500).json({ message: 'Failed to fetch visas' });
    }
});

app.post('/api/saveFormData', async (req, res) => {
    const {
        permit_country,
        permit_type,
        permit_srok,
        permit_doc_nom,
        permit_docstart,
        permit_docend,
        permit_doctype,
        permit_lname,
        permit_fname,
        permit_bdate,
        permit_gender,
        permit_pin,
        permit_email,
        permit_education,
        permit_famstatus,
        permit_address,
        permit_planned_entry,
        permit_planned_exit,
        permit_position,
        permit_region,
    } = req.body;

    const mapValue = (value, mapping, defaultValue = 'Другое') => mapping[value] || defaultValue;

    const formatDate = (date) => {
        if (!date) return null;
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const formatedDate = {
        permit_country: mapValue(permit_country, { "103": "Индия" }, "Другая страна"),
        permit_type: mapValue(permit_type, { "1": "Обычное единое разрешение" }, "Единое разрешение для виз категории F, Rl, M, I"),
        permit_srok: mapValue(permit_srok, { "1": "60 дней", "2": "360 дней" }),
        permit_doc_nom,
        permit_docstart: formatDate(permit_docstart),
        permit_docend: formatDate(permit_docend),
        permit_doctype: mapValue(permit_doctype, {
            "1": "Обычный",
            "2": "Дипломатический",
            "3": "Служебный/Официальный",
            "9": "Другой проездной документ"
        }, "Проездной документ лица без гражданства"),
        permit_fname,
        permit_lname,
        permit_bdate: formatDate(permit_bdate),
        permit_gender,
        permit_pin,
        permit_email,
        permit_education: mapValue(permit_education, {
            "1": "Образование детей младшего возраста",
            "2": "Начальное образование",
            "3": "Первый этап среднего образования",
            "4": "Второй этап среднего образования",
            "5": "Послесреднее нетретичное образование",
            "6": "Третичное образование",
            "7": "Короткий цикл третичного образования",
            "8": "Бакалавриат или его эквивалент",
            "9": "Магистратура или её эквивалент",
            "10": "Докторантура или её эквивалент"
        }),
        permit_famstatus: mapValue(permit_famstatus, { "1": "женат/замужем" }, "холост/не замужем"),
        permit_address,
        permit_planned_entry: formatDate(permit_planned_entry),
        permit_planned_exit: formatDate(permit_planned_exit),
        permit_position,
        permit_region: mapValue(permit_region, {
            "1": "г.Бишкек",
            "2": "г.Ош",
            "3": "обл.Баткен",
            "4": "обл.Джалал-Абад",
            "5": "обл.Иссык-Кульская",
            "6": "обл.Нарын",
            "7": "обл.Ош",
            "8": "обл.Талас",
            "9": "обл.Чуй"
        })
    };

    try {
        await SaveFromVisa.deleteMany();
        const saveFromVisa = new SaveFromVisa(formatedDate);
        await saveFromVisa.save();
        res.status(200).json({ message: 'Form data saved successfully' });
    } catch (error) {
        console.error('Error processing form data:', error);
        res.status(500).json({ message: 'Failed to save form data' });
    }
});

app.post('/api/localsaveFormData', upload.fields([{ name: 'photo' }, { name: 'additionalFiles' }]), async (req, res) => {
    try {
        const { body, files } = req;
        const photo = req.files.photo ? req.files.photo[0].filename : null;
        const additionalFiles = files['additionalFiles']
            ? files['additionalFiles'].map((file) => ({ file: file.path }))
            : [];
        const {
            permit_country, permit_type, permit_srok, permit_doc_nom, permit_docstart, permit_docend,
            permit_doctype, permit_lname, permit_fname, permit_bdate, permit_gender, permit_pin,
            permit_email, permit_education, permit_famstatus, permit_address, permit_planned_entry,
            permit_planned_exit, permit_position, permit_region
        } = body;

        const formData = new FormModel({
            formData: {
                photo,
                permit_country, permit_type, permit_srok, permit_doc_nom, permit_docstart, permit_docend,
                permit_doctype, permit_lname, permit_fname, permit_bdate, permit_gender, permit_pin,
                permit_email, permit_education, permit_famstatus, permit_address, permit_planned_entry,
                permit_planned_exit, permit_position, permit_region
            },
            files: additionalFiles
        });
        await formData.save();
        res.status(201).json({
            message: 'Данные успешно сохранены!',
            formData
        });
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        res.status(500).json({
            message: 'Ошибка на сервере',
            error
        });
    }
});

app.patch('/visa/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { formData } = req.body;
        if (!formData || typeof formData !== 'object') {
            return res.status(400).json({ message: 'Поле formData обязательно и должно быть объектом' });
        }
        const updatedDocument = await FormModel.findByIdAndUpdate(
            id,
            { $set: { formData } },
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedDocument) {
            return res.status(404).json({ message: 'Документ не найден' });
        }
        res.status(200).json({
            message: 'Данные formData успешно обновлены',
            data: updatedDocument,
        });
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        res.status(500).json({ message: 'Ошибка при обновлении данных', error });
    }
});

app.delete('/visa/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDocument = await FormModel.findByIdAndDelete(id);
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Документ не найден' });
        }
        res.status(200).json({ message: 'Документ успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        res.status(500).json({ message: 'Ошибка при удалении данных', error });
    }
});

app.post('/api/uploadFiles', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files.map((file) => ({
            file: file.filename,
        }));
        const formdata = await SaveFromVisa.findOne();
        const newForm = new FormModel({ formData: formdata || {}, files });
        await newForm.save();
        await SaveFromVisa.deleteMany();
        res.status(200).json({ message: 'Файлы успешно сохранены, данные удалены', files });
    } catch (error) {
        console.error('Ошибка сохранения файлов:', error);
        res.status(500).json({ message: 'Ошибка сохранения файлов', error });
    }
});

app.get('/api/getworkvisa', async (req, res) => {
    try {
        const workvisa = await FormModel.find();
        res.status(200).json(workvisa)
    } catch (error) {
        console.error('Error fetching saved form data:', error);
        res.status(500).json({ message: 'Failed to fetch saved form data' });
    }
})

app.get('/api/getSavedFormData', async (req, res) => {
    try {
        const savedFormData = await SaveFromVisa.find();
        res.status(200).json(savedFormData);
    } catch (error) {
        console.error('Error fetching saved form data:', error);
        res.status(500).json({ message: 'Failed to fetch saved form data' });
    }
});

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});