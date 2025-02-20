
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddLeadForm } from "@/components/AddLeadForm";
import { LeadColumn } from "@/components/LeadColumn";
import { useLeads } from "@/hooks/useLeads";
import { Lead, LeadStage } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stageColumns: { id: LeadStage; title: string; color: string }[] = [
  { id: "qualify", title: "Qualify", color: "bg-gray-100" },
  { id: "cold", title: "Cold", color: "bg-blue-50" },
  { id: "warm", title: "Warm", color: "bg-orange-50" },
  { id: "hot", title: "Hot", color: "bg-red-50" },
];

const Leads = () => {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const { leads, setLeads, updateLead } = useLeads();
  const { toast } = useToast();

  const handleAddLead = async (values: Omit<Lead, "id" | "created_at" | "updated_at">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newLead = {
      ...values,
      user_id: user.id,
      stage: "qualify" as LeadStage,
      contact_id: values.contact_id,
    };

    const { data, error } = await supabase
      .from("deals")
      .insert(newLead)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding lead",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setIsAddLeadOpen(false);
      toast({
        title: "Lead Added",
        description: `${data.title} has been added successfully.`,
      });
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const lead = leads.find((l) => l.id === draggableId);
    if (!lead) return;

    const updatedLead = { ...lead, stage: destination.droppableId as LeadStage };
    setLeads(currentLeads =>
      currentLeads.map(l => l.id === draggableId ? updatedLead : l)
    );

    const { error } = await supabase
      .from("deals")
      .update({ stage: destination.droppableId })
      .eq("id", draggableId);

    if (error) {
      setLeads(currentLeads =>
        currentLeads.map(l => l.id === draggableId ? lead : l)
      );
      
      toast({
        title: "Error updating lead",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Leads</h1>
          <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <AddLeadForm
                onSubmit={handleAddLead}
                onCancel={() => setIsAddLeadOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stageColumns.map((column) => (
              <LeadColumn
                key={column.id}
                column={column}
                leads={leads.filter((l) => l.stage === column.id)}
                onUpdateLead={updateLead}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Leads;
