import React from "react";
import { useLabelStore } from "@/stores/labelStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LabelFilter: React.FC = () => {
  const labels = useLabelStore(state => state.labels);
  const labelFilter = useLabelStore(state => state.labelFilter);
  const setLabelFilter = useLabelStore(state => state.setLabelFilter);

  if (labels.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-4">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 text-sm font-medium rounded-lg",
          !labelFilter && "bg-purple-200 text-purple-800"
        )}
        onClick={() => setLabelFilter(null)}
      >
        All
      </Button>
      {labels.map(label => (
        <Button
          key={label.id}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 text-sm font-medium rounded-lg",
            labelFilter === label.id && "bg-purple-200 text-purple-800"
          )}
          onClick={() => setLabelFilter(label.id)}
        >
          {label.name}
        </Button>
      ))}
    </div>
  );
};

export default LabelFilter;
