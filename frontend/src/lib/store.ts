import { Client, Appointment } from './types';

const CLIENTS_KEY = 'autoshine_clients';
const APPOINTMENTS_KEY = 'autoshine_appointments';

export function getClients(): Client[] {
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveClient(client: Client): void {
  const clients = getClients();
  const idx = clients.findIndex(c => c.id === client.id);
  if (idx >= 0) clients[idx] = client;
  else clients.push(client);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function getAppointments(): Appointment[] {
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAppointment(apt: Appointment): void {
  const apts = getAppointments();
  const idx = apts.findIndex(a => a.id === apt.id);
  if (idx >= 0) apts[idx] = apt;
  else apts.push(apt);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(apts));
}

export function deleteAppointment(id: string): void {
  const apts = getAppointments().filter(a => a.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(apts));
}

export function sendWhatsApp(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, '');
  const url = `https://wa.me/55${cleaned}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
