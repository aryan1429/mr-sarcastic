import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  mood?: string;
  confidence?: number;
}

const Chat = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey there! I'm Mr Sarcastic, your friendly neighborhood AI with a sense of humor and a love for good music. What's on your mind today?",
      isUser: false,
      timestamp: new Date(),
      mood: "neutral",
      confidence: 1.0
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [detectedMood, setDetectedMood] = useState("Neutral");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{message: string, response: string}>>([]);

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
        conversationHistory: conversationHistory
      });

      const data = response.data;
      
      if (data.success) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.message,
          isUser: false,
          timestamp: new Date(),
          mood: data.data.mood,
          confidence: data.data.confidence
        };

        setMessages((prev) => [...prev, botResponse]);
        setDetectedMood(data.data.mood.charAt(0).toUpperCase() + data.data.mood.slice(1));
        
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col border-primary/20">
              <div className="p-4 border-b border-primary/20">
                <h2 className="text-xl font-bold text-primary">Chat with Mr Sarcastic</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Detected Mood:</span>
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                    {detectedMood}
                  </Badge>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 animate-fade-in ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
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
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
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
              <h3 className="font-semibold text-primary mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Clear Chat History
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Export Conversation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Change Mood
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;