import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Music, ExternalLink, Trash2, Smile } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { TypingAnimation } from "@/components/TypingAnimation";
import { ClearChatDialog } from "@/components/ClearChatDialog";
import { ExportDropdown } from "@/components/ExportDropdown";
import { MoodSelectorModal } from "@/components/MoodSelectorModal";
import PageTransition from "@/components/PageTransition";
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

const Chat = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage);
  const [inputText, setInputText] = useState("");
  const [detectedMood, setDetectedMood] = useState("Neutral");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ message: string, response: string }>>([]);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const [moodSelectorOpen, setMoodSelectorOpen] = useState(false);
  const { toast } = useToast();
  const isInitialLoad = useRef(true);
  const prevMessageCount = useRef(messages.length);

  // Handle mood change from modal
  const handleMoodChange = (mood: string) => {
    setDetectedMood(mood.charAt(0).toUpperCase() + mood.slice(1));
    toast({
      title: "Mood Changed!",
      description: `Your mood is now set to ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
    });
  };

  // Handle clearing chat history
  const handleClearChat = () => {
    setMessages([getDefaultWelcomeMessage()]);
    setConversationHistory([]);
    setDetectedMood("Neutral");
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setClearChatDialogOpen(false);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

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

  const handleGoToSong = (songId: string) => {
    // Navigate to songs page with the specific song ID as a query parameter
    navigate(`/songs?songId=${songId}`);
  };

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
    setIsLoading(true);

    try {
      // Call the backend chat API using the API service
      const response = await api.post('/chat/send', {
        message: currentInput,
        conversationHistory: conversationHistory,
        userMood: detectedMood.toLowerCase() // Send user's selected mood to backend
      });

      const data = response.data;

      if (data.success) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.message,
          isUser: false,
          timestamp: new Date(),
          mood: data.data.mood,
          confidence: data.data.confidence,
          songData: data.data.songData,
          isTyping: true // Enable typing animation for new messages
        };

        setMessages((prev) => [...prev, botResponse]);
        // Don't overwrite user's selected mood - it should persist until manually changed
        // setDetectedMood(data.data.mood.charAt(0).toUpperCase() + data.data.mood.slice(1));

        // Update conversation history
        setConversationHistory(prev => [...prev, {
          message: currentInput,
          response: data.data.message
        }].slice(-10)); // Keep last 10 exchanges

      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Oops! Something went wrong with my sarcasm circuits. Try again, I promise to be extra snarky next time!",
        isUser: false,
        timestamp: new Date(),
        mood: "neutral",
        confidence: 0.5
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
              <div className="p-3 sm:p-4 border-b border-primary/20">
                <h2 className="text-lg sm:text-xl font-bold text-primary">Chat with Mr Sarcastic</h2>

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
                      <p className="text-xs text-muted-foreground">Current Mood</p>
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
                    className={`${detectedMood.toLowerCase() === 'toxic'
                      ? 'bg-red-500 text-white'
                      : 'bg-accent/20 text-accent-foreground'
                      } cursor-pointer`}
                    onClick={() => setMoodSelectorOpen(true)}
                  >
                    Change Mood
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 overscroll-contain scroll-smooth">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 animate-fade-in ${message.isUser ? "justify-end" : "justify-start"
                      }`}
                  >
                    {!message.isUser && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl ${message.isUser
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-muted-foreground rounded-bl-md"
                        }`}
                    >
                      <p className="text-sm">
                        {!message.isUser && message.isTyping ? (
                          <TypingAnimation
                            text={message.text}
                            speed={20}
                            onComplete={() => {
                              // Mark typing as complete
                              setMessages(prev =>
                                prev.map(msg =>
                                  msg.id === message.id
                                    ? { ...msg, isTyping: false }
                                    : msg
                                )
                              );
                            }}
                          />
                        ) : (
                          message.text
                        )}
                      </p>

                      {/* Song Recommendation Button */}
                      {!message.isUser && message.songData && (
                        <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
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
                              onClick={() => handleGoToSong(message.songData!.id)}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Music className="w-3 h-3" />
                              Listen on Songs Page
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
                            <span className="text-xs opacity-60">
                              {message.mood}
                            </span>
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
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-primary/20">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message here..."
                    onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Mr. Sarcastic is thinking of something witty...
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Mood & Song Suggestions */}
          <div className="space-y-4">
            <Card className="p-4 border-primary/20">
              <h3 className="font-semibold text-primary mb-3">Mood-Based Songs</h3>
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                  <h4 className="font-medium text-sm">Chill Vibes</h4>
                  <p className="text-xs text-muted-foreground">Lofi Hip Hop Mix</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                  <h4 className="font-medium text-sm">Energetic</h4>
                  <p className="text-xs text-muted-foreground">Upbeat Pop Hits</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                  <h4 className="font-medium text-sm">Focus Mode</h4>
                  <p className="text-xs text-muted-foreground">Instrumental Study</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary">Quick Actions</h3>
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
                  Clear Chat History
                </Button>
                <ExportDropdown messages={messages} disabled={messages.length <= 1} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setMoodSelectorOpen(true)}
                >
                  <Smile className="w-4 h-4" />
                  Change Mood
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
    </div>
  );
};

export default Chat;