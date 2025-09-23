import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Globe } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Language data with flags
const languageData = {
  en: { name: 'English', flag: '🇺🇸' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  bn: { name: 'বাংলা', flag: '🇧🇩' },
  ta: { name: 'தமிழ்', flag: '🇮🇳' },
  te: { name: 'తెలుగు', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ml: { name: 'മലയാളം', flag: '🇮🇳' },
  mr: { name: 'मराठी', flag: '🇮🇳' },
  gu: { name: 'ગુજરાતી', flag: '🇮🇳' },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  or: { name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  as: { name: 'অসমীয়া', flag: '🇮🇳' },
};

export const LanguageSwitcher: React.FC = () => {
  const { currentLang, setLanguage, isLoading } = useTranslationContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading || !isClient) {
    return (
      <Button variant="ghost" size="sm" className="w-24" disabled>
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
      </Button>
    );
  }

  const currentLanguage = languageData[currentLang as keyof typeof languageData] || { name: currentLang, flag: '🌐' };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 h-9 rounded-full border border-glass-border/60 bg-background/40 backdrop-blur hover:bg-primary/10 hover:text-primary-glow transition-all"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:flex items-center gap-1">
            <span className="text-base leading-none">{currentLanguage.flag}</span>
            <span className="text-sm font-medium">{currentLang.toUpperCase()}</span>
          </span>
          <span className="sm:hidden text-base leading-none">{currentLanguage.flag}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-glass-border min-w-[220px] p-1">
        {Object.entries(languageData).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={`flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer ${currentLang === code ? 'bg-accent/20' : 'hover:bg-accent/10'}`}
          >
            <span className="text-lg">{flag}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">{name}</span>
              <span className="text-xs text-muted-foreground uppercase">{code}</span>
            </div>
            {currentLang === code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
