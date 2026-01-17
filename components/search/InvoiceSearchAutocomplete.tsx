import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Autocomplete from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import { SearchRounded } from '@mui/icons-material';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import { SxProps } from '@mui/system';
import { useInvoiceSearch, SearchResult } from './useInvoiceSearch';

interface InvoiceSearchAutocompleteProps {
  sx?: SxProps;
}

export default function InvoiceSearchAutocomplete({ sx }: InvoiceSearchAutocompleteProps) {
  const router = useRouter();
  const { search, isLoading } = useInvoiceSearch();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Perform search when input value changes
  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return;
    }

    setLoading(true);
    search(inputValue).then((results) => {
      if (active) {
        setOptions(results);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, search]);

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, value: string | SearchResult | null, _reason?: any) => {
      if (value && typeof value !== 'string') {
        router.push(`/invoice/?fileName=${value.fileName}`);
        setInputValue('');
        setOptions([]);
      }
    },
    [router]
  );

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue);
    },
    []
  );

  const getOptionLabel = useCallback((option: string | SearchResult) => {
    if (typeof option === 'string') {
      return option;
    }
    return option.displayLabel;
  }, []);

  const getOptionKey = useCallback((option: string | SearchResult) => {
    if (typeof option === 'string') {
      return option;
    }
    return option.fileName;
  }, []);

  const renderOption = useCallback((props: any, option: string | SearchResult) => {
    if (typeof option === 'string') {
      return <AutocompleteOption {...props}>{option}</AutocompleteOption>;
    }

    const { key, ...other } = props;
    
    // Format matched fields for display
    const formatFieldName = (fieldKey: string): string => {
      if (fieldKey === 'buyer.name') return 'Buyer';
      if (fieldKey === 'buyer.address') return 'Buyer Address';
      if (fieldKey === 'seller.name') return 'Seller';
      if (fieldKey === 'seller.address') return 'Seller Address';
      if (fieldKey === 'subject') return 'Subject';
      if (fieldKey === 'description') return 'Description';
      if (fieldKey === 'date') return 'Date';
      if (fieldKey === 'invoiceRef') return 'Invoice Ref';
      if (fieldKey === 'fileName') return 'File Name';
      if (fieldKey.startsWith('tradeItems[')) {
        const match = fieldKey.match(/tradeItems\[(\d+)\]\.(title|description)/);
        if (match) {
          const index = parseInt(match[1]) + 1;
          const type = match[2] === 'title' ? 'Title' : 'Description';
          return `Item ${index} ${type}`;
        }
      }
      return fieldKey;
    };

    const matchedFieldsText = option.matchedFields.length > 0
      ? option.matchedFields.map(formatFieldName).join(', ')
      : '';

    return (
      <AutocompleteOption key={option.fileName} {...other}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography level="body-sm" fontWeight="md">
            {option.displayLabel}
          </Typography>
          {matchedFieldsText && (
            <Typography level="body-xs" textColor="text.tertiary">
              Matched in: {matchedFieldsText}
            </Typography>
          )}
        </Box>
      </AutocompleteOption>
    );
  }, []);

  return (
    <Autocomplete
      freeSolo
      size="sm"
      placeholder="Search anything..."
      loading={loading || isLoading}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionKey={getOptionKey}
      renderOption={renderOption}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      startDecorator={<SearchRounded color="primary" />}
      endDecorator={
        <IconButton variant="outlined" size="sm">
          <Typography fontWeight="lg" fontSize="sm" textColor="text.tertiary">
            /
          </Typography>
        </IconButton>
      }
      sx={{
        flexBasis: '500px',
        ...sx,
      }}
    />
  );
}

