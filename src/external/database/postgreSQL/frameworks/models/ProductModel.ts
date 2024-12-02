import { DataTypes, sql } from "@sequelize/core";
import sequelize from "../../sequelize";

const ProductModel = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID, // Use UUID for unique IDs
    defaultValue: sql.uuidV4, // Automatically generate UUIDs
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT, // Base64 image stored as text
    allowNull: false,
  },
});

export default ProductModel;
