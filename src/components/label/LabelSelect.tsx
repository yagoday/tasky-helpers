
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabelSelectProps {
  selectedLabels: string[];
  onChange: (labelIds: string[]) => void;
}

const LabelSelect: React.FC<LabelSelectProps> = ({ selectedLabels, onChange }) => {
  const { labels } = useTaskStore();
  
  const toggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      onChange(selectedLabels.filter(id => id !== labelId));
    } else {
      onChange([...selectedLabels, labelId]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full",
            selectedLabels.length > 0 && "text-purple-600"
          )}
        >
          <Tag className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {labels.length > 0 ? (
            labels.map(label => (
              <div
                key={label.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => toggleLabel(label.id)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1">{label.name}</span>
                {selectedLabels.includes(label.id) && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </div>
            ))
          ) : (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No labels created yet
            </div>
          )}
        </div>
        {labels.length > 0 && (
          <div className="mt-2 pt-2 border-t flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onChange([])}
              className="text-sm h-8"
              disabled={selectedLabels.length === 0}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default LabelSelect;
