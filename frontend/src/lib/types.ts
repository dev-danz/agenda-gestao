export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle: string;
  plate: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  service: string;
  date: string;
  time: string;
  duration: number; // minutes
  price: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export const SERVICES = [
  { name: 'Lavagem De Motor', duration: 60, price: 120 },
  { name: 'Polimento', duration: 240, price: 700 },
  { name: 'Cristalização', duration: 30, price: 120 },
  { name: 'Higienização de Estofados', duration: 120, price: 400 },
  { name: 'Vitrificação', duration: 240, price: 700 },
  { name: 'Lavagem Detalhada - Prata', duration: 90, price: 120 },
  { name: 'Lavagem Detalhada - Gold', duration: 120, price: 240 },
];
