import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/clienteRoutes.js";
import agendamentoRoutes from "./routes/agendamentoRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", clienteRoutes);
app.use("/api", agendamentoRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});