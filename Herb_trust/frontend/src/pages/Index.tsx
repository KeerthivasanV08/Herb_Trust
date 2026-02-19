import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, ArrowRight, Shield, Sprout, Factory, CheckCircle2, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import authBackground from '@/assets/auth-background.jpg';

export default function Index() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Sprout,
      title: t('index.roles.farmer.title'),
      description: t('index.roles.farmer.description'),
    },
    {
      icon: Factory,
      title: t('index.roles.manufacturer.title'),
      description: t('index.roles.manufacturer.description'),
    },
    {
      icon: Shield,
      title: t('index.roles.auditor.title'),
      description: t('index.roles.auditor.description'),
    },
  ];

  const stats = [
    { value: '156+', label: t('chart.count') },
    { value: '98%', label: t('chart.rate') },
    { value: '8', label: t('auditor.dashboard.regions') },
    { value: '24/7', label: 'Real-time' },
  ];

  const whyItems = [
    { icon: CheckCircle2, title: t('index.features.aiVerification.title'), desc: t('index.features.aiVerification.description') },
    { icon: Globe, title: 'Geo-Spatial Intelligence', desc: 'GPS-verified harvest locations with ecological validity checks.' },
    { icon: Shield, title: t('index.features.blockchain.title'), desc: t('index.features.blockchain.description') },
    { icon: Zap, title: t('index.features.realTime.title'), desc: t('index.features.realTime.description') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Language Selector */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${authBackground})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        <div className="absolute inset-0 bg-botanical-pattern" />

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-up">
            <div className="p-4 rounded-2xl bg-primary/10 animate-glow-pulse">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient-primary">{t('index.hero.title')}</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('index.hero.subtitle')}
          </p>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {t('index.hero.description')}
          </p>

          {/* Language Selector above Get Started button */}
          <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <LanguageSelector variant="large" />
          </div>

          <div className="flex justify-center animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6">
                {t('index.hero.getStarted')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gradient-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-botanical-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('index.roles.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A unified platform where every stakeholder plays their part in ensuring sustainable, authenticated herb supply chains.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="card-elevated p-8 transition-glow group">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-6 group-hover:bg-primary/15 transition-all">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('index.features.title')}
              </h2>
              <div className="space-y-6">
                {whyItems.map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="card-elevated p-8 text-center">
                <div className="text-6xl mb-4">🌿</div>
                <h3 className="text-2xl font-bold text-gradient-primary mb-2">{t('index.hero.title')}</h3>
                <p className="text-muted-foreground mb-6">{t('index.hero.description')}</p>
                <Link to="/auth">
                  <Button className="bg-gradient-primary">
                    {t('index.hero.getStarted')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{t('index.hero.title')}</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 {t('index.hero.title')}. Sustainable. Traceable. Trusted.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
