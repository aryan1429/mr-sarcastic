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
import { Heart, LogOut, MessageCircle, Music, Settings, Upload, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const Profile = () => {
  const { user: authUser, logout, updateUser, isAuthenticated, loading: authLoading } = useAuth();

  // Debug authentication state
  console.log('Profile - Auth State:', {
    authUser: !!authUser,
    isAuthenticated,
    authLoading,
    hasToken: !!localStorage.getItem('authToken')
  });

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
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
    console.log('Profile useEffect - Auth check:', { isAuthenticated, authLoading });
    if (isAuthenticated && !authLoading) {
      console.log('Profile - Making API calls');
      fetchUserProfile();
      fetchUserFiles();
      fetchUserStats();
    } else {
      console.log('Profile - Skipping API calls, not authenticated');
    }
  }, [isAuthenticated, authLoading]);

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

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await userService.updateProfile(formData);
      setUserProfile(response.user);
      updateUser(response.user); // Update AuthContext
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

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingProfilePic(true);
    try {
      const response = await userService.updateProfilePicture(file);
      setUserProfile(response.user);
      updateUser(response.user); // Update AuthContext
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setUploadingProfilePic(false);
      // Reset file input
      event.target.value = '';
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

  // Conversations and favorites are now tracked via stats only
  // Actual conversation history is stored in localStorage on the Chat page
  const recentConversations: any[] = [];

  const favoriteSongs: any[] = [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Navigation />

        <PageTransition>
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
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
                {/* Floating decorative elements */}
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
                    {/* Upload Button */}
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

            {/* Profile Tabs */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
                <TabsTrigger value="activity" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Activity</span>
                  <span className="xs:hidden">Activity</span>
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

              <TabsContent value="activity" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Conversations</h3>
                  <div className="space-y-4">
                    {recentConversations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No conversations yet</p>
                        <p className="text-sm">Start chatting with Mr. Sarcastic to see your history here</p>
                      </div>
                    ) : (
                      recentConversations.map((conversation) => (
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
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="music" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Favorite Songs</h3>
                  <div className="space-y-4">
                    {favoriteSongs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No favorite songs yet</p>
                        <p className="text-sm">Songs you favorite will appear here</p>
                      </div>
                    ) : (
                      favoriteSongs.map((song) => (
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
                      ))
                    )}
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
                  <h3 className="text-lg font-semibold mb-6">Profile Settings</h3>

                  {/* Profile Picture Section */}
                  <div className="mb-6 pb-6 border-b">
                    <Label className="text-sm font-medium">Profile Picture</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={displayUser?.picture} alt={displayUser?.name || "User"} />
                        <AvatarFallback className="text-lg">
                          {displayUser?.name?.split(' ').map((n: string) => n[0]).join('') || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          id="settings-profile-picture-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('settings-profile-picture-upload')?.click()}
                          disabled={uploadingProfilePic}
                          className="flex items-center gap-2"
                        >
                          {uploadingProfilePic ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4" />
                              Change Picture
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Upload an image (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your display name"
                        className="mt-1"
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
                        className="mt-1"
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
                        className="mt-1"
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
        </PageTransition>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
