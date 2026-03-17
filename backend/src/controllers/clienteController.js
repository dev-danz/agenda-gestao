import prisma from "../lib/prisma.js";

export async function criarCliente(req, res) {
  try {
    const { name, phone, email, vehicle, plate, notes } = req.body;

    const cliente = await prisma.cliente.create({
      data: {
        name,
        phone,
        email: email || null,
        vehicle,
        plate,
        notes: notes || null,
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

export async function listarClientes(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
}

export async function atualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, email, vehicle, plate, notes } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || null,
        vehicle,
        plate,
        notes: notes || null,
      },
    });

    res.json(cliente);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
}

export async function deletarCliente(req, res) {
  try {
    const { id } = req.params;

    await prisma.cliente.delete({
      where: { id },
    });

    res.json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
}