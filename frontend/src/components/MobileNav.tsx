import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users } from 'lucide-react';
import { cn } from '../lib/utils';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2 px-4">
      {links.map(link => {
        const isActive = location.pathname === link.to;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
