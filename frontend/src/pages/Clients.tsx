import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClientsApi, saveClientApi, updateClientApi, deleteClientApi } from '../lib/api';
import { Client } from '../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

function ClientForm({
  client,
  onSave,
  onClose,
}: {
  client?: Client;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    vehicle: client?.vehicle || '',
    plate: client?.plate || '',
    notes: client?.notes || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.phone || !form.vehicle || !form.plate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      if (client?.id) {
        await updateClientApi(client.id, {
          ...form,
        });
      } else {
        await saveClientApi({
          ...form,
        });
      }

      toast.success(client ? 'Cliente atualizado!' : 'Cliente cadastrado!');
      await onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar cliente');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nome *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="João Silva"
          />
        </div>

        <div>
          <Label>Telefone *</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <Label>Endereço</Label>
          <Input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Rua João Silvestre, Nº 123"
          />
        </div>

        <div>
          <Label>Veículo *</Label>
          <Input
            value={form.vehicle}
            onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
            placeholder="BMW X5"
          />
        </div>

        <div>
          <Label>Placa *</Label>
          <Input
            value={form.plate}
            onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
            placeholder="ABC-1234"
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
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
          {client ? 'Salvar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>();

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.plate.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  async function refresh() {
    try {
      const data = await getClientsApi();
      setClients(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar clientes');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteClientApi(id);
      toast.success('Cliente removido');
      await refresh();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover cliente');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">Clientes</h1>

        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-9"
            />
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditing(undefined);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-1" /> Novo
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              </DialogHeader>

              <ClientForm
                client={editing}
                onSave={refresh}
                onClose={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
              {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </div>
          ) : (
            filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {c.vehicle} • {c.plate} • {c.phone}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(c);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  <Button size="sm" variant="secondary" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}