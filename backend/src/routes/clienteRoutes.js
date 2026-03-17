import express from "express";
import {
  criarCliente,
  listarClientes,
  atualizarCliente,
  deletarCliente,
} from "../controllers/clienteController.js";

const router = express.Router();

router.get("/clientes", listarClientes);
router.post("/clientes", criarCliente);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", deletarCliente);

export default router;