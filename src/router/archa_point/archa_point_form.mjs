import express from "express";
import archa_controller from "../../controllers/work_visa/archa_point_form_controllers.mjs";

const router = express.Router();

router.post('/api/archasaveFormData', archa_controller.saveFormData);
router.get('/api/archagetSavedFormData', archa_controller.getSavedFormData);

export default router;

