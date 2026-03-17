import { useEffect, useMemo, useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, DollarSign, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getClientsApi, getAppointmentsApi, updateAppointmentApi } from '../lib/api';
import { sendWhatsApp } from '../lib/store';
import { Appointment, Client } from '../lib/types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

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

export default function Dashboard() {
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
      toast.error('Erro ao carregar dashboard');
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const todayApts = useMemo(
    () =>
      appointments
        .filter((a) => isToday(parseISO(a.date)))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments]
  );

  const monthRevenue = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => a.status === 'completed' && parseISO(a.date).getMonth() === now.getMonth())
      .reduce((sum, a) => sum + a.price, 0);
  }, [appointments]);

  const completedToday = todayApts.filter((a) => a.status === 'completed').length;

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
        const msg = `Olá ${client.name}! 🚗✨

Seu serviço de *${apt.service}* no veículo *${client.vehicle} - ${client.plate}* foi finalizado!

Valor do serviço: R$ ${apt.price}

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

  async function handleStart(apt: Appointment) {
    try {
      const { start, end } = buildStartAndEndISO(apt.date, apt.time, apt.duration);

      await updateAppointmentApi(apt.id, {
        title: `${clients.find((c) => c.id === apt.clientId)?.name || 'Cliente'} - ${apt.service}`,
        start,
        end,
        service: apt.service,
        value: apt.price,
        status: 'em_andamento',
        notes: apt.notes,
        clienteId: apt.clientId,
      });

      toast.success('Serviço iniciado!');
      await refreshData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao iniciar serviço');
    }
  }

  const stats = [
    { icon: Calendar, label: 'Hoje', value: todayApts.length, color: 'text-primary' },
    { icon: Users, label: 'Clientes', value: clients.length, color: 'text-primary' },
    {
      icon: DollarSign,
      label: 'Receita (mês)',
      value: `R$ ${monthRevenue.toLocaleString('pt-BR')}`,
      color: 'text-success',
    },
    { icon: CheckCircle2, label: 'Concluídos hoje', value: completedToday, color: 'text-success' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk']">
          Olá DANCAR, bem-vindo ao seu Dashboard <span className="text-gradient-gold"></span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 font-['Space_Grotesk']">Agenda de Hoje</h2>
        {todayApts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            Nenhum agendamento para hoje
          </div>
        ) : (
          <div className="space-y-3">
            {todayApts.map((apt, i) => {
              const client = clients.find((c) => c.id === apt.clientId);
              const st = statusMap[apt.status as keyof typeof statusMap];

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
                >
                  <div className="flex items-center gap-2 text-primary font-mono font-semibold min-w-[60px]">
                    <Clock className="w-4 h-4" />
                    {apt.time}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{client?.name || 'Cliente removido'}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.service} • {client?.vehicle} {client?.plate}
                    </p>
                  </div>

                  <Badge className={st.class}>{st.label}</Badge>

                  <div className="flex gap-2">
                    {apt.status === 'scheduled' && (
                      <Button size="sm" variant="secondary" onClick={() => handleStart(apt)}>
                        Iniciar
                      </Button>
                    )}

                    {apt.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="bg-gradient-gold text-primary-foreground hover:opacity-90"
                        onClick={() => handleComplete(apt)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Finalizar
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