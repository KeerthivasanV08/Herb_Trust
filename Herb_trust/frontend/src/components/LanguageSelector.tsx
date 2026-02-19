import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'large';
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

export default function LanguageSelector({ className, variant = 'default' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === 'large') {
    return (
      <div className={cn('flex justify-center', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary bg-background/80 backdrop-blur-sm"
            >
              <Globe className="w-6 h-6 mr-3" />
              {currentLanguage.nativeName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 backdrop-blur-sm bg-background/95">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  'text-lg py-3 cursor-pointer',
                  i18n.language === lang.code && 'bg-primary/10 text-primary font-semibold'
                )}
              >
                <span className="flex-1">{lang.nativeName}</span>
                {i18n.language === lang.code && <Check className="w-5 h-5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 gap-2 transition-all', className)}
        >
          <Globe className="w-4 h-4" />
          {currentLanguage.nativeName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              'cursor-pointer',
              i18n.language === lang.code && 'bg-primary/10 text-primary font-semibold'
            )}
          >
            <span className="flex-1">{lang.nativeName}</span>
            {i18n.language === lang.code && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
