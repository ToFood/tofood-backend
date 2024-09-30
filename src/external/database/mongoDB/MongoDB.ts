import mongoose from "mongoose";
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?`;

mongoose.connect(uri);

const db = mongoose.connection;

export default db;
