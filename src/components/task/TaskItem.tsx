import React, { useState } from "react";
import { format } from "date-fns";
import { Check, Calendar, Trash2, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { useLabelStore } from "@/stores/labelStore";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import LabelSelect from "../label/LabelSelect";

interface TaskItemProps {
  task: Task;
  index: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index }) => {
  const { toggleTask, updateTaskDueDate, updateTaskLabelsWithValidation, deleteTask } = useTaskOperations();
  const labels = useLabelStore(state => state.labels);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Animation delay based on index for staggered entrance
  const animationDelay = `${index * 50}ms`;

  const taskLabels = labels.filter(label => task.labels.includes(label.id));

  return (
    <div 
      className="group relative flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md animate-scale-in"
      style={{ animationDelay }}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          "task-checkbox flex-none mt-0.5",
          task.completed && "task-checkbox-checked"
        )}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <span className="task-checkbox-inner text-white">
          <Check className="h-3 w-3" />
        </span>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-auto">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </span>
        </div>

        {/* Labels */}
        {taskLabels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {taskLabels.map(label => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${label.color}20`, color: label.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due {format(task.dueDate, "MMM d, yyyy")}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-none flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Due date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={task.dueDate || undefined}
              onSelect={(date) => updateTaskDueDate(task.id, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Label selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <LabelSelect
              selectedLabels={task.labels}
              onLabelsChange={(labels) => updateTaskLabelsWithValidation(task.id, labels)}
            />
          </PopoverContent>
        </Popover>

        {/* Delete button */}
        {!showDeleteConfirm ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
