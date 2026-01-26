import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,

  confirmText = "Confirm",
  cancelText = "Cancel",

  onConfirm,
  onCancel
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="h6">{title}</Typography>

          <Typography color="text.secondary">
            {message}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel}>
          {cancelText}
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
