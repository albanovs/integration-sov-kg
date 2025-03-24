import mongoose from "mongoose";
import { type } from "os";

const saveSchema = new mongoose.Schema({
    name: String,
    phone: String,
    recipient_number: String,
    postamat: String,
    detail: String,
    date: String,
    time: String,
    additionalFiles: [{
        file: { type: String }
    }],
    confidentiality_condition: { type: Boolean, default: true }
});

const ArchaPointForm2 = mongoose.model("archa-point-form2", saveSchema);

export default ArchaPointForm2;