import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://vanshika:98281@cluster0.1rzk7zm.mongodb.net/food-del').then(()=>console.log("DB CONNECTED"))
}