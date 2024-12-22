import { Droppable, Draggable } from "@hello-pangea/dnd";
import { DealCard } from "./DealCard";

interface DealColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  deals: Array<{
    id: string;
    title: string;
    company: string;
    value: number;
    probability: number;
    stage: string;
  }>;
  onUpdateDeal: (deal: any) => void;
}

export function DealColumn({ column, deals, onUpdateDeal }: DealColumnProps) {
  return (
    <div key={column.id} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{column.title}</h2>
        <span className="text-sm text-muted-foreground">
          {deals.length} deals
        </span>
      </div>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`${column.color} p-4 rounded-lg min-h-[500px] transition-colors`}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(provided) => (
                  <DealCard
                    deal={deal}
                    onUpdate={onUpdateDeal}
                    provided={provided}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}