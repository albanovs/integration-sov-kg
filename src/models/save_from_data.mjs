import mongoose from "mongoose";

const saveSchema = new mongoose.Schema({
    photo: String,
    additionalFiles: [String],
    permit_country: String,
    permit_type: String,
    permit_srok: String,
    permit_doc_nom: String,
    permit_docstart: String,
    permit_docend: String,
    permit_doctype: String,
    permit_bezdrajd: String,
    permit_lname: String,
    permit_fname: String,
    permit_bdate: String,
    permit_gender: String,
    permit_pin: String,
    permit_email: String,
    permit_education: String,
    permit_famstatus: String,
    permit_address: String,
    permit_planned_entry: String,
    permit_planned_exit: String,
    permit_position: String,
    permit_region: String,
    selectedVisa: String
});

const SaveFromVisa = mongoose.model("save-from-data", saveSchema);

export default SaveFromVisa;