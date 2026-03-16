import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, Loader2, Music, ExternalLink, Trash2, Smile, Play, Pause, ListPlus, Zap, Globe } from "lucide-react";
import chatbotLogo from "@/assets/new-chatbot.png";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/TypingAnimation";
import { ClearChatDialog } from "@/components/ClearChatDialog";
import { ExportDropdown } from "@/components/ExportDropdown";
import { ConnectionStatusBanner } from "@/components/ConnectionStatusBanner";
import { MoodSelectorModal } from "@/components/MoodSelectorModal";
import { LanguageSelectorModal } from "@/components/LanguageSelectorModal";
import PageTransition from "@/components/PageTransition";
import { songsService } from "@/services/songsService";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  mood?: string;
  confidence?: number;
  isTyping?: boolean;
  songData?: {
    id: string;
    title: string;
    artist: string;
    mood: string;
    duration: string;
    youtubeUrl: string;
    thumbnail?: string;
  } | null;
}

const CHAT_STORAGE_KEY = 'mr-sarcastic-chat-history';

const getDefaultWelcomeMessage = (): Message => ({
  id: "1",
  text: "Hey there! I'm Mr Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. What's on your mind today?",
  isUser: false,
  timestamp: new Date(),
  mood: "neutral",
  confidence: 1.0,
  isTyping: false
});

const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
  return [getDefaultWelcomeMessage()];
};

