import React from "react";
import { useTaskStore } from "@/stores/taskStore";
import TaskItem from "./TaskItem";
import { ClipboardList } from "lucide-react";

const TaskList: React.FC = () => {
  const { filteredTasks } = useTaskStore();
  const tasks = filteredTasks();

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-center font-medium">No tasks found</p>
        <p className="text-sm text-muted-foreground/70 text-center mt-1">
          Add some tasks to get started
        </p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {tasks.map((task, index) => (
        <TaskItem key={task.id} task={task} index={index} />
      ))}
    </div>
  );
};

export default TaskList;
