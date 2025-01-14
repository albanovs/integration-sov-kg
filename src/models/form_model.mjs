import mongoose from "mongoose";

const FormSchema = new mongoose.Schema({
    formData: { type: Object, default: {} },
    files: { type: [Object], required: true }
});

const FormModel = mongoose.model('form-document', FormSchema);
export default FormModel;