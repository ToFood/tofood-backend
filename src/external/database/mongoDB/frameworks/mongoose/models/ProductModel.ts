import mongoose, { Schema, Document, Model } from 'mongoose';

interface IProduct extends Document {
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
}

const ProductSchema: Schema<IProduct> = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }
});

const ProductModel: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;