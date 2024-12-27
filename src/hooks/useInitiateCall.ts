import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createCallRecord, initiateCall } from "@/utils/twilioUtils";
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

      const callData = await createCallRecord(contact.id, user.id, notes);
      const response = await initiateCall(callData.id, phone, notes);

      if (response.error) {
        let errorMessage = "Failed to initiate call";
        
        if (response.error.body) {
          try {
            const errorBody = JSON.parse(response.error.body);
            errorMessage = errorBody.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
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