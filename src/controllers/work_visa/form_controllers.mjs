import FormModel from "../../models/form_model.mjs";

const localsaveFormData = async (req, res) => {
    try {
        const { body, files } = req;
        const photo = req.files.photo ? req.files.photo[0].filename : null;
        const additionalFiles = files['additionalFiles']
            ? files['additionalFiles'].map((file) => ({ file: file.filename }))
            : [];
        const {
            permit_country, permit_type, permit_srok, permit_doc_nom, permit_docstart, permit_docend,
            permit_doctype, permit_lname, permit_fname, permit_bdate, permit_gender, permit_pin,
            permit_email, permit_education, permit_famstatus, permit_address, permit_planned_entry,
            permit_planned_exit, permit_position, permit_region
        } = body;

        const mapValue = (value, mapping, defaultValue = 'Другое') => mapping[value] || defaultValue;

        const formatedDate = {
            photo: photo,
            permit_country: mapValue(permit_country, {
                "103": "Индия",
                "19": "Бангладеш",
                "58": "Хорватия",
                "183": "Россия",
                "197": "Сербия",

            }, "Другая страна"),
            permit_type: mapValue(permit_type, { "1": "Обычное единое разрешение" }, "Единое разрешение для виз категории F, Rl, M, I"),
            permit_srok: mapValue(permit_srok, { "1": "60 дней", "2": "360 дней" }),
            permit_doc_nom,
            permit_docstart: permit_docstart,
            permit_docend: permit_docend,
            permit_doctype: mapValue(permit_doctype, {
                "1": "Обычный",
                "2": "Дипломатический",
                "3": "Служебный/Официальный",
                "9": "Другой проездной документ"
            }, "Проездной документ лица без гражданства"),
            permit_fname,
            permit_lname,
            permit_bdate: permit_bdate,
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
            permit_planned_entry: permit_planned_entry,
            permit_planned_exit: permit_planned_exit,
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

        const formData = new FormModel({
            formData: formatedDate,
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
}

const updateLocalFormData = async (req, res) => {
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
}

const deleteLocalFormData = async (req, res) => {
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
};

const saveFiles = async (req, res) => {
    try {
        const files = req.files.map((file) => ({
            file: file.filename,
        }));
        const formdata = await SaveFromVisa.findOne();
        const date = new Date();
        const newForm = new FormModel({ data: date, formData: formdata || {}, files });
        await newForm.save();
        await SaveFromVisa.deleteMany();
        res.status(200).json({ message: 'Файлы успешно сохранены, данные удалены', files });
    } catch (error) {
        console.error('Ошибка сохранения файлов:', error);
        res.status(500).json({ message: 'Ошибка сохранения файлов', error });
    }
};

const getLocalFormData = async (req, res) => {
    try {
        const workvisa = await FormModel.find();
        res.status(200).json(workvisa)
    } catch (error) {
        console.error('Error fetching saved form data:', error);
        res.status(500).json({ message: 'Failed to fetch saved form data' });
    }
};

export default { localsaveFormData, saveFiles, getLocalFormData, updateLocalFormData, deleteLocalFormData };

