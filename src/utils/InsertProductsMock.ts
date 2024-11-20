import ProductModel from "../external/database/mongoDB/frameworks/mongoose/models/ProductModel";
import { products } from "./ProductsMock";

export const prefillProducts = async () => {
  const count = await ProductModel.countDocuments();
  if (count === 0) {
    await ProductModel.insertMany(products);
    console.log("Database prefilled with sample products!");
  } else {
    console.log("Products already exist in the database.");
  }
};
