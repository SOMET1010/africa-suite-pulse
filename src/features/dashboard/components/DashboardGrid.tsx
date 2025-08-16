import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DashboardWidget, WidgetConfig } from './DashboardWidget';
import { useDashboardPreferences } from '../hooks/useDashboardPreferences';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface DashboardGridProps {
  widgets: WidgetConfig[];
  onWidgetUpdate: (widgets: WidgetConfig[]) => void;
  children: React.ReactNode[];
}

export function DashboardGrid({ widgets, onWidgetUpdate, children }: DashboardGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = useCallback((start: any) => {
    setDraggingId(start.draggableId);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    setDraggingId(null);
    
    if (!result.destination) return;

    const newWidgets = Array.from(widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    // Update positions
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: { x: index % 4, y: Math.floor(index / 4) }
    }));

    onWidgetUpdate(updatedWidgets);
  }, [widgets, onWidgetUpdate]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    onWidgetUpdate(newWidgets);
  }, [widgets, onWidgetUpdate]);

  const handleConfigureWidget = useCallback((widgetId: string) => {
    // This would open a configuration modal
    logger.debug('Configure widget', { widgetId });
  }, []);

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="dashboard-grid">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'grid grid-cols-4 gap-4 auto-rows-min transition-colors duration-200',
              snapshot.isDraggingOver && 'bg-muted/30'
            )}
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      'transition-transform duration-200',
                      snapshot.isDragging && 'z-50'
                    )}
                  >
                    <DashboardWidget
                      widget={widget}
                      onRemove={handleRemoveWidget}
                      onConfigure={handleConfigureWidget}
                      isDragging={draggingId === widget.id}
                    >
                      {children[index]}
                    </DashboardWidget>
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