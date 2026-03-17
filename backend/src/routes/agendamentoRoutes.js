import express from "express";
import {
  criarAgendamento,
  listarAgendamentos,
  atualizarAgendamento,
  deletarAgendamento,
} from "../controllers/agendamentoController.js";

const router = express.Router();

router.get("/agendamentos", listarAgendamentos);
router.post("/agendamentos", criarAgendamento);
router.put("/agendamentos/:id", atualizarAgendamento);
router.delete("/agendamentos/:id", deletarAgendamento);

export default router;