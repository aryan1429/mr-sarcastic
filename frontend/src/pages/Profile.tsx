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
import { Heart, LogOut, MessageCircle, Music, Settings, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    preferences: {
      favoriteGenre: "",
      preferredMood: ""
    }
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserFiles();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getCurrentUser();
      setUserProfile(response.user);
      setFormData({
        name: response.user.name || "",
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

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await userService.updateProfile(formData);
      setUserProfile(response.user);
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
      const response = await storageService.uploadFile(file, "profile");
      toast.success("File uploaded successfully!");
      fetchUserFiles(); // Refresh files list
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const displayUser = userProfile || authUser;

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
      mood: "Focus",
      plays: 23
    },
    {
      id: "2",
      title: "Upbeat Pop Mix",
      artist: "EnergyVibes",
      mood: "Happy",
      plays: 45
    },
    {
      id: "3",
      title: "Relaxing Nature Sounds",
      artist: "CalmSpace",
      mood: "Chill",
      plays: 12
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={displayUser?.picture} alt={displayUser?.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {displayUser?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary mb-2">{displayUser?.name || "User"}</h1>
              <p className="text-muted-foreground mb-4">{displayUser?.email}</p>
              
              <div className="flex justify-center gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">47</div>
                  <div className="text-sm text-muted-foreground">Total Chats</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">23</div>
                  <div className="text-sm text-muted-foreground">Favorite Songs</div>
                </div>
                <div>
                  <Badge variant="secondary" className="text-xs">{formData.preferences.preferredMood || "Chill"}</Badge>
                  <div className="text-sm text-muted-foreground mt-1">Mood</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : "Recently"}</div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Conversations</h3>
                <div className="space-y-4">
                  {recentConversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{conversation.title}</h4>
                          <p className="text-sm text-muted-foreground">{conversation.messages} messages</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{conversation.mood}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">{conversation.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Favorite Songs</h3>
                <div className="space-y-4">
                  {favoriteSongs.map((song) => (
                    <div key={song.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Music className="w-5 h-5 text-accent" />
                        <div>
                          <h4 className="font-medium">{song.title}</h4>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <Badge variant="outline">{song.mood}</Badge>
                        <div className="text-sm text-muted-foreground">{song.plays} plays</div>
                        <Heart className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Your Files</h3>
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,text/*,application/pdf"
                    />
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploadingFile}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingFile ? "Uploading..." : "Upload File"}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {userFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No files uploaded yet</p>
                      <p className="text-sm">Upload your first file to get started</p>
                    </div>
                  ) : (
                    userFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Upload className="w-5 h-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {file.contentType} • {Math.round(file.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {new Date(file.created).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="favorite-genre">Favorite Music Genre</Label>
                    <Input
                      id="favorite-genre"
                      value={formData.preferences.favoriteGenre}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences, favoriteGenre: e.target.value }
                      })}
                      placeholder="e.g., Lo-fi, Pop, Classical"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferred-mood">Preferred Mood</Label>
                    <Input
                      id="preferred-mood"
                      value={formData.preferences.preferredMood}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences, preferredMood: e.target.value }
                      })}
                      placeholder="e.g., Chill, Energetic, Focus"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      {isUpdating ? "Updating..." : "Update Profile"}
                    </Button>
                    
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
