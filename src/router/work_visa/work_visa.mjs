import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

import localform_controller from "../../controllers/work_visa/form_controllers.mjs";
import { saveFormData as saveVisaFormData, getSavedFormData as getSavedVisaFormData } from "../../controllers/work_visa/visa_controllers.mjs";

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const date = new Date().toISOString().slice(0, 10);  // Только дата (например: 2025-01-15)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);  // Уникальный суффикс
        const extname = path.extname(file.originalname);  // Расширение файла
        cb(null, `${date}-${uniqueSuffix}${extname}`);
    },
});


const upload = multer({ storage });

router.post('/api/saveFormData', saveVisaFormData);
router.get('/api/getSavedFormData', getSavedVisaFormData);

router.post('/api/localsaveFormData', upload.fields([{ name: 'photo' }, { name: 'additionalFiles' }]), localform_controller.localsaveFormData);
router.patch('/visa/update/:id', localform_controller.updateLocalFormData)
router.delete('/visa/:id', localform_controller.deleteLocalFormData)
router.post('/api/uploadFiles', upload.array('files', 20), localform_controller.saveFiles);
router.get('/api/getworkvisa', localform_controller.getLocalFormData);

export default router;