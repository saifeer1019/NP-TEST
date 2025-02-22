import mongoose from 'mongoose';

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the NEXT_PUBLIC_MONGO_URI environment variable inside .env.local');
}

const connectionToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

export default connectionToDatabase; 
