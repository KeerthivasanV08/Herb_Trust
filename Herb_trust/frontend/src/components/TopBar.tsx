import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

// TEMP AUTH DISABLED FOR EVALUATION – RESTORE SUPABASE AFTER DEMO

const roleTitles: Record<UserRole, string> = {
  farmer: 'nav.farmer',
  manufacturer: 'nav.manufacturer',
  auditor: 'nav.auditor',
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    // AUTH DISABLED: Logout just clears local state
    console.log('Logging out...');
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-semibold text-foreground hidden md:block">
          {t(roleTitles[user.role])}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSelector />

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
