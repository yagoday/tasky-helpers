import React, { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { useLabelStore } from "@/stores/labelStore";
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
  const { addTaskWithValidation } = useTaskOperations();
  const labels = useLabelStore(state => state.labels);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTaskWithValidation(title.trim(), dueDate, selectedLabels);
    setTitle("");
    setDueDate(null);
    setSelectedLabels([]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex-1 space-y-2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="h-10"
        />
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Set due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate || undefined}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <LabelSelect
            selectedLabels={selectedLabels}
            onLabelsChange={setSelectedLabels}
          />
        </div>
      </div>
      <Button type="submit" className="h-10">
        <Plus className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default TaskForm;
