import { toast } from "sonner";

export const handleStoreError = (error: any, action: string) => {
  console.error(`Error ${action}:`, error);
  toast.error(`Failed to ${action}`);
};

export const handleStoreSuccess = (action: string) => {
  toast.success(`${action} successfully`);
}; 