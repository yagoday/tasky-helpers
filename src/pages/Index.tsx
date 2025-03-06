
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import TaskForm from "@/components/task/TaskForm";
import TaskList from "@/components/task/TaskList";
import TaskFilter from "@/components/task/TaskFilter";
import LabelFilter from "@/components/label/LabelFilter";
import LabelManager from "@/components/label/LabelManager";
import { useTaskStore } from "@/lib/taskStore";
import { Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMobile } from "@/hooks/use-mobile";

const Index: React.FC = () => {
  const { tasks, isLoading } = useTaskStore();
  const [showLabelManager, setShowLabelManager] = useState(false);
  const isMobile = useMobile();
  
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-purple-800 flex items-center">
                Your Tasks {tasks.length > 0 && <span className="text-purple-500 ml-1">({tasks.length})</span>}
                {isLoading && (
                  <Loader2 className="ml-2 h-4 w-4 text-purple-500 animate-spin" />
                )}
              </h2>
              
              <div className="flex items-center gap-2">
                <LabelFilter />
                {isMobile ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-auto flex items-center h-8 w-8"
                      >
                        <Tag className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <LabelManager />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto flex items-center gap-1.5 h-8"
                    onClick={() => setShowLabelManager(!showLabelManager)}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    <span>Manage Labels</span>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Label manager for desktop */}
            {!isMobile && showLabelManager && (
              <div className="mt-4 p-4 border border-purple-100 rounded-lg bg-white/70">
                <LabelManager />
              </div>
            )}
            
            {/* Tasks */}
            <div className="mt-4">
              <TaskList />
              {tasks.length > 0 && <TaskFilter />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