/** Memoized chat message bubble for render optimization */
const ChatMessage = memo(({
  message,
  onTypingComplete,
  onGoToSong,
  onPlaySong,
}: {
  message: Message;
  onTypingComplete: (id: string) => void;
  onGoToSong: (songId: string) => void;
  onPlaySong: (songData: NonNullable<Message['songData']>) => void;
}) => {
  return (
    <div
      className={`flex gap-2 sm:gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
      style={{
        animation: `${message.isUser ? 'slideInRight' : 'slideInLeft'} 0.35s cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      {!message.isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-2 ring-primary/10"
          style={{
            transitionProperty: "box-shadow, transform",
            transitionDuration: "300ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <img src={chatbotLogo} alt="Mr Sarcastic" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl ${message.isUser
          ? "bg-primary text-primary-foreground rounded-br-md shadow-lg shadow-primary/20"
          : "bg-muted text-muted-foreground rounded-bl-md shadow-sm"
          }`}
        style={{
          transitionProperty: "box-shadow, transform",
          transitionDuration: "200ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p className="text-sm">
          {!message.isUser && message.isTyping ? (
            <TypingAnimation
              text={message.text}
              speed={20}
              onComplete={() => onTypingComplete(message.id)}
            />
          ) : (
            message.text
          )}
        </p>

        {/* Song Recommendation Button */}
        {!message.isUser && message.songData && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20"
            style={{
              animation: "smoothSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Recommended Song</span>
            </div>
            <div className="text-sm">
              <p className="font-medium">{message.songData.title}</p>
              <p className="text-xs opacity-70">by {message.songData.artist}</p>
              <p className="text-xs opacity-60">{message.songData.duration} • {message.songData.mood}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => onPlaySong(message.songData!)}
                className="flex items-center gap-1 text-xs"
              >
                <Play className="w-3 h-3" />
                Play Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGoToSong(message.songData!.id)}
                className="flex items-center gap-1 text-xs"
              >
                <Music className="w-3 h-3" />
                Songs Page
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(message.songData!.youtubeUrl, '_blank')}
                className="flex items-center gap-1 text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                YouTube
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {!message.isUser && message.mood && (
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{message.mood}</span>
              {message.confidence && (
                <span className="text-xs opacity-60">
                  ({Math.round(message.confidence * 100)}%)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {message.isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 ring-2 ring-accent/10"
          style={{
            transitionProperty: "box-shadow, transform",
            transitionDuration: "300ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Only re-render if typing state changes or if it's a different message
  return prev.message.id === next.message.id
    && prev.message.isTyping === next.message.isTyping
    && prev.message.text === next.message.text;
});

ChatMessage.displayName = "ChatMessage";

const Chat = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { playSong: playMusicSong, addToQueue } = useMusicPlayer();
  const { language, currentLanguage, t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage);
  const [inputText, setInputText] = useState("");
  const [detectedMood, setDetectedMood] = useState("Neutral");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ message: string, response: string }>>([]);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const [moodSelectorOpen, setMoodSelectorOpen] = useState(false);
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<string[]>([]);
  const { toast } = useToast();
  const isInitialLoad = useRef(true);
  const prevMessageCount = useRef(messages.length);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { isOnline, isServerReachable } = useConnectionStatus();
  const isConnected = isOnline && isServerReachable;

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle mood change from modal
  const handleMoodChange = useCallback((mood: string) => {
    setDetectedMood(mood.charAt(0).toUpperCase() + mood.slice(1));
    toast({
      title: "Mood Changed!",
      description: `Your mood is now set to ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
    });
  }, [toast]);

  // Handle clearing chat history
  const handleClearChat = useCallback(() => {
    setMessages([getDefaultWelcomeMessage()]);
    setConversationHistory([]);
    setDetectedMood("Neutral");
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setClearChatDialogOpen(false);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  }, [toast]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [messages]);

  // Auto-scroll to bottom ONLY when new messages are added (not on initial load)
  useEffect(() => {
    // Skip scroll on initial load/reload
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevMessageCount.current = messages.length;
      return;
    }

    // Only scroll if messages were actually added
    if (messages.length > prevMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevMessageCount.current = messages.length;
  }, [messages]);

  const handleGoToSong = useCallback((songId: string) => {
    // Navigate to songs page with the specific song ID as a query parameter
    navigate(`/songs?songId=${songId}`);
  }, [navigate]);

  const handleTypingComplete = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg
      )
    );
  }, []);

  const handlePlaySongFromChat = useCallback((songData: NonNullable<Message['songData']>) => {
    const song = {
      id: songData.id,
      title: songData.title,
      artist: songData.artist,
      mood: songData.mood,
      duration: songData.duration,
      youtubeUrl: songData.youtubeUrl,
      thumbnail: songData.thumbnail || '',
    };
    playMusicSong(song);
    toast({ title: "Now Playing", description: `${song.title} by ${song.artist}` });
  }, [playMusicSong, toast]);

  // Send a single message to the API
  const sendMessageToAPI = useCallback(async (messageText: string) => {
    // Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const response = await api.post('/chat/send', {
      message: messageText,
      conversationHistory: conversationHistory,
      userMood: detectedMood.toLowerCase(),
      language: language,
    }, {
      signal: controller.signal,
    });

    return response.data;
  }, [conversationHistory, detectedMood, language]);

  // Process pending messages queue when connection is restored
  useEffect(() => {
    if (!isConnected || pendingMessages.length === 0 || isLoading) return;

    const processQueue = async () => {
      const queue = [...pendingMessages];
      setPendingMessages([]);

      for (const msg of queue) {
        setIsLoading(true);
        try {
          const data = await sendMessageToAPI(msg);
          if (data.success) {
            const botResponse: Message = {
              id: (Date.now() + 1).toString(),
              text: data.data.message,
              isUser: false,
              timestamp: new Date(),
              mood: data.data.mood,
              confidence: data.data.confidence,
              songData: data.data.songData,
              isTyping: true,
            };
            setMessages((prev) => [...prev, botResponse]);
            setConversationHistory(prev => [...prev, {
              message: msg,
              response: data.data.message
            }].slice(-10));
          }
        } catch (error) {
          console.error('Failed to send queued message:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (queue.length > 0) {
        toast({
          title: "Messages Sent!",
          description: `${queue.length} queued message${queue.length > 1 ? 's' : ''} delivered successfully.`,
        });
      }
    };

    processQueue();
  }, [isConnected, pendingMessages, isLoading, sendMessageToAPI, toast]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentInput = inputText;
    setInputText("");

    // If offline, queue the message instead of sending
    if (!isConnected) {
      setPendingMessages(prev => [...prev, currentInput]);
      const queuedResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "⏳ You're offline — I'll respond as soon as you're back online!",
        isUser: false,
        timestamp: new Date(),
        mood: "neutral",
        confidence: 0.5,
      };
      setMessages((prev) => [...prev, queuedResponse]);
      return;
    }

    setIsLoading(true);

    try {
      const data = await sendMessageToAPI(currentInput);

      if (data.success) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.message,
          isUser: false,
          timestamp: new Date(),
          mood: data.data.mood,
          confidence: data.data.confidence,
          songData: data.data.songData,
          isTyping: true,
        };

        setMessages((prev) => [...prev, botResponse]);
        setConversationHistory(prev => [...prev, {
          message: currentInput,
          response: data.data.message
        }].slice(-10));
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error: any) {
      console.error('Error sending message:', error);

      // Determine error type for specific messaging
      let errorText = "Oops! Something went wrong with my sarcasm circuits. Try again, I promise to be extra snarky next time!";

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorText = "⏱️ That took too long! The server might be waking up. Tap 'Retry' to try again.";
      } else if (error.response?.status === 429) {
        errorText = "🐢 Slow down there, speedster! You're sending messages too fast. Wait a moment and try again.";
      } else if (!navigator.onLine) {
        errorText = "📡 Looks like you lost your connection. I'll be here when you're back online!";
      } else if (error.response?.status >= 500) {
        errorText = "🔧 Server hiccup! The team is on it. Tap 'Retry' to try again.";
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        mood: "neutral",
        confidence: 0.5,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col">
      <Navigation />
      <PageTransition>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100dvh-12rem)] sm:h-[600px] flex flex-col border-primary/20 shadow-lg">
                <ConnectionStatusBanner />
                <div className="p-3 sm:p-4 border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-primary">{t("chatTitle")}</h2>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-400 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800/60 cursor-pointer transition-colors shadow-sm"
                      onClick={() => setLanguageSelectorOpen(true)}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      {currentLanguage.flag} {currentLanguage.name}
                    </Badge>
                  </div>

                  {/* Prominent Mood Indicator Card */}
                  <div className={`mt-3 p-3 rounded-lg border-2 flex items-center justify-between ${detectedMood.toLowerCase() === 'toxic'
                    ? 'bg-red-100 dark:bg-red-950 border-red-500'
                    : detectedMood.toLowerCase() === 'happy'
                      ? 'bg-yellow-100 dark:bg-yellow-950 border-yellow-500'
                      : detectedMood.toLowerCase() === 'sad'
                        ? 'bg-blue-100 dark:bg-blue-950 border-blue-500'
                        : detectedMood.toLowerCase() === 'energetic'
                          ? 'bg-orange-100 dark:bg-orange-950 border-orange-500'
                          : detectedMood.toLowerCase() === 'calm' || detectedMood.toLowerCase() === 'chill'
                            ? 'bg-green-100 dark:bg-green-950 border-green-500'
                            : detectedMood.toLowerCase() === 'focused'
                              ? 'bg-purple-100 dark:bg-purple-950 border-purple-500'
                              : 'bg-muted/50 border-muted-foreground/30'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {detectedMood.toLowerCase() === 'toxic' ? '😈' :
                          detectedMood.toLowerCase() === 'happy' ? '😊' :
                            detectedMood.toLowerCase() === 'sad' ? '😢' :
                              detectedMood.toLowerCase() === 'energetic' ? '⚡' :
                                detectedMood.toLowerCase() === 'calm' || detectedMood.toLowerCase() === 'chill' ? '☁️' :
                                  detectedMood.toLowerCase() === 'focused' ? '🎯' : '😐'}
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("currentMood")}</p>
                        <p className={`font-bold text-lg ${detectedMood.toLowerCase() === 'toxic' ? 'text-red-600' :
                          detectedMood.toLowerCase() === 'happy' ? 'text-yellow-600' :
                            detectedMood.toLowerCase() === 'sad' ? 'text-blue-600' :
                              detectedMood.toLowerCase() === 'energetic' ? 'text-orange-600' :
                                detectedMood.toLowerCase() === 'calm' || detectedMood.toLowerCase() === 'chill' ? 'text-green-600' :
                                  detectedMood.toLowerCase() === 'focused' ? 'text-purple-600' : 'text-foreground'
                          }`}>{detectedMood}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-400 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/60 cursor-pointer transition-colors shadow-sm shadow-green-200/50 dark:shadow-green-900/30"
                      onClick={() => setMoodSelectorOpen(true)}
                    >
                      {t("changeMood")}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 overscroll-contain custom-scrollbar"
                  style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
                >
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onTypingComplete={handleTypingComplete}
                      onGoToSong={handleGoToSong}
                      onPlaySong={handlePlaySongFromChat}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-primary/20">
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        detectedMood.toLowerCase() === 'happy' ? "Feeling good? Share the vibes! 😊" :
                          detectedMood.toLowerCase() === 'sad' ? "What's on your mind? I'm here... 💙" :
                            detectedMood.toLowerCase() === 'energetic' ? "Let's gooo! What's up? ⚡" :
                              detectedMood.toLowerCase() === 'calm' || detectedMood.toLowerCase() === 'chill' ? "Feeling chill? Tell me about it... ☁️" :
                                detectedMood.toLowerCase() === 'focused' ? "Stay focused! What do you need? 🎯" :
                                  detectedMood.toLowerCase() === 'toxic' ? "Bring it on, I can handle it... 😈" :
                                    t("typeMessage")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      enterKeyHint="send"
                      autoComplete="off"
                      autoCorrect="on"
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="shrink-0"
                      disabled={isLoading || !inputText.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2"
                      style={{ animation: "smoothFadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both" }}
                    >
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s', animationDuration: '0.6s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s', animationDuration: '0.6s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.6s' }} />
                      </span>
                      {detectedMood.toLowerCase() === 'toxic' ? "Mr. Sarcastic is cooking up some venom... 🐍" :
                        detectedMood.toLowerCase() === 'happy' ? "Mr. Sarcastic is vibing with your energy... ✨" :
                          detectedMood.toLowerCase() === 'sad' ? "Mr. Sarcastic is finding the right words... 💭" :
                            detectedMood.toLowerCase() === 'energetic' ? "Mr. Sarcastic is matching your energy... 🔥" :
                              "Mr. Sarcastic is thinking of something witty..."}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Mood & Song Suggestions */}
            <div className="space-y-4">
              <Card className="p-4 border-primary/20 hover-lift relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
                <div className="flex items-center gap-2 mb-3">
                  <Music className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-primary">{t("quickPlay")}</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { mood: 'Chill', emoji: '😌', desc: 'Lofi & Ambient', hoverColor: 'hover:bg-green-500/10 hover:border-green-500/30' },
                    { mood: 'Energetic', emoji: '⚡', desc: 'Upbeat Pop & Rock', hoverColor: 'hover:bg-orange-500/10 hover:border-orange-500/30' },
                    { mood: 'Focus', emoji: '🎯', desc: 'Study & Concentration', hoverColor: 'hover:bg-purple-500/10 hover:border-purple-500/30' },
                    { mood: 'Happy', emoji: '😊', desc: 'Feel-Good Hits', hoverColor: 'hover:bg-yellow-500/10 hover:border-yellow-500/30' },
                    { mood: 'Sad', emoji: '😢', desc: 'Emotional Ballads', hoverColor: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
                    { mood: 'Relaxed', emoji: '🍃', desc: 'Calm & Peaceful', hoverColor: 'hover:bg-teal-500/10 hover:border-teal-500/30' },
                  ].map(({ mood, emoji, desc, hoverColor }) => (
                    <div
                      key={mood}
                      className={`p-3 bg-muted/50 rounded-lg border border-transparent ${hoverColor} hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-3 group`}
                      onClick={async () => {
                        try {
                          const moodSongs = await songsService.getSongsByMood(mood, 10);
                          if (moodSongs.length > 0) {
                            const shuffled = [...moodSongs].sort(() => Math.random() - 0.5);
                            playMusicSong(shuffled[0], shuffled);
                            toast({ title: `${emoji} ${mood} vibes`, description: `Playing ${shuffled.length} ${mood.toLowerCase()} songs` });
                          } else {
                            toast({ title: "No songs found", description: `No ${mood} songs available`, variant: "destructive" });
                          }
                        } catch {
                          toast({ title: "Couldn't load songs", variant: "destructive" });
                        }
                      }}
                    >
                      <span className="text-lg">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{mood}</h4>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Play className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-primary/20 hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-primary">{t("quickActions")}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setClearChatDialogOpen(true)}
                    disabled={messages.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("clearChat")}
                  </Button>
                  <ExportDropdown messages={messages} disabled={messages.length <= 1} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/songs')}
                  >
                    <Music className="w-4 h-4" />
                    {t("browseSongs")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30"
                    onClick={() => setLanguageSelectorOpen(true)}
                  >
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {t("changeLanguage")} ({currentLanguage.flag})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 shadow-sm shadow-green-200/50 dark:shadow-green-900/30"
                    onClick={() => setMoodSelectorOpen(true)}
                  >
                    <Smile className="w-4 h-4 text-green-600 dark:text-green-400" />
                    {t("changeMood")}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </PageTransition>
      <Footer />
      <ClearChatDialog
        open={clearChatDialogOpen}
        onOpenChange={setClearChatDialogOpen}
        onConfirm={handleClearChat}
      />
      <MoodSelectorModal
        open={moodSelectorOpen}
        onOpenChange={setMoodSelectorOpen}
        currentMood={detectedMood}
        onMoodChange={handleMoodChange}
      />
      <LanguageSelectorModal
        open={languageSelectorOpen}
        onOpenChange={setLanguageSelectorOpen}
      />
    </div>
  );
};

export default Chat;