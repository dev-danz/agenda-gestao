const API_URL = "http://localhost:3000/api";

export async function getClientsApi() {
  const response = await fetch(`${API_URL}/clientes`);
  if (!response.ok) throw new Error("Erro ao buscar clientes");
  return response.json();
}

export async function saveClientApi(client: {
  name: string;
  phone: string;
  email?: string;
  vehicle: string;
  plate: string;
  notes?: string;
}) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error("Erro ao salvar cliente");
  return response.json();
}

export async function updateClientApi(
  id: string,
  client: {
    name: string;
    phone: string;
    email?: string;
    vehicle: string;
    plate: string;
    notes?: string;
  }
) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  if (!response.ok) throw new Error("Erro ao atualizar cliente");
  return response.json();
}

export async function deleteClientApi(id: string) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao deletar cliente");
  return response.json();
}

export async function getAppointmentsApi() {
  const response = await fetch(`${API_URL}/agendamentos`);
  if (!response.ok) throw new Error("Erro ao buscar agendamentos");
  return response.json();
}

export async function saveAppointmentApi(data: {
  title: string;
  start: string;
  end: string;
  service: string;
  value: number;
  status?: string;
  notes?: string;
  clienteId: string;
}) {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erro ao salvar agendamento");
  return response.json();
}

export async function updateAppointmentApi(
  id: string,
  data: {
    title: string;
    start: string;
    end: string;
    service: string;
    value: number;
    status: string;
    notes?: string;
    clienteId: string;
  }
) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erro ao atualizar agendamento");
  return response.json();
}

export async function deleteAppointmentApi(id: string) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao deletar agendamento");
  return response.json();
}