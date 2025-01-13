import mongoose from 'mongoose';

export const connect = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://urs:tgvvgt890@urs.ol485.mongodb.net/?retryWrites=true&w=majority&appName=urs'
        );
        console.log('DB connected');
    } catch (error) {
        console.error('DB connection error', error);
    }
};