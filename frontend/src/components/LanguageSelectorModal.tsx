import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/context/LanguageContext";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

const languageOptions: LanguageOption[] = [
  {
    code: "auto",
    name: "Auto-Detect",
    nativeName: "Auto",
    flag: "🌐",
    description: "Automatically detect language from your message",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    description: "Chat in English",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    description: "Chatea en Español",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    description: "Discute en Français",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    description: "Chatte auf Deutsch",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    description: "Converse em Português",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    description: "Chatta in Italiano",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    description: "日本語でチャット",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    description: "한국어로 채팅",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    description: "用中文聊天",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    description: "تحدث بالعربية",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    description: "Общайся на Русском",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    description: "हिंदी में चैट करो",
  },
  {
    code: "tl",
    name: "Tagalog",
    nativeName: "Tagalog",
    flag: "🇵🇭",
    description: "Mag-chat sa Tagalog",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    description: "తెలుగులో చాట్ చేయండి",
  },
];

interface LanguageSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LanguageSelectorModal = ({
  open,
  onOpenChange,
}: LanguageSelectorModalProps) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t("changeLanguage")}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred language for chatting with Mr. Sarcastic.
            He speaks them all — with attitude! 😏
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto pr-1">
          {languageOptions.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`
                  w-full p-3 rounded-lg border-2 text-left transition-all duration-200
                  flex items-center gap-3 group
                  ${isSelected
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20"
                  }
                `}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{lang.name}</span>
                    {lang.code !== "auto" && lang.code !== "en" && (
                      <span className="text-xs text-muted-foreground">
                        ({lang.nativeName})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelectorModal;
