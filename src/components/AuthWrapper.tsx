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
    console.log('AuthWrapper: Setting up auth listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session ? 'has session' : 'no session');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Simple redirect logic
        if (session && location.pathname === '/signin') {
          navigate('/', { replace: true });
        } else if (!session && location.pathname !== '/signin') {
          navigate('/signin', { replace: true });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'exists' : 'none');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Simple redirect logic
      if (session && location.pathname === '/signin') {
        navigate('/', { replace: true });
      } else if (!session && location.pathname !== '/signin') {
        navigate('/signin', { replace: true });
      }
    });

    return () => {
      console.log('AuthWrapper: Cleaning up');
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