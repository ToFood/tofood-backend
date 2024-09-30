// swaggerConfig.js
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "Documentation for my Express API",
      contact: {
        name: "Leonardo and Robert",
        email: "leonardo10sp@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [
    "./src/adapters/documentation/swaggerEndpoints/*/**.yml",
    "./src/adapters/documentation/swaggerModels/**.yml",
  ], // Path to your API route files
};

const specs = swaggerJsdoc(swaggerOptions);

export default specs;
