import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button
} from "@mui/material";

import { useState } from "react";
import { Group } from "../../types/todoModels";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (g: Group) => void;
}

export default function GroupModal({
  open,
  onClose,
  onSave
}: Props) {
  const [name, setName] = useState("");

  const handleSave = () => {
    onSave({
      id: crypto.randomUUID(),
      name
    });
    setName("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Group</DialogTitle>

      <DialogContent>
        <TextField
          label="Group Name"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
