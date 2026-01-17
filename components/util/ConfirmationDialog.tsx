import React, { useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box
} from '@mui/material';
import { Typography } from '@mui/joy';
import NiceModal, {useModal} from '@ebay/nice-modal-react';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'danger' | 'warning' | 'info';
}

export const ConfirmationDialog = NiceModal.create<ConfirmationDialogProps>(({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'danger'
}) => {
  const modal = useModal();

  const getColor = () => {
    switch (severity) {
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      default:
        return 'error';
    }
  };

  const handleConfirm = useCallback(() => {
    modal.resolve(true);
    modal.hide();
  }, [modal]);

  const handleCancel = useCallback(() => {
    modal.resolve(null);
    modal.hide();
  }, [modal]);

  return (
    <Dialog open={modal.visible} onClose={handleCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography level="body-md" textColor="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button color={getColor()} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}); 