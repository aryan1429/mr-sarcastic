import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Check, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

// Schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

// Google Sign-In button component
const GoogleSignInButton = ({ 
  onGoogleSignIn, 
  isLoading, 
  text = "Continue with Google" 
}: { 
  onGoogleSignIn: (credential: string) => void;
  isLoading: boolean;
  text?: string;
}) => {
  
  // Clean up any existing Google scripts that might cause COOP issues
  useEffect(() => {
    // Remove any existing Google Sign-In scripts
    const existingScripts = document.querySelectorAll('script[src*="gsi/client"]');
    existingScripts.forEach(script => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    });
    
    // Clear any existing Google Sign-In API references
    if ((window as any).google?.accounts?.id) {
      try {
        // Try to cancel any existing flows
        if ((window as any).google.accounts.id.cancel) {
          (window as any).google.accounts.id.cancel();
        }
      } catch (e) {
        // Ignore errors when cleaning up
      }
    }
    
    console.log('Cleaned up existing Google Sign-In scripts');
  }, []);

  // Manual popup-based OAuth flow to bypass COOP restrictions
  const handleManualGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'demo-client-id') {
      console.warn('Google OAuth Client ID not properly configured');
      return;
    }

    console.log('Starting manual Google OAuth popup flow...');
    console.log('Client ID:', clientId);
    console.log('Current origin:', window.location.origin);

    // OAuth 2.0 authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', `${window.location.origin}/auth`);  // Changed from /auth/callback
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('state', 'oauth_state_' + Math.random().toString(36).substr(2, 9));

    console.log('Opening OAuth popup with URL:', authUrl.toString());

    // Open popup window
    const popup = window.open(
      authUrl.toString(),
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      console.error('Failed to open popup window - popup blocked?');
      return;
    }

    // Listen for messages from popup
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.log('Ignoring message from different origin:', event.origin);
        return;
      }
      
      console.log('Received message from popup:', event.data);
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('Google Auth Success - credential received');
        onGoogleSignIn(event.data.credential);
        cleanup();
      } else if (event.data.type === 'GOOGLE_AUTH_COMPLETE') {
        console.log('Google Auth Complete - authentication finished');
        // Authentication is already complete, just redirect and show success
        toast.success("Successfully authenticated with Google!");
        navigate('/');
        cleanup();
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('Google Auth Error:', event.data.error);
        toast.error(event.data.error || "Google authentication failed");
        cleanup();
      }
    };

    // Set a timeout to clean up if the popup doesn't respond
    const cleanup = () => {
      window.removeEventListener('message', messageHandler);
      clearTimeout(timeoutCleanup);
      if (popup) {
        try {
          if (!popup.closed) {
            popup.close();
          }
        } catch (e) {
          console.log('Could not check/close popup window due to COOP restrictions');
          // This is expected with Cross-Origin-Opener-Policy restrictions
        }
      }
      console.log('OAuth popup cleanup completed');
    };

    // Clean up after 5 minutes regardless (avoid memory leaks)
    const timeoutCleanup = setTimeout(cleanup, 5 * 60 * 1000);

    window.addEventListener('message', messageHandler);
  };

  return (
    <div className="w-full space-y-3">      
      {/* Manual Google OAuth Button (only this one) */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleManualGoogleAuth}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"></path>
        </svg>
        {text}
      </Button>
      
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          {text}...
        </div>
      )}
    </div>
  );
};

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Signup form
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const watchedPassword = watch("password", "");

  // Password strength helpers
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchedPassword);
  
  const getStrengthLabel = (strength: number) => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const passwordCriteria = [
    { met: watchedPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(watchedPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(watchedPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(watchedPassword), text: "One number" },
  ];

  // Login handler
  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login({
        email: data.email,
        password: data.password
      });
      
      toast.success("Welcome back! Logged in successfully!");
      navigate('/');
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const onSignupSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await signup({
        username: data.username,
        email: data.email,
        password: data.password
      });
      
      toast.success("Account created successfully! Welcome to Mr Sarcastic!");
      navigate('/');
    } catch (error) {
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google authentication handler
  const handleGoogleAuth = async (credential: string) => {
    setGoogleLoading(true);
    try {
      if (activeTab === "login") {
        await login({ googleCredential: credential });
        toast.success("Successfully signed in with Google!");
      } else {
        await signup({ googleCredential: credential });
        toast.success("Successfully signed up with Google!");
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Mr Sarcastic</h1>
          <p className="text-muted-foreground">Your AI companion with attitude</p>
        </div>

        <Card className="p-6 border-primary/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6 mt-6">
              {/* Google Sign-In Button */}
              <div>
                <GoogleSignInButton 
                  onGoogleSignIn={handleGoogleAuth} 
                  isLoading={googleLoading}
                  text="Signing in with Google"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    {...registerLogin("email")}
                    className={loginErrors.email ? "border-destructive" : ""}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...registerLogin("password")}
                      className={loginErrors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-6">
              {/* Google Sign-Up Button */}
              <div>
                <GoogleSignInButton 
                  onGoogleSignIn={handleGoogleAuth} 
                  isLoading={googleLoading}
                  text="Signing up with Google"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    {...registerSignup("username")}
                    className={signupErrors.username ? "border-destructive" : ""}
                  />
                  {signupErrors.username && (
                    <p className="text-sm text-destructive">{signupErrors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    {...registerSignup("email")}
                    className={signupErrors.email ? "border-destructive" : ""}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...registerSignup("password")}
                      className={signupErrors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  {watchedPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className={`font-medium ${passwordStrength >= 75 ? 'text-primary' : passwordStrength >= 50 ? 'text-accent' : 'text-destructive'}`}>
                          {getStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {passwordCriteria.map((criterion, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {criterion.met ? (
                              <Check className="w-3 h-3 text-primary" />
                            ) : (
                              <X className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className={criterion.met ? "text-primary" : "text-muted-foreground"}>
                              {criterion.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...registerSignup("confirmPassword")}
                      className={signupErrors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{signupErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default Auth;
