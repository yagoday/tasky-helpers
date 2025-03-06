
import React from "react";
import { useTaskStore } from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LabelFilter: React.FC = () => {
  const { labels, labelFilter, setLabelFilter } = useTaskStore();
  
  if (labels.length === 0) return null;
  
  const activeLabel = labelFilter ? labels.find(l => l.id === labelFilter) : null;
  
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-lg h-8 px-2.5 text-sm font-medium flex items-center gap-1.5 flex-shrink-0",
            !labelFilter && "bg-purple-200 text-purple-800"
          )}
          onClick={() => setLabelFilter(null)}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>All</span>
        </Button>
        
        {labels.map(label => (
          <Button
            key={label.id}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-lg h-8 px-2.5 text-sm font-medium transition-all flex items-center gap-1.5 flex-shrink-0",
              labelFilter === label.id
                ? "bg-purple-200 text-purple-800"
                : "text-muted-foreground hover:bg-purple-100"
            )}
            onClick={() => setLabelFilter(label.id)}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: label.color }}
            />
            <span>{label.name}</span>
          </Button>
        ))}
      </div>
      
      {activeLabel && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-1 h-7 w-7 p-0 rounded-full text-muted-foreground"
          onClick={() => setLabelFilter(null)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default LabelFilter;
