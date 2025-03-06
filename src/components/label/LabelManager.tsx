
import React, { useState } from "react";
import { Label } from "@/types/task";
import { useTaskStore } from "@/lib/taskStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, X, Check, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const LabelManager: React.FC = () => {
  const { labels, addLabel, updateLabel, deleteLabel } = useTaskStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      addLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName("");
      setNewLabelColor("#3b82f6");
      setIsAdding(false);
    }
  };

  const handleUpdateLabel = (id: string) => {
    if (newLabelName.trim()) {
      updateLabel(id, newLabelName.trim(), newLabelColor);
      setNewLabelName("");
      setNewLabelColor("#3b82f6");
      setEditingId(null);
    }
  };

  const startEditing = (label: Label) => {
    setEditingId(label.id);
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
  };

  const cancelAction = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewLabelName("");
    setNewLabelColor("#3b82f6");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-purple-800">Labels</h3>
        {!isAdding && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Label</span>
          </Button>
        )}
      </div>

      {/* Add/Edit form */}
      {(isAdding || editingId) && (
        <div className="border border-purple-200 rounded-lg p-3 space-y-3 bg-white/50">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex-shrink-0" 
              style={{ backgroundColor: newLabelColor }}
            />
            <Input 
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Label name"
              className="flex-1"
              autoFocus
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Color:</span>
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={cancelAction}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            
            <Button 
              size="sm" 
              onClick={editingId ? () => handleUpdateLabel(editingId) : handleAddLabel}
              disabled={!newLabelName.trim()}
            >
              <Check className="h-4 w-4 mr-1" />
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Labels list */}
      {labels.length > 0 ? (
        <div className="space-y-2">
          {labels.map((label) => (
            <div 
              key={label.id} 
              className={cn(
                "flex items-center justify-between p-2 rounded-lg",
                editingId === label.id ? "bg-purple-50" : "hover:bg-purple-50"
              )}
            >
              {editingId !== label.id && (
                <>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: label.color }}
                    />
                    <span>{label.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full hover:bg-purple-100"
                      onClick={() => startEditing(label)}
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteLabel(label.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/50">
          <Tag className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">No labels created yet</p>
        </div>
      )}
    </div>
  );
};

export default LabelManager;
