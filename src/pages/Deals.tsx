import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddDealForm } from "@/components/AddDealForm";
import { DealColumn } from "@/components/DealColumn";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type DealStage = "qualify" | "cold" | "warm" | "hot";

interface Deal {
  id: string;
  title: string;
  value: number;
  company: string;
  stage: DealStage;
  probability: number;
  assignedTo?: string;
}

const stageColumns: { id: DealStage; title: string; color: string }[] = [
  { id: "qualify", title: "Qualify", color: "bg-gray-100" },
  { id: "cold", title: "Cold", color: "bg-blue-50" },
  { id: "warm", title: "Warm", color: "bg-orange-50" },
  { id: "hot", title: "Hot", color: "bg-red-50" },
];

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
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
    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching deals",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setDeals(data);
      }
    };

    fetchDeals();

    // Subscribe to changes
    const dealsSubscription = supabase
      .channel("deals_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, fetchDeals)
      .subscribe();

    return () => {
      dealsSubscription.unsubscribe();
    };
  }, [toast]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const deal = deals.find((d) => d.id === draggableId);
    if (!deal) return;

    const { error } = await supabase
      .from("deals")
      .update({ stage: destination.droppableId })
      .eq("id", draggableId);

    if (error) {
      toast({
        title: "Error updating deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const newDeals = deals.map((d) =>
      d.id === draggableId
        ? { ...d, stage: destination.droppableId as DealStage }
        : d
    );

    setDeals(newDeals);
    toast({
      title: "Deal Updated",
      description: `${deal.title} moved to ${destination.droppableId}`,
    });
  };

  const handleUpdateDeal = async (updatedDeal: Deal) => {
    const { error } = await supabase
      .from("deals")
      .update(updatedDeal)
      .eq("id", updatedDeal.id);

    if (error) {
      toast({
        title: "Error updating deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setDeals(deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    toast({
      title: "Deal Updated",
      description: `${updatedDeal.title} has been updated successfully.`,
    });
  };

  const handleAddDeal = async (values: Omit<Deal, "id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("deals")
      .insert([{ ...values, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setDeals([data, ...deals]);
      setIsAddDealOpen(false);
      toast({
        title: "Deal Added",
        description: `${data.title} has been added successfully.`,
      });
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Deals</h1>
          <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
              </DialogHeader>
              <AddDealForm
                onSubmit={handleAddDeal}
                onCancel={() => setIsAddDealOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stageColumns.map((column) => (
              <DealColumn
                key={column.id}
                column={column}
                deals={deals.filter((d) => d.stage === column.id)}
                onUpdateDeal={handleUpdateDeal}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Deals;