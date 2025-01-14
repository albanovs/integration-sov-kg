import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

import localform_controller from "../../controllers/work_visa/form_controllers.mjs";
import { saveFormData as saveVisaFormData, getSavedFormData as getSavedVisaFormData } from "../../controllers/work_visa/visa_controllers.mjs";

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

router.post('/api/saveFormData', saveVisaFormData);
router.get('/api/getSavedFormData', getSavedVisaFormData);

router.post('/api/localsaveFormData', upload.fields([{ name: 'photo' }, { name: 'additionalFiles' }]), localform_controller.localsaveFormData);
router.patch('/visa/update/:id', localform_controller.updateLocalFormData)
router.delete('/visa/:id', localform_controller.deleteLocalFormData)
router.post('/api/uploadFiles', upload.array('files', 10), localform_controller.saveFiles);
router.get('/api/getworkvisa', localform_controller.getLocalFormData);

export default router;