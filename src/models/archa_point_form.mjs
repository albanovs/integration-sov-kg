import mongoose from "mongoose";

const saveSchema = new mongoose.Schema({
    name: String,
    phone: String,
    from: String,
    postamat: String,
    date: String
});

const ArchaPointForm = mongoose.model("archa-point-form", saveSchema);

export default ArchaPointForm;