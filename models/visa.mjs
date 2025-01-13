import mongoose from 'mongoose';

const visaSchema = new mongoose.Schema({
    passportId: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    visa_period: {
        type: String,
    },
    passport_validity_period: {
        type: String,
    },
    quota: {
        type: String,
    },
    work_start_date: {
        type: String,
    },
    work_end_date: {
        type: String,
    },
    startYear: {
        type: String,
    },
    endYear: {
        type: String,
    },
    med_form: {
        type: String,
    },
    country: {
        type: String,
    },
});

const Visa = mongoose.model('Visa', visaSchema);

export default Visa;