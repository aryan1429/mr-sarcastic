import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Music, Settings, Heart, Calendar, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Profile = () => {
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder.svg",
    joinDate: "March 2024",
    totalChats: 47,
    favoriteSongs: 23,
    preferredMood: "Chill"
  });

  const recentConversations = [
    {
      id: "1",
      title: "Music recommendations for studying",
      date: "2024-01-15",
      messages: 12,
      mood: "Focus"
    },
    {
      id: "2", 
      title: "Feeling stressed about work",
      date: "2024-01-14",
      messages: 8,
      mood: "Stressed"
    },
    {
      id: "3",
      title: "Happy Friday vibes!",
      date: "2024-01-12",
      messages: 15,
      mood: "Happy"
    }
  ];

  const favoriteSongs = [
    {
      id: "1",
      title: "Lofi Study Session",
      artist: "ChillBeats",
      addedDate: "2024-01-15"
    },
    {
      id: "2",
      title: "Deep Focus Flow", 
      artist: "ConcentrationBeats",
      addedDate: "2024-01-14"
    },
    {
      id: "3",
      title: "Zen Garden",
      artist: "PeacefulSounds", 
      addedDate: "2024-01-12"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-8 border-primary/20">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-primary mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{user.totalChats}</div>
                    <div className="text-xs text-muted-foreground">Total Chats</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{user.favoriteSongs}</div>
                    <div className="text-xs text-muted-foreground">Favorite Songs</div>
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">{user.preferredMood}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">Preferred Mood</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.joinDate}</div>
                    <div className="text-xs text-muted-foreground">Member Since</div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="shrink-0">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Profile Content */}
          <Tabs defaultValue="conversations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Conversations
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="space-y-4">
              <h2 className="text-xl font-semibold text-primary mb-4">Recent Conversations</h2>
              {recentConversations.map((conversation) => (
                <Card key={conversation.id} className="p-4 hover:shadow-md transition-shadow border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{conversation.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {conversation.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {conversation.messages} messages
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conversation.mood}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Chat
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <h2 className="text-xl font-semibold text-primary mb-4">Favorite Songs</h2>
              {favoriteSongs.map((song) => (
                <Card key={song.id} className="p-4 hover:shadow-md transition-shadow border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Added {song.addedDate}</p>
                      <Button variant="ghost" size="sm" className="mt-1">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Your Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-primary/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Activity Overview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total time chatting</span>
                      <span className="font-medium">2h 34m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average session</span>
                      <span className="font-medium">12 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Longest conversation</span>
                      <span className="font-medium">45 minutes</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-primary/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Music Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Most requested mood</span>
                      <Badge variant="secondary">Chill</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Songs discovered</span>
                      <span className="font-medium">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Playlists created</span>
                      <span className="font-medium">7</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;