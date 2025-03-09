export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface LabelState {
  labels: Label[];
  labelFilter: string | null;
  isLoading: boolean;
  addLabel: (name: string, color: string) => Promise<void>;
  updateLabel: (id: string, name: string, color: string) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  setLabelFilter: (labelId: string | null) => void;
} 