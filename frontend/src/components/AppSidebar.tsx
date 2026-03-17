import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import logo from '../assets/logoDancar.png';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border min-h-screen p-4">
      
      {/* LOGO + NOME */}
      <div className="flex items-center gap-3 px-3 mb-10">
        
        <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={logo}
            alt="Logo do cliente"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h1 className="text-lg font-bold font-['Space_Grotesk']">DANCAR</h1>
          <p className="text-xs text-muted-foreground">
            Estética Automotiva
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary shadow-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}