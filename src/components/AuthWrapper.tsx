import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // Clean up any stale auth state first
    const cleanupAuthState = () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle authentication events
        if (event === 'SIGNED_OUT' || !session) {
          // Only redirect to signin if not already there
          if (location.pathname !== '/signin') {
            navigate('/signin', { replace: true });
          }
        } else if (event === 'SIGNED_IN' && session) {
          // Redirect to dashboard if on signin page
          if (location.pathname === '/signin') {
            navigate('/', { replace: true });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Session error:', error);
        cleanupAuthState();
        setSession(null);
        setUser(null);
        setLoading(false);
        if (location.pathname !== '/signin') {
          navigate('/signin', { replace: true });
        }
        return;
      }

      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // If no session and not on signin page, redirect
      if (!session && location.pathname !== '/signin') {
        navigate('/signin', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Show loading skeleton while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // If no session, don't render children (redirect will happen)
  if (!session || !user) {
    return null;
  }

  return <>{children}</>;
}