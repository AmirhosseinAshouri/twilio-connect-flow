import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types";

interface InitiateCallParams {
  contact: Contact;
  phone: string;
  notes: string;
}

export function useInitiateCall() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInitiateCall = async ({ contact, phone, notes }: InitiateCallParams) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create call record
      const { data: callData, error: callError } = await supabase
        .from("calls")
        .insert([{
          contact_id: contact.id,
          user_id: user.id,
          notes,
          status: 'initiated'
        }])
        .select()
        .single();

      if (callError) {
        throw new Error("Failed to create call record");
      }

      // Initiate call using API route
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          callId: callData.id,
          to: phone,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate call');
      }

      toast({
        title: "Success",
        description: "Call initiated successfully",
      });
      return true;
    } catch (error) {
      console.error('Call creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate call",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateCall: handleInitiateCall,
    isLoading
  };
}