import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Bot,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Music,
  User,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Track scroll position for navbar background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Chatbot", path: "/chat", icon: MessageCircle },
    { name: "Songs", path: "/songs", icon: Music },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ease-out ${
      scrolled
        ? "border-border bg-card/90 backdrop-blur-xl shadow-lg shadow-background/50"
        : "border-transparent bg-card/60 backdrop-blur-md"
    } supports-[backdrop-filter]:bg-card/60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-inset">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 glow-primary">
              <Bot className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold gradient-text group-hover:tracking-wide transition-all duration-300">Mr Sarcastic</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 group ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive(item.path) ? '' : 'group-hover:scale-110'}`} />
                  <span>{item.name}</span>
                  {isActive(item.path) && (
                    <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full animate-scale-in" />
                  )}
                </Link>
              );
            })}
            
            {/* Authentication Button */}
            <div className="ml-4 flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleLogout} className="group">
                <LogOut className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <span className={`transition-all duration-300 ${isMenuOpen ? 'rotate-180 scale-110' : ''}`}>
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-xl rounded-xl mt-2 border border-border shadow-2xl">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 touch-manipulation active:scale-[0.98] ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
                  }`}
                  style={{
                    animation: isMenuOpen ? `slideInLeft 0.3s ease-out ${index * 0.05}s both` : 'none',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {isActive(item.path) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                  )}
                </Link>
              );
            })}
            
            {/* Mobile Logout */}
            <div className="pt-2 mt-2 border-t border-border">
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;