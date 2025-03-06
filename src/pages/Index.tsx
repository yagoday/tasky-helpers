
import React from "react";
import Layout from "@/components/layout/Layout";
import TaskForm from "@/components/task/TaskForm";
import TaskList from "@/components/task/TaskList";
import TaskFilter from "@/components/task/TaskFilter";
import { useTaskStore } from "@/lib/taskStore";

const Index: React.FC = () => {
  const { tasks } = useTaskStore();
  
  return (
    <Layout>
      <div className="space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground transition-all animate-fade-in">
            AI Development Tasks
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto animate-fade-in">
            Track your journey to building fullstack applications with AI tools
          </p>
        </header>

        <div className="mt-10 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 shadow-sm animate-scale-in">
          <TaskForm />
          
          <div className="mt-6">
            <h2 className="text-lg font-medium text-foreground">
              Your Tasks {tasks.length > 0 && <span className="text-muted-foreground">({tasks.length})</span>}
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
