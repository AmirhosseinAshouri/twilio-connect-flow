
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { LeadCard } from "./LeadCard";
import { Lead } from "@/types";
import { ErrorBoundary } from "./ErrorBoundary";

interface LeadColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
}

export function LeadColumn({ column, leads, onUpdateLead }: LeadColumnProps) {
  return (
    <div key={column.id} className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{column.title}</h2>
        <span className="text-sm text-muted-foreground">
          {leads.length} leads
        </span>
      </div>
      <ErrorBoundary>
        <Droppable droppableId={column.id}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`${column.color} p-4 rounded-lg h-[calc(100vh-200px)] overflow-y-auto transition-colors`}
            >
              {leads.map((lead, index) => (
                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                  {(provided) => (
                    <LeadCard
                      lead={lead}
                      onUpdate={onUpdateLead}
                      provided={provided}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ErrorBoundary>
    </div>
  );
}
