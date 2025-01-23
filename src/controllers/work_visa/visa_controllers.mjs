import SaveFromVisa from '../../models/save_from_data.mjs'
const saveFormData = async (req, res) => {
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
        photo: null,
        permit_country: mapValue(permit_country, {
            "103": "Индия",
            "19": "Бангладеш",
            "58": "Хорватия",
            "183": "Россия",
            "197": "Сербия",
            "40": "Канада",
        }, "Другая страна"),
        permit_type: mapValue(permit_type, { "1": "Обычное единое разрешение" }, "Единое разрешение для виз категории F, Rl, M, I"),
        permit_srok: mapValue(permit_srok, { "1": "60 дней", }, "360 дней"),
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
};

const getSavedFormData = async (req, res) => {
    try {
        const savedFormData = await SaveFromVisa.find();
        res.status(200).json(savedFormData);
    } catch (error) {
        console.error('Error fetching saved form data:', error);
        res.status(500).json({ message: 'Failed to fetch saved form data' });
    }
};

export { saveFormData, getSavedFormData };