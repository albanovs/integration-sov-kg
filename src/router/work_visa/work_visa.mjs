import express from "express";
import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3 = new S3Client({
    region: "eu-north-1",
    credentials: {
        accessKeyId: "AKIA2AUOO7JD73KGJ7P4",
        secretAccessKey: "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",
    },
});

const router = express.Router();
import localform_controller from "../../controllers/work_visa/form_controllers.mjs";
import { saveFormData as saveVisaFormData, getSavedFormData as getSavedVisaFormData } from "../../controllers/work_visa/visa_controllers.mjs";

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "urvisa",
        acl: "public-read",
        key: function (req, file, cb) {
            const date = new Date().toISOString().slice(0, 10);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const extname = path.extname(file.originalname);
            cb(null, `${date}-${uniqueSuffix}${extname}`);
        },
    }),
});

router.post('/api/saveFormData', saveVisaFormData);
router.get('/api/getSavedFormData', getSavedVisaFormData);

router.post('/api/localsaveFormData', upload.fields([{ name: 'photo' }, { name: 'additionalFiles' }]), localform_controller.localsaveFormData);
router.patch('/visa/update/:id', localform_controller.updateLocalFormData)
router.delete('/visa/:id', localform_controller.deleteLocalFormData)
router.post('/api/uploadFiles', upload.array('files', 20), localform_controller.saveFiles);
router.get('/api/getworkvisa', localform_controller.getLocalFormData);

export default router;