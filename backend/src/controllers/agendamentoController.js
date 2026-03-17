import prisma from "../lib/prisma.js";

function parseBrazilDateTime(value) {
  if (!value) return null;

  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value);

  if (hasTimezone) {
    return new Date(value);
  }

  return new Date(`${value}-03:00`);
}

export async function criarAgendamento(req, res) {
  try {
    const { title, start, end, service, value, status, notes, clienteId } = req.body;

    const agendamento = await prisma.agendamento.create({
      data: {
        title,
        start: parseBrazilDateTime(start),
        end: parseBrazilDateTime(end),
        service,
        value: Number(value),
        status: status || "agendado",
        notes: notes || null,
        clienteId,
      },
      include: {
        cliente: true,
      },
    });

    res.status(201).json(agendamento);
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
}

export async function listarAgendamentos(req, res) {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        cliente: true,
      },
      orderBy: {
        start: "asc",
      },
    });

    res.json(agendamentos);
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    res.status(500).json({ error: "Erro ao listar agendamentos" });
  }
}

export async function atualizarAgendamento(req, res) {
  try {
    const { id } = req.params;
    const { title, start, end, service, value, status, notes, clienteId } = req.body;

    const agendamento = await prisma.agendamento.update({
      where: { id },
      data: {
        title,
        start: parseBrazilDateTime(start),
        end: parseBrazilDateTime(end),
        service,
        value: Number(value),
        status,
        notes: notes || null,
        clienteId,
      },
      include: {
        cliente: true,
      },
    });

    res.json(agendamento);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
}

export async function deletarAgendamento(req, res) {
  try {
    const { id } = req.params;

    await prisma.agendamento.delete({
      where: { id },
    });

    res.json({ message: "Agendamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    res.status(500).json({ error: "Erro ao deletar agendamento" });
  }
}