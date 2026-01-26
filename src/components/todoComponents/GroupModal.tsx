import {
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Button,
  Typography
} from "@mui/material";

import { useState } from "react";
import { Group } from "../../types/todoModels";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (group: Group) => void;
}

export default function GroupModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState("");

  const save = () => {
    if (!name.trim()) return;

    onSave({
      id: crypto.randomUUID(),
      name
    });

    setName("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ minWidth: 350 }}>
        <Stack spacing={2}>
          <Typography variant="h6">New Group</Typography>

          <TextField
            label="Group Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Button variant="contained" onClick={save}>
            Add
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
