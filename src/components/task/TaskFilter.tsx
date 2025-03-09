import React from "react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/taskStore";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/types/task";
import { Check, Trash2 } from "lucide-react";

const TaskFilter: React.FC = () => {
  const filter = useTaskStore(state => state.filter);
  const setFilter = useTaskStore(state => state.setFilter);
  const clearCompleted = useTaskStore(state => state.clearCompleted);
  const tasks = useTaskStore(state => state.tasks);
  const completedCount = tasks.filter(task => task.completed).length;
  
  const filters: { value: TaskStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center space-x-1">
        {filters.map((filterOption) => (
          <Button
            key={filterOption.value}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-lg h-9 px-3 text-sm font-medium transition-all",
              filter === filterOption.value
                ? "bg-purple-200 text-purple-800"
                : "text-muted-foreground hover:bg-purple-100"
            )}
            onClick={() => setFilter(filterOption.value)}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>
      
      {completedCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCompleted}
          className="h-9 rounded-lg flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear completed</span>
        </Button>
      )}
    </div>
  );
};

export default TaskFilter;
