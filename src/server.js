import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";

import { authMiddleware } from "./middleware/authMiddleware.js";
import { UserService } from "./services/user-service.js";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({ message: "test" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userService = new UserService();
  const userLogged = await userService.login(email, password);
  if (userLogged) {
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign({ user: userLogged }, secretKey, {
      expiresIn: "3600s",
    });
    return res.status(200).json({ token });
  }
  return res.status(400).json({ message: "e-mail ou senha invalido." });
});

app.use(authMiddleware);

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  const user = { name, email, password };
  const userSevice = new UserService();
  await userSevice.create(user);
  return res.status(201).json(user);
});

app.get("/users", async (req, res) => {
  const userSevice = new UserService();
  const users = await userSevice.findAll();
  return res.status(200).json(users);
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const userSevice = new UserService();
  const user = await userSevice.findById(id);
  if (user) {
    return res.status(200).json(user);
  }
  return res.status(404).json({ message: "Usuario não encontrado" });
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const userSevice = new UserService();
  const user = await userSevice.findById(id);
  if (user) {
    await userSevice.delete(id);
    return res.status(200).json({ message: "Usuario excluido com sucesso." });
  }
  return res.status(404).json({ message: "Usuario não encontrado" });
});

app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;
  const user = { name, email, password };
  const userService = new UserService();
  const findUser = await userService.findById(id);
  if (findUser) {
    await userService.update(id, user);
    return res.status(200).json({ message: "Usuario atualizado com sucesso" });
  }
  return res.status(404).json({ message: "Usuario não encontrado" });
});

app.listen(process.env.PORT || port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
