import cors from "cors";
import "dotenv/config";
import express from "express";
import ngrok from "ngrok";
import swaggerUi from "swagger-ui-express";
import PaymentService from "./adapters/gateway/MercadoPagoGateway";
import db from "./external/database/mongoDB/MongoDB";
import ProductModel from "./external/database/postgreSQL/frameworks/models/ProductModel";
import sequelize from "./external/database/postgreSQL/sequelize";
import swaggerSpecs from "./pkg/documentation/swaggerConfig";
import routes from "./routes/index";

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Configure CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://39DD0DA514AC9109189FED40A976BC8A.gr7.us-east-1.eks.amazonaws.com"]
    : ["http://localhost:3000"]; // Adicione o domínio local aqui para desenvolvimento

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Aplica o middleware com restrições

// Swagger Documentation
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Test PostgreSQL connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to PostgreSQL has been established successfully.");

    await ProductModel.sync({ alter: false }); // Change `alter` to `true` for schema updates
    console.log("Product model synced with the database.");
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error);
  }
})();

// MongoDB connection
db.on("error", console.log.bind(console, "MongoDB Error"));
db.once("open", () => console.log("MongoDB is running"));

// Test route
app.get("/", (req, res) => res.send("Server is running!"));

// Start the server
app.listen(port, async () => {
  console.log(`Server Running at http://localhost:${port}`);

  try {
    const ngrokUrl = await ngrok.connect({
      addr: port,
      region: "us", // Specify region if needed
    });
    PaymentService.setWebhookUrl(`${ngrokUrl}/webhook`);
    console.log(`ngrok URL: ${ngrokUrl}`);
  } catch (error: any) {
    console.error(
      "Error starting ngrok. Ensure ngrok is installed and accessible.",
      error.message
    );
    console.warn("Continuing without ngrok...");
  }
});

// Load application routes
routes(app);

export default app;
