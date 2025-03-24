import express from "express";
import archa_controller from "../../controllers/work_visa/archa_point_form_controllers.mjs";
import archa_controller2 from "../../controllers/work_visa/archa_point_form2_controllers.mjs";
import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const router = express.Router();

const s3 = new S3Client({
    region: "eu-north-1",
    credentials: {
        accessKeyId: "AKIA2AUOO7JD73KGJ7P4",
        secretAccessKey: "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",
    },
});

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

router.post('/api/archasaveFormData', archa_controller.saveFormData);
router.get('/api/archagetSavedFormData', archa_controller.getSavedFormData);
router.post('/api/archasaveFormData2', upload.fields([{ name: 'additionalFiles' }]), archa_controller2.saveFormData);
router.get('/api/archagetSavedFormData2', archa_controller2.getSavedFormData);


export default router;