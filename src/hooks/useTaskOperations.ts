import { useTaskStore } from "@/stores/taskStore";
import { useLabelStore } from "@/stores/labelStore";
import { toast } from "sonner";

export const useTaskOperations = () => {
  const addTask = useTaskStore(state => state.addTask);
  const toggleTask = useTaskStore(state => state.toggleTask);
  const updateTaskDueDate = useTaskStore(state => state.updateTaskDueDate);
  const updateTaskLabels = useTaskStore(state => state.updateTaskLabels);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const labels = useLabelStore(state => state.labels);
  
  const addTaskWithValidation = async (title: string, dueDate: Date | null, labelIds: string[] = []) => {
    if (!title.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    // Validate that all label IDs exist
    const validLabelIds = labelIds.filter(id => labels.some(label => label.id === id));
    if (validLabelIds.length !== labelIds.length) {
      toast.error("Some selected labels do not exist");
      return;
    }

    await addTask(title, dueDate, validLabelIds);
  };

  const updateTaskLabelsWithValidation = async (taskId: string, labelIds: string[]) => {
    // Validate that all label IDs exist
    const validLabelIds = labelIds.filter(id => labels.some(label => label.id === id));
    if (validLabelIds.length !== labelIds.length) {
      toast.error("Some selected labels do not exist");
      return;
    }

    await updateTaskLabels(taskId, validLabelIds);
  };

  return {
    addTaskWithValidation,
    toggleTask,
    updateTaskDueDate,
    updateTaskLabelsWithValidation,
    deleteTask
  };
}; 