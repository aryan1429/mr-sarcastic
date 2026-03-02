import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { storageService, userService } from "@/services/api";
import {
  Heart, LogOut, MessageCircle, Music, Settings, Upload, Camera,
  Trophy, Star, Zap, Target, Award, Crown, TrendingUp,
  Calendar, Mail, Shield, Trash2, Download, ExternalLink,
  Flame, Clock
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

const Profile = () => {
  const { user: authUser, logout, updateUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    preferences: {
      favoriteGenre: "",
      preferredMood: ""
    }
  });
  const [userStats, setUserStats] = useState({
    totalChats: 0,
    favoriteSongsCount: 0
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchUserProfile();
      fetchUserFiles();
      fetchUserStats();
      fetchFavoriteSongs();
    }
  }, [isAuthenticated, authLoading]);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getCurrentUser();
      setUserProfile(response.user);
      setFormData({
        name: response.user.name || "",
        bio: response.user.bio || "",
        preferences: response.user.preferences || { favoriteGenre: "", preferredMood: "" }
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFiles = async () => {
    try {
      const response = await storageService.getUserFiles();
      setUserFiles(response.files || []);
    } catch (error) {
      console.error("Failed to load files:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userService.getUserStats();
      if (response.success && response.stats) {
        setUserStats({
          totalChats: response.stats.totalChats || 0,
          favoriteSongsCount: response.stats.favoriteSongsCount || 0
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const fetchFavoriteSongs = async () => {
    try {
      const response = await userService.getFavoriteSongs();
      setFavoriteSongs(response.favorites || response.songs || []);
    } catch (error) {
      console.error("Failed to load favorite songs:", error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await userService.updateProfile(formData);
      setUserProfile(response.user);
      updateUser(response.user);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await storageService.uploadFile(file, "profile");
      toast.success("File uploaded successfully!");
      fetchUserFiles();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingProfilePic(true);
    try {
      const response = await userService.updateProfilePicture(file);
      setUserProfile(response.user);
      updateUser(response.user);
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setUploadingProfilePic(false);
      event.target.value = '';
    }
  };

  const handleRemoveFavorite = async (songId: string) => {
    try {
      await userService.removeFavoriteSong(songId);
      setFavoriteSongs(prev => prev.filter(s => s.id !== songId && s._id !== songId));
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove song");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast.success("Account deleted successfully");
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Load chat history from localStorage
  const chatHistory = useMemo(() => {
    try {
      const stored = localStorage.getItem('mr-sarcastic-chat-history');
      if (stored) {
        const messages = JSON.parse(stored);
        // Group into conversation sessions
        const userMessages = messages.filter((m: any) => m.isUser);
        const botMessages = messages.filter((m: any) => !m.isUser);
        return {
          totalMessages: messages.length,
          userMessages: userMessages.length,
          botMessages: botMessages.length,
          lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
          recentMessages: messages.slice(-10).reverse()
        };
      }
    } catch (e) { }
    return { totalMessages: 0, userMessages: 0, botMessages: 0, lastMessage: null, recentMessages: [] };
  }, []);

  // Compute achievements
  const achievements = useMemo(() => {
    const list = [
      {
        id: 'first_chat', name: 'First Chat', description: 'Started your first conversation',
        icon: '💬', earned: userStats.totalChats > 0 || chatHistory.totalMessages > 1,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'chat_master', name: 'Chat Master', description: 'Sent 50+ messages',
        icon: '🔥', earned: chatHistory.userMessages >= 50,
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'music_lover', name: 'Music Lover', description: 'Favorited 5+ songs',
        icon: '🎵', earned: userStats.favoriteSongsCount >= 5 || favoriteSongs.length >= 5,
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: 'profile_complete', name: 'Profile Pro', description: 'Set your genre & mood preferences',
        icon: '⭐', earned: !!formData.preferences.favoriteGenre && !!formData.preferences.preferredMood,
        color: 'from-yellow-500 to-amber-500'
      },
      {
        id: 'file_uploader', name: 'File Uploader', description: 'Uploaded your first file',
        icon: '📁', earned: userFiles.length > 0,
        color: 'from-green-500 to-emerald-500'
      },
      {
        id: 'early_adopter', name: 'Early Adopter', description: 'One of the first users!',
        icon: '🚀', earned: true,
        color: 'from-indigo-500 to-violet-500'
      },
    ];
    return list;
  }, [userStats, chatHistory, favoriteSongs, formData, userFiles]);

  const earnedCount = achievements.filter(a => a.earned).length;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
          <Navigation />
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl animate-pulse">
            {/* Skeleton Cover */}
            <div className="h-40 sm:h-52 rounded-2xl bg-muted mb-6" />
            {/* Skeleton Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted" />
              ))}
            </div>
            {/* Skeleton Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-96 rounded-xl bg-muted" />
              <div className="space-y-4">
                <div className="h-40 rounded-xl bg-muted" />
                <div className="h-64 rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const displayUser = userProfile || authUser;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation />

        <PageTransition>
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
            {/* Profile Cover Banner */}
            <div className="relative mb-6 sm:mb-8 rounded-2xl overflow-hidden">
              {/* Gradient Background */}
              <div className="h-40 sm:h-52 bg-gradient-to-br from-primary via-accent to-primary/80 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                    🔥 Active Member
                  </Badge>
                </div>
                <div className="absolute top-8 left-8 w-16 h-16 bg-white/5 rounded-full blur-xl animate-float" />
                <div className="absolute bottom-12 right-12 w-24 h-24 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
              </div>

              {/* Avatar & Info Card */}
              <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                    <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-2xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500">
                      <AvatarImage src={displayUser?.picture} alt={displayUser?.name || "User"} />
                      <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-primary to-accent text-white">
                        {displayUser?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      <input type="file" id="profile-picture-upload" className="hidden" accept="image/*" onChange={handleProfilePictureUpload} />
                      <Button
                        size="sm" variant="secondary"
                        className="w-9 h-9 rounded-full p-0 shadow-lg border-2 border-background hover:scale-110 transition-transform"
                        onClick={() => document.getElementById('profile-picture-upload')?.click()}
                        disabled={uploadingProfilePic}
                      >
                        {uploadingProfilePic ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {displayUser?.name || "User"}
                      </h1>
                      <span className="text-lg" title="Verified">✅</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                    {(formData.bio || displayUser?.bio) && (
                      <p className="text-sm text-muted-foreground/80 italic">"{formData.bio || displayUser?.bio}"</p>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        {formData.preferences.preferredMood || "Chill"} Mood
                      </Badge>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                        {formData.preferences.favoriteGenre || "All Genres"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Joined {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className="p-4 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userStats.totalChats}</div>
                    <div className="text-xs text-muted-foreground">Total Chats</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{userStats.favoriteSongsCount}</div>
                    <div className="text-xs text-muted-foreground">Favorite Songs</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <Trophy className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{earnedCount}/{achievements.length}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Zap className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">{chatHistory.totalMessages}</div>
                    <div className="text-xs text-muted-foreground">Messages</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Tabs */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
                    <TabsTrigger value="activity" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="music" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                      <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Music
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  {/* Activity Tab - Chat History from localStorage */}
                  <TabsContent value="activity" className="space-y-4">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Chat Activity
                        </h3>
                        <div className="flex gap-2">
                          {chatHistory.totalMessages > 1 && (
                            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => {
                              localStorage.removeItem('mr-sarcastic-chat-history');
                              window.location.reload();
                            }}>
                              <Trash2 className="w-3 h-3 mr-1" /> Clear
                            </Button>
                          )}
                          <Badge variant="secondary">{chatHistory.totalMessages} messages</Badge>
                        </div>
                      </div>

                      {chatHistory.totalMessages <= 1 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No conversations yet</p>
                          <p className="text-sm mb-4">Start chatting with Mr. Sarcastic to see your history here</p>
                          <Button size="sm" onClick={() => navigate('/chat')}>Start Chatting</Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Activity Summary */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                              <div className="text-lg font-bold text-blue-500">{chatHistory.userMessages}</div>
                              <div className="text-xs text-muted-foreground">You sent</div>
                            </div>
                            <div className="p-3 rounded-lg bg-primary/10 text-center">
                              <div className="text-lg font-bold text-primary">{chatHistory.botMessages}</div>
                              <div className="text-xs text-muted-foreground">Bot replied</div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10 text-center">
                              <div className="text-lg font-bold text-green-500">
                                {chatHistory.lastMessage ? new Date(chatHistory.lastMessage.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                              </div>
                              <div className="text-xs text-muted-foreground">Last active</div>
                            </div>
                          </div>

                          {/* Recent Messages */}
                          <h4 className="text-sm font-medium text-muted-foreground">Recent Messages</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {chatHistory.recentMessages.map((msg: any, i: number) => (
                              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${msg.isUser ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-transparent'} transition-colors`}>
                                <div className={`p-1.5 rounded-full ${msg.isUser ? 'bg-accent/20' : 'bg-primary/20'} shrink-0`}>
                                  {msg.isUser ? <Flame className="w-3 h-3 text-accent" /> : <Flame className="w-3 h-3 text-primary" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{msg.text}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.mood && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{msg.mood}</Badge>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* Music Tab - Real Favorites from API */}
                  <TabsContent value="music" className="space-y-4">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Heart className="w-5 h-5 text-accent" />
                          Favorite Songs
                        </h3>
                        <Button size="sm" variant="outline" onClick={() => navigate('/songs')}>
                          <Music className="w-3.5 h-3.5 mr-1.5" /> Browse Songs
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {favoriteSongs.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No favorite songs yet</p>
                            <p className="text-sm mb-4">Heart songs to save them to your collection</p>
                            <Button size="sm" onClick={() => navigate('/songs')}>Discover Music</Button>
                          </div>
                        ) : (
                          favoriteSongs.map((song: any) => (
                            <div key={song.id || song._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-all duration-200 group">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                                  <Music className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-medium text-sm truncate">{song.title}</h4>
                                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className="text-[10px]">{song.mood}</Badge>
                                {song.youtubeUrl && (
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.open(song.youtubeUrl, '_blank')}>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveFavorite(song.id || song._id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Files Tab */}
                  <TabsContent value="files" className="space-y-4">
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Upload className="w-5 h-5 text-primary" />
                          Your Files
                        </h3>
                        <div>
                          <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*,text/*,application/pdf" />
                          <Button
                            onClick={() => document.getElementById('file-upload')?.click()}
                            disabled={uploadingFile}
                            className="flex items-center gap-2"
                            size="sm"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingFile ? "Uploading..." : "Upload File"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {userFiles.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No files uploaded yet</p>
                            <p className="text-sm">Upload your first file to get started</p>
                          </div>
                        ) : (
                          userFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Upload className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{file.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {file.contentType} • {Math.round(file.size / 1024)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                {new Date(file.created).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Settings Tab - Enhanced */}
                  <TabsContent value="settings" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Profile Settings
                      </h3>

                      {/* Profile Picture Section */}
                      <div className="mb-6 pb-6 border-b">
                        <Label className="text-sm font-medium">Profile Picture</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={displayUser?.picture} alt={displayUser?.name || "User"} />
                            <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-white">
                              {displayUser?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-2">
                            <input type="file" id="settings-profile-picture-upload" className="hidden" accept="image/*" onChange={handleProfilePictureUpload} />
                            <Button
                              variant="outline" size="sm"
                              onClick={() => document.getElementById('settings-profile-picture-upload')?.click()}
                              disabled={uploadingProfilePic}
                              className="flex items-center gap-2"
                            >
                              {uploadingProfilePic ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Uploading...</>
                              ) : (
                                <><Camera className="w-4 h-4" /> Change Picture</>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground">Upload an image (max 5MB)</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Display Name</Label>
                          <Input
                            id="name" value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your display name" className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio / Status</Label>
                          <Input
                            id="bio" value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="e.g., Sarcasm enthusiast 🔥" className="mt-1"
                            maxLength={100}
                          />
                          <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/100 characters</p>
                        </div>
                        <div>
                          <Label htmlFor="favorite-genre">Favorite Music Genre</Label>
                          <Input
                            id="favorite-genre" value={formData.preferences.favoriteGenre}
                            onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, favoriteGenre: e.target.value } })}
                            placeholder="e.g., Lo-fi, Pop, Classical" className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="preferred-mood">Preferred Mood</Label>
                          <Input
                            id="preferred-mood" value={formData.preferences.preferredMood}
                            onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, preferredMood: e.target.value } })}
                            placeholder="e.g., Chill, Energetic, Focus" className="mt-1"
                          />
                        </div>
                        <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
                          {isUpdating ? "Updating..." : "Save Changes"}
                        </Button>
                      </div>
                    </Card>

                    {/* Account Info */}
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Account Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" /> Email
                          </div>
                          <span className="text-sm font-medium">{displayUser?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" /> Joined
                          </div>
                          <span className="text-sm font-medium">
                            {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="w-4 h-4" /> Account Type
                          </div>
                          <Badge variant="secondary">Free</Badge>
                        </div>
                      </div>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="p-6 border-red-500/20">
                      <h3 className="text-lg font-semibold mb-2 text-red-500 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      {showDeleteConfirm ? (
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                            Yes, Delete My Account
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setShowDeleteConfirm(true)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                        </Button>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-4">
                {/* Quick Actions */}
                <Card className="p-4 border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => navigate('/chat')}>
                      <MessageCircle className="w-4 h-4 text-primary" /> Start Chatting
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => navigate('/songs')}>
                      <Music className="w-4 h-4 text-accent" /> Browse Songs
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => {
                      const data = JSON.stringify({ profile: displayUser, stats: userStats, chatHistory: chatHistory.totalMessages }, null, 2);
                      const blob = new Blob([data], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "mr-sarcastic-profile-export.json"; a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Profile data exported!");
                    }}>
                      <Download className="w-4 h-4 text-green-500" /> Export My Data
                    </Button>
                  </div>
                </Card>

                {/* Achievements */}
                <Card className="p-4 border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Achievements
                    <Badge variant="secondary" className="ml-auto text-xs">{earnedCount}/{achievements.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${achievement.earned
                          ? 'bg-gradient-to-r ' + achievement.color + '/10 border-transparent hover:scale-[1.02]'
                          : 'bg-muted/30 border-dashed border-muted-foreground/20 opacity-50'
                          }`}
                      >
                        <span className="text-lg">{achievement.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium truncate">{achievement.name}</h4>
                          <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
                        </div>
                        {achievement.earned && (
                          <span className="text-green-500 text-xs">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </PageTransition>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
