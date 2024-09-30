import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface para o documento User no MongoDB.
 */
interface IUser extends Document {
    name: string;
    cpf: string;
    email: string;
}

/**
 * Schema Mongoose para a coleção de usuários.
 */
const UserSchema: Schema<IUser> = new Schema({
    name: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: false, unique: true },
});

/**
 * Modelo Mongoose para a coleção de usuários.
 */
const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default UserModel;