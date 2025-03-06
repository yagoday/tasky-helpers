
import React, { useState } from "react";
import { format } from "date-fns";
import { Check, Calendar, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import { useTaskStore } from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface TaskItemProps {
  task: Task;
  index: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index }) => {
  const { toggleTask, updateTaskDueDate, deleteTask } = useTaskStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Animation delay based on index for staggered entrance
  const animationDelay = `${index * 50}ms`;

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
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "text-base font-medium leading-snug transition-all duration-300",
              task.completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </h3>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div 
            className={cn(
              "mt-1.5 flex items-center text-sm text-muted-foreground",
              task.completed && "opacity-60"
            )}
          >
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            <span>{format(task.dueDate, "PPP")}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-none flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {/* Due date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label="Set due date"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={task.dueDate || undefined}
              onSelect={(date) => updateTaskDueDate(task.id, date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Delete button with confirmation */}
        {showDeleteConfirm ? (
          <div className="flex items-center gap-1 bg-destructive/10 rounded-full px-1 animate-fade-in">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-destructive/20 text-destructive"
              onClick={() => deleteTask(task.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-background/50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
