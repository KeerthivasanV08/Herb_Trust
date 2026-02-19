import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import authBackground from '@/assets/auth-background.jpg';

type AuthMode = 'login' | 'signup';

export default function Auth() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitWait, setRateLimitWait] = useState(0);

  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  // Handle rate limit countdown
  useEffect(() => {
    if (rateLimitWait > 0) {
      const timer = setTimeout(() => setRateLimitWait(rateLimitWait - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitWait]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup' && !trimmedName) {
      setError('Full name is required.');
      return;
    }

    console.log('Form submitted, mode:', mode, 'email:', trimmedEmail);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        console.log('Calling login function...');
        await login(trimmedEmail, password);
        console.log('Login returned successfully');
      } else {
        // Check if we're rate limited
        if (rateLimitWait > 0) {
          throw new Error(`Please wait ${rateLimitWait} seconds before trying again. (Rate limited by email service)`);
        }
        console.log('Calling signup function with role:', role);
        await signup(trimmedName, trimmedEmail, password, role);
        console.log('Signup returned successfully');
      }
      
      // Navigation will be handled by useEffect below
      console.log('Auth operation completed, navigation should happen via useEffect');
    } catch (err: any) {
      console.error('Auth operation error:', err);
      let errorMsg = err.message || 'Authentication failed. Please try again.';
      
      // Handle Supabase rate limit errors
      if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('too many')) {
        errorMsg = `Email rate limit exceeded. Please try a different email address or wait 1 hour before retrying with the same email.`;
        setRateLimitWait(3600); // 1 hour cooldown for rate limited emails
      }
      
      setError(errorMsg);
    } finally {
      console.log('Form submission finally block - setting isLoading to false');
      setIsLoading(false);
    }
  };

  // Navigate when user is authenticated
  useEffect(() => {
    console.log('Auth navigation effect - user:', user, 'isLoading:', isLoading);
    if (user && !isLoading) {
      console.log('User authenticated, navigating to dashboard for role:', user.role);
      const dashboardRoutes: Record<UserRole, string> = {
        farmer: '/farmer',
        manufacturer: '/manufacturer',
        auditor: '/auditor',
      };
      const route = dashboardRoutes[user.role];
      console.log('Navigating to:', route);
      navigate(route);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 auth-overlay" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-botanical-pattern pointer-events-none" />

      {/* Auth Card */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="card-elevated p-8 backdrop-blur-sm">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>
          
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/20 glow-green-sm">
              <Leaf className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">{t('index.hero.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('index.hero.subtitle')}</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setIsLoading(false);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
                setIsLoading(false);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2 animate-fade-up">
                <Label htmlFor="name">{t('auth.fullName')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-muted/50 border-border focus:border-accent focus:ring-accent/20"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50 border-border focus:border-accent focus:ring-accent/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-border focus:border-accent focus:ring-accent/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2 animate-fade-up">
                <Label>{t('auth.selectRole')}</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger className="bg-muted/50 border-border focus:border-accent focus:ring-accent/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="farmer" className="focus:bg-accent/10">
                      <div className="flex flex-col">
                        <span className="font-medium">{t('auth.roles.farmer.title')}</span>
                        <span className="text-xs text-muted-foreground">{t('auth.roles.farmer.description')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="manufacturer" className="focus:bg-accent/10">
                      <div className="flex flex-col">
                        <span className="font-medium">{t('auth.roles.manufacturer.title')}</span>
                        <span className="text-xs text-muted-foreground">{t('auth.roles.manufacturer.description')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="auditor" className="focus:bg-accent/10">
                      <div className="flex flex-col">
                        <span className="font-medium">{t('auth.roles.auditor.title')}</span>
                        <span className="text-xs text-muted-foreground">{t('auth.roles.auditor.description')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || rateLimitWait > 0}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium py-6 glow-green transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : rateLimitWait > 0 ? (
                rateLimitWait > 60
                  ? `Wait ${Math.ceil(rateLimitWait / 60)}m...`
                  : `Wait ${rateLimitWait}s...`
              ) : (
                <>
                  {mode === 'login' ? t('auth.loginButton') : t('auth.signupButton')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            {t('auth.terms')}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          🌿 {t('common.tagline')}
        </p>
      </div>
    </div>
  );
}
