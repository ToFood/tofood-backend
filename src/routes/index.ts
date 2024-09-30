import express from "express";
import orders from "../adapters/controllers/OrderController";
import payments from "../adapters/controllers/PaymentController";
import products from "../adapters/controllers/ProductController";
import users from "../adapters/controllers/UserController";

const routes = (app: any) => {
  // Definição da rota raiz com método GET
  app.route("/").get((req: any, res: any) => {
    res.status(200).send({ title: "Tech Challenge" });
  });

  // Definição das rotas de produtos e usuários
  app.use(express.json(), products, users, orders, payments);
};

export default routes;
