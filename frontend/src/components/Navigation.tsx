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
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Chatbot", path: "/chat", icon: MessageCircle },
  { name: "Songs", path: "/songs", icon: Music },
  { name: "Profile", path: "/profile", icon: User },
] as const;

const Navigation = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const rafRef = useRef<number>();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // rAF-throttled scroll handler for smooth navbar transition
  useEffect(() => {
    let lastScrolled = false;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const nowScrolled = window.scrollY > 20;
        if (nowScrolled !== lastScrolled) {
          lastScrolled = nowScrolled;
          setScrolled(nowScrolled);
        }
        rafRef.current = undefined;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b contain-layout ${
        scrolled
          ? "border-border bg-card/90 backdrop-blur-xl shadow-lg shadow-background/50"
          : "border-transparent bg-card/60 backdrop-blur-md"
      } supports-[backdrop-filter]:bg-card/60`}
      style={{
        transitionProperty: "background-color, border-color, box-shadow, backdrop-filter",
        transitionDuration: "400ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-inset">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg group-hover:shadow-xl transition-shadow duration-300 glow-primary"
              style={{
                transitionProperty: "transform, box-shadow",
                transitionDuration: "300ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <Bot className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
            </div>
            <span className="text-xl font-bold gradient-text group-hover:tracking-wide transition-all duration-300">Mr Sarcastic</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg font-medium flex items-center space-x-2 group ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  style={{
                    transitionProperty: "background-color, color, box-shadow, transform",
                    transitionDuration: "250ms",
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <Icon className={`h-4 w-4 ${active ? '' : 'group-hover:scale-110'}`}
                    style={{ transitionProperty: "transform", transitionDuration: "200ms", transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                  />
                  <span>{item.name}</span>
                  {active && (
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
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <span
                style={{
                  transitionProperty: "transform",
                  transitionDuration: "300ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: isMenuOpen ? "rotate(180deg) scale(1.1)" : "rotate(0deg) scale(1)",
                  display: "inline-flex",
                }}
              >
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
        <div
          className="md:hidden overflow-hidden"
          style={{
            maxHeight: isMenuOpen ? "400px" : "0px",
            opacity: isMenuOpen ? 1 : 0,
            transitionProperty: "max-height, opacity",
            transitionDuration: isMenuOpen ? "400ms" : "250ms",
            transitionTimingFunction: isMenuOpen
              ? "cubic-bezier(0.22, 1, 0.36, 1)"
              : "cubic-bezier(0.4, 0, 1, 1)",
          }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-xl rounded-xl mt-2 border border-border shadow-2xl">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium touch-manipulation active:scale-[0.98] ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
                  }`}
                  style={{
                    transitionProperty: "background-color, color, transform",
                    transitionDuration: "200ms",
                    animation: isMenuOpen ? `slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.06}s both` : 'none',
                  }}
                  onClick={closeMenu}
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
});

Navigation.displayName = "Navigation";

export default Navigation;