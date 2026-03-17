import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, MessageCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getClientsApi,
  getAppointmentsApi,
  saveAppointmentApi,
  updateAppointmentApi,
} from '../lib/api';
import { sendWhatsApp } from '../lib/store';
import { Appointment, Client, SERVICES } from '../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const statusMap = {
  scheduled: { label: 'Agendado', class: 'bg-secondary text-secondary-foreground' },
  in_progress: { label: 'Em andamento', class: 'bg-primary/20 text-primary' },
  completed: { label: 'Concluído', class: 'bg-success/20 text-success' },
  cancelled: { label: 'Cancelado', class: 'bg-destructive/20 text-destructive' },
};

function buildLocalDate(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function buildStartAndEndISO(date: string, time: string, duration: number) {
  const startDate = buildLocalDate(date, time);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

function AppointmentForm({
  date,
  onSave,
  onClose,
  clients,
}: {
  date: string;
  onSave: () => Promise<void> | void;
  onClose: () => void;
  clients: Client[];
}) {
  const [form, setForm] = useState({
    clientId: '',
    service: '',
    time: '09:00',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.clientId || !form.service || !form.time) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const svc = SERVICES.find((s) => s.name === form.service);
      const client = clients.find((c) => c.id === form.clientId);
      const duration = svc?.duration || 60;

      const { start, end } = buildStartAndEndISO(date, form.time, duration);

      await saveAppointmentApi({
        title: `${client?.name || 'Cliente'} - ${form.service}`,
        start,
        end,
        service: form.service,
        value: svc?.price || 0,
        status: 'agendado',
        notes: form.notes,
        clienteId: form.clientId,
      });

      toast.success('Agendamento criado!');
      await onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar agendamento');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Cliente *</Label>
        <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} - {c.vehicle} ({c.plate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {clients.length === 0 && (
          <p className="text-xs text-destructive mt-1">Cadastre um cliente primeiro</p>
        )}
      </div>

      <div>
        <Label>Serviço *</Label>
        <Select value={form.service} onValueChange={(v) => setForm((f) => ({ ...f, service: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.name} - R$ {s.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Horário *</Label>
        <Input
          type="time"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Input
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Detalhes..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          Agendar
        </Button>
      </div>
    </form>
  );
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  async function refreshData() {
    try {
      const [clientsData, appointmentsData] = await Promise.all([
        getClientsApi(),
        getAppointmentsApi(),
      ]);

      const normalizedAppointments: Appointment[] = appointmentsData.map((apt: any) => ({
        id: apt.id,
        clientId: apt.clienteId,
        service: apt.service,
        date: format(new Date(apt.start), 'yyyy-MM-dd'),
        time: format(new Date(apt.start), 'HH:mm'),
        duration: Math.max(
          1,
          Math.round((new Date(apt.end).getTime() - new Date(apt.start).getTime()) / 60000)
        ),
        price: apt.value,
        status:
          apt.status === 'agendado'
            ? 'scheduled'
            : apt.status === 'em_andamento'
            ? 'in_progress'
            : apt.status === 'concluido'
            ? 'completed'
            : apt.status === 'cancelado'
            ? 'cancelled'
            : apt.status,
        notes: apt.notes || '',
        createdAt: apt.createdAt,
      }));

      setClients(clientsData);
      setAppointments(normalizedAppointments);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar agenda');
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDate]
  );

  async function handleComplete(apt: Appointment) {
    try {
      const { start, end } = buildStartAndEndISO(apt.date, apt.time, apt.duration);

      await updateAppointmentApi(apt.id, {
        title: `${clients.find((c) => c.id === apt.clientId)?.name || 'Cliente'} - ${apt.service}`,
        start,
        end,
        service: apt.service,
        value: apt.price,
        status: 'concluido',
        notes: apt.notes,
        clienteId: apt.clientId,
      });

      const client = clients.find((c) => c.id === apt.clientId);
      if (client) {
        const msg = `Olá ${client.name}! 🚘✨

Seu serviço de *${apt.service}* no veículo *${client.vehicle} - ${client.plate}* foi finalizado!

Valor do serviço: R$ ${apt.price}

Minha chave Pix para transferência: 64.831.283/0001-04

Obrigado pela preferência! 🙏`;

        sendWhatsApp(client.phone, msg);
      }

      toast.success('Serviço finalizado!');
      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao finalizar serviço');
    }
  }

  async function handleStatusChange(apt: Appointment, status: Appointment['status']) {
    try {
      const { start, end } = buildStartAndEndISO(apt.date, apt.time, apt.duration);

      const backendStatus =
        status === 'scheduled'
          ? 'agendado'
          : status === 'in_progress'
          ? 'em_andamento'
          : status === 'completed'
          ? 'concluido'
          : 'cancelado';

      await updateAppointmentApi(apt.id, {
        title: `${clients.find((c) => c.id === apt.clientId)?.name || 'Cliente'} - ${apt.service}`,
        start,
        end,
        service: apt.service,
        value: apt.price,
        status: backendStatus,
        notes: apt.notes,
        clienteId: apt.clientId,
      });

      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">Agenda</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" /> Agendar
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                Novo Agendamento - {format(parseISO(selectedDate), 'dd/MM/yyyy')}
              </DialogTitle>
            </DialogHeader>

            <AppointmentForm
              date={selectedDate}
              clients={clients}
              onSave={refreshData}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate((d) => addDays(d, -7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm font-medium">
            {format(weekStart, 'dd MMM', { locale: ptBR })} —{' '}
            {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: ptBR })}
          </span>

          <Button variant="ghost" size="sm" onClick={() => setCurrentDate((d) => addDays(d, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = dateStr === selectedDate;
            const isToday = isSameDay(day, new Date());
            const dayApts = appointments.filter((a) => a.date === dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'flex flex-col items-center py-2 rounded-lg transition-all text-sm',
                  isSelected ? 'bg-primary text-primary-foreground shadow-gold' : 'hover:bg-secondary',
                  isToday && !isSelected && 'ring-1 ring-primary/50'
                )}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span className="font-semibold">{format(day, 'dd')}</span>
                {dayApts.length > 0 && (
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          {format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </h2>

        {dayAppointments.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            Nenhum agendamento para este dia
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((apt, i) => {
              const client = clients.find((c) => c.id === apt.clientId);
              const st = statusMap[apt.status as keyof typeof statusMap];

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-mono font-semibold text-primary">
                          {apt.time}
                        </span>
                        <Badge className={st.class}>{st.label}</Badge>
                      </div>

                      <p className="font-medium">{client?.name || 'Cliente removido'}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.service} • R$ {apt.price}
                      </p>

                      {client && (
                        <p className="text-xs text-muted-foreground">
                          {client.vehicle} • {client.plate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {apt.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(apt, 'in_progress')}
                      >
                        Iniciar
                      </Button>
                    )}

                    {apt.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="bg-gradient-gold text-primary-foreground hover:opacity-90"
                        onClick={() => handleComplete(apt)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" /> Finalizar
                      </Button>
                    )}

                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(apt, 'cancelled')}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}