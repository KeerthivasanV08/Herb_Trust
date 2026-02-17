import { Link, useLocation } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Upload, Package, FileSearch,
  ChevronLeft, ChevronRight, Factory, Shield, Sprout, Home, MapPin
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  farmer: [
    { label: 'Home', href: '/farmer', icon: Home },
    { label: 'Submit Harvest', href: '/farmer/submit', icon: Upload },
    { label: 'My Batches', href: '/farmer/batches', icon: Package },
  ],
  manufacturer: [
    { label: 'Home', href: '/manufacturer', icon: Home },
    { label: 'Incoming Batches', href: '/manufacturer/incoming', icon: Package },
    { label: 'Quality Reports', href: '/manufacturer/reports', icon: FileSearch },
  ],
  auditor: [
    { label: 'Home', href: '/auditor', icon: Home },
    { label: 'Batch History', href: '/auditor/history', icon: FileSearch },
    { label: 'Compliance Map', href: '/auditor/compliance-map', icon: MapPin },
  ],
};

const roleIcons: Record<UserRole, React.ElementType> = {
  farmer: Sprout,
  manufacturer: Factory,
  auditor: Shield,
};

const roleLabels: Record<UserRole, string> = {
  farmer: 'Farmer Portal',
  manufacturer: 'Manufacturer Portal',
  auditor: 'Auditor Portal',
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;

  const navItems = roleNavItems[user.role];
  const RoleIcon = roleIcons[user.role];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-gradient-primary whitespace-nowrap">AyurTrace</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">Herb Traceability</p>
            </div>
          )}
        </Link>
      </div>

      <div className={cn(
        'mx-3 mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10',
        isCollapsed && 'mx-2 p-2'
      )}>
        <div className="flex items-center gap-2">
          <RoleIcon className={cn('text-primary shrink-0', isCollapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!isCollapsed && (
            <span className="text-sm font-medium text-foreground">{roleLabels[user.role]}</span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
              {!isCollapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="m-3 p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-2 text-sm">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
