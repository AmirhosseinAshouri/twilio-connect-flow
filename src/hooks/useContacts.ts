import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_id: string;
  created_at: string;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching contacts",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const mappedContacts = (data || []).map(profile => ({
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        phone: '',
        company: '',
        user_id: profile.id,
        created_at: profile.created_at
      }));

      setContacts(mappedContacts);
      setLoading(false);
    };

    fetchContacts();

    const contactsSubscription = supabase
      .channel("contacts_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, fetchContacts)
      .subscribe();

    return () => {
      contactsSubscription.unsubscribe();
    };
  }, [toast]);

  const addContact = async (values: Omit<Contact, "id" | "user_id" | "created_at">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .insert([{
        id: user.id,
        full_name: values.name,
        email: values.email
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({
      title: "Contact Added",
      description: `${values.name} has been added successfully.`,
    });

    return data;
  };

  return { contacts, loading, addContact };
} 