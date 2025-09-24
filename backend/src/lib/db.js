import mongoose from 'mongoose';

export const connectDB = async ()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MONGODB connected : ${connect.connection.host}`);
    } catch (error) {
        console.log(`MONGO DB connection error ${error}`);
    }
}