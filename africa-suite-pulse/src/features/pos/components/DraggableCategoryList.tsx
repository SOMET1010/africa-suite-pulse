import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { CategoryActions } from "./CategoryActions";
import type { POSCategory } from "../types";

interface DraggableCategoryListProps {
  categories: POSCategory[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onEdit: (category: POSCategory) => void;
  onDelete: (categoryId: string) => void;
  onDuplicate: (categoryId: string) => void;
  onExport: (category: POSCategory) => void;
}

export function DraggableCategoryList({
  categories,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
}: DraggableCategoryListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex !== endIndex) {
      onReorder(startIndex, endIndex);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`border rounded-lg ${
              snapshot.isDraggingOver ? 'bg-muted/50' : ''
            }`}
          >
            {categories.map((category, index) => (
              <Draggable key={category.id} draggableId={category.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-4 flex items-center justify-between border-b last:border-b-0 ${
                      snapshot.isDragging ? 'bg-background shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        Ordre: {category.sort_order}
                      </Badge>
                    </div>
                    <CategoryActions
                      onEdit={() => onEdit(category)}
                      onDelete={() => onDelete(category.id)}
                      onDuplicate={() => onDuplicate(category.id)}
                      onExport={() => onExport(category)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}