
import React from "react";
import Layout from "@/components/layout/Layout";
import TaskForm from "@/components/task/TaskForm";
import TaskList from "@/components/task/TaskList";
import TaskFilter from "@/components/task/TaskFilter";
import { useTaskStore } from "@/lib/taskStore";
import { Loader2 } from "lucide-react";

const Index: React.FC = () => {
  const { tasks, isLoading } = useTaskStore();
  
  return (
    <Layout>
      <div className="space-y-6">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-purple-800 transition-all animate-fade-in">
            AI Development Tasks
          </h1>
          <p className="mt-3 text-purple-600 max-w-md mx-auto animate-fade-in">
            Track your journey to building fullstack applications with AI tools
          </p>
        </header>

        <div className="mt-6 rounded-2xl border border-purple-200 bg-white/90 backdrop-blur-sm p-4 sm:p-5 shadow-sm animate-scale-in">
          <TaskForm />
          
          <div className="mt-6">
            <h2 className="text-lg font-medium text-purple-800 flex items-center">
              Your Tasks {tasks.length > 0 && <span className="text-purple-500 ml-1">({tasks.length})</span>}
              {isLoading && (
                <Loader2 className="ml-2 h-4 w-4 text-purple-500 animate-spin" />
              )}
            </h2>
            
            <TaskList />
            {tasks.length > 0 && <TaskFilter />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
