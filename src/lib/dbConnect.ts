import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log('DB already connected');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})
        console.log(db);
        connection.isConnected = db.connections[0].readyState; 
        console.log('DB connection successfull');
    } catch (error) {
        console.log('Error while connecting to DB: ' + error);
        process.exit(1);
    }

}

export default dbConnect;