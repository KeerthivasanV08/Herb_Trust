import { Link, useLocation } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Upload, Package, FileSearch,
  ChevronLeft, ChevronRight, Factory, Shield, Sprout, Home, MapPin, Bell
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  farmer: [
    { labelKey: 'sidebar.home', href: '/farmer', icon: Home },
    { labelKey: 'sidebar.submitHarvest', href: '/farmer/submit', icon: Upload },
    { labelKey: 'sidebar.myBatches', href: '/farmer/batches', icon: Package },
    { labelKey: 'sidebar.notifications', href: '/farmer/notifications', icon: Bell },
  ],
  manufacturer: [
    { labelKey: 'sidebar.home', href: '/manufacturer', icon: Home },
    { labelKey: 'sidebar.incomingBatches', href: '/manufacturer/incoming', icon: Package },
    { labelKey: 'sidebar.qualityReports', href: '/manufacturer/reports', icon: FileSearch },
  ],
  auditor: [
    { labelKey: 'sidebar.home', href: '/auditor', icon: Home },
    { labelKey: 'sidebar.batchHistory', href: '/auditor/history', icon: FileSearch },
    { labelKey: 'sidebar.complianceMap', href: '/auditor/compliance-map', icon: MapPin },
  ],
};

const roleIcons: Record<UserRole, React.ElementType> = {
  farmer: Sprout,
  manufacturer: Factory,
  auditor: Shield,
};

const roleLabelsKeys: Record<UserRole, string> = {
  farmer: 'sidebar.farmerPortal',
  manufacturer: 'sidebar.manufacturerPortal',
  auditor: 'sidebar.auditorPortal',
};

export default function Sidebar() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;

  const navItems = roleNavItems[user.role];
  const RoleIcon = roleIcons[user.role];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 shadow-2xl',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-slate-700/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 backdrop-blur-sm shrink-0 border border-emerald-400/30">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent whitespace-nowrap">{t('index.hero.title')}</h1>
              <p className="text-[10px] text-slate-400 whitespace-nowrap">{t('sidebar.herbTraceability')}</p>
            </div>
          )}
        </Link>
      </div>

      <div className={cn(
        'mx-3 mt-4 p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 backdrop-blur-sm',
        isCollapsed && 'mx-2 p-2'
      )}>
        <div className="flex items-center gap-2">
          <RoleIcon className={cn('text-emerald-400 shrink-0', isCollapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!isCollapsed && (
            <span className="text-sm font-medium text-slate-100">{t(roleLabelsKeys[user.role])}</span>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
              {!isCollapsed && (
                <span className="text-sm">{t(item.labelKey)}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="m-3 p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center border border-slate-600/50 hover:border-slate-500 hover:shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-2 text-sm font-medium">{t('sidebar.collapse')}</span>
          </>
        )}
      </button>
    </aside>
  );
}
