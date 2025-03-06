
import React, { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useTaskStore } from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import LabelSelect from "../label/LabelSelect";

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const { addTask, labels } = useTaskStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    addTask(title.trim(), dueDate, selectedLabels);
    setTitle("");
    setDueDate(null);
    setSelectedLabels([]);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative rounded-xl border border-purple-200 bg-white/80 backdrop-blur-sm p-1 shadow-sm transition-all duration-300 focus-within:border-purple-400 focus-within:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex-none pl-3">
          <Plus className="h-5 w-5 text-purple-500" />
        </span>
        
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 border-0 bg-transparent py-2.5 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
        />
        
        <div className="flex items-center gap-1 pr-1">
          {labels.length > 0 && (
            <LabelSelect 
              selectedLabels={selectedLabels} 
              onChange={setSelectedLabels} 
            />
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-lg",
                  dueDate && "text-purple-600"
                )}
              >
                <CalendarIcon className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate || undefined}
                onSelect={setDueDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              {dueDate && (
                <div className="border-t border-border px-3 py-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {format(dueDate, "PPP")}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDueDate(null)}
                    className="h-8 px-2 text-sm text-muted-foreground hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <Button 
            type="submit" 
            variant="secondary"
            size="sm"
            className="h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!title.trim()}
          >
            Add
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
