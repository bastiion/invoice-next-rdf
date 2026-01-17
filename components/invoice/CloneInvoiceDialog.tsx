import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { ThemeProvider } from '@mui/system';
import { createTheme } from '@mui/material/styles';
import { Close } from '@mui/icons-material';
import { Invoice } from '../generated/graphql';
import { availableSchemas, getDefaultSchema } from './invoiceRefSchemas';
import { buildInvoiceRef, describeSchema, IdBuilderSchema } from './invoiceRefSchema';
import NiceModal, {useModal} from '@ebay/nice-modal-react';

const theme = createTheme();

interface CloneInvoiceDialogProps {
  oldInvoice?: Invoice;
}

export const CloneInvoiceDialog = NiceModal.create<CloneInvoiceDialogProps>(({ oldInvoice }) => {
  const modal = useModal();
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('default');
  const [invoiceRef, setInvoiceRef] = useState<string>('');

  const selectedSchemaEntry = availableSchemas.find((s) => s.id === selectedSchemaId);
  const selectedSchema: IdBuilderSchema = selectedSchemaEntry
    ? (() => {
        const { id, isDefault, ...schema } = selectedSchemaEntry;
        return schema;
      })()
    : getDefaultSchema();

  // Recalculate invoiceRef when schema changes or oldInvoice updates
  useEffect(() => {
    if (modal.visible) {
      const generatedRef = buildInvoiceRef(selectedSchema, oldInvoice);
      setInvoiceRef(generatedRef);
    }
  }, [selectedSchemaId, oldInvoice, modal.visible, selectedSchema]);

  const handleSchemaChange = useCallback((event: SelectChangeEvent<string>) => {
    const newSchemaId = event.target.value;
    setSelectedSchemaId(newSchemaId);
  }, []);

  const handleInvoiceRefChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInvoiceRef(event.target.value);
  }, []);

  const handleConfirm = useCallback(() => {
    if (invoiceRef.trim()) {
      modal.resolve(invoiceRef.trim());
      modal.hide();
    }
  }, [invoiceRef, modal]);

  const handleClose = useCallback(() => {
    modal.resolve(null);
    modal.hide();
  }, [modal]);

  const schemaDescription = React.useMemo(() => {
    return describeSchema(selectedSchema);
  }, [selectedSchema]);

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={modal.visible} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Clone Invoice
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="schema-select-label">InvoiceRef Schema</InputLabel>
              <Select
                labelId="schema-select-label"
                value={selectedSchemaId}
                label="InvoiceRef Schema"
                onChange={handleSchemaChange}
              >
                {availableSchemas.map((schema) => (
                  <MenuItem key={schema.id} value={schema.id}>
                    {schema.title} {schema.isDefault && '(Default)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Invoice Reference"
              value={invoiceRef}
              onChange={handleInvoiceRefChange}
              fullWidth
              helperText="Review or edit the generated invoice reference"
            />

            <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
              <strong>Current Schema:</strong>
              {'\n'}
              {schemaDescription}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" disabled={!invoiceRef.trim()}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
});

