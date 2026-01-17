import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useInvoiceFilesQuery, InvoiceFilesQuery } from '../generated/graphql';
// @ts-ignore - ignore type safety for flexsearch as requested
import { Index } from 'flexsearch';

type InvoiceFile = NonNullable<InvoiceFilesQuery['invoiceFiles']>[number];

export type SearchResult = {
  invoiceFile: InvoiceFile;
  displayLabel: string;
  fileName: string;
  matchedFields: string[];
};

type UseInvoiceSearchReturn = {
  search: (query: string) => Promise<SearchResult[]>;
  isLoading: boolean;
  isIndexReady: boolean;
  invoiceFiles: InvoiceFile[];
};

/**
 * Extracts searchable text from an invoice file with field labels
 */
function extractSearchableTextWithFields(invoiceFile: InvoiceFile): { text: string; fields: Map<string, string> } {
  const parts: string[] = [];
  const fields = new Map<string, string>();

  if (!invoiceFile || !invoiceFile.invoice) {
    return { text: '', fields };
  }

  // Buyer information
  if (invoiceFile.invoice.buyer?.name) {
    const text = invoiceFile.invoice.buyer.name;
    parts.push(text);
    fields.set('buyer.name', text);
  }
  if (invoiceFile.invoice.buyer?.address) {
    const text = invoiceFile.invoice.buyer.address;
    parts.push(text);
    fields.set('buyer.address', text);
  }

  // Seller information
  if (invoiceFile.invoice.seller?.name) {
    const text = invoiceFile.invoice.seller.name;
    parts.push(text);
    fields.set('seller.name', text);
  }
  if (invoiceFile.invoice.seller?.address) {
    const text = invoiceFile.invoice.seller.address;
    parts.push(text);
    fields.set('seller.address', text);
  }

  // Subject
  if (invoiceFile.invoice.subject) {
    const text = invoiceFile.invoice.subject;
    parts.push(text);
    fields.set('subject', text);
  }

  // Description
  if (invoiceFile.invoice.description) {
    const text = invoiceFile.invoice.description;
    parts.push(text);
    fields.set('description', text);
  }

  // Date
  if (invoiceFile.invoice.date) {
    const text = invoiceFile.invoice.date;
    parts.push(text);
    fields.set('date', text);
  }

  // Invoice reference
  if (invoiceFile.invoice.invoiceRef) {
    const text = invoiceFile.invoice.invoiceRef;
    parts.push(text);
    fields.set('invoiceRef', text);
  }

  // File name
  if (invoiceFile.fileName) {
    const text = invoiceFile.fileName;
    parts.push(text);
    fields.set('fileName', text);
  }

  // Trade items
  if (invoiceFile.invoice.tradeItems) {
    invoiceFile.invoice.tradeItems.forEach((item, index) => {
      if (item?.title) {
        const text = item.title;
        parts.push(text);
        fields.set(`tradeItems[${index}].title`, text);
      }
      if (item?.description) {
        const text = item.description;
        parts.push(text);
        fields.set(`tradeItems[${index}].description`, text);
      }
    });
  }

  return { text: parts.join(' '), fields };
}

/**
 * Extracts searchable text from an invoice file (backward compatibility)
 */
function extractSearchableText(invoiceFile: InvoiceFile): string {
  return extractSearchableTextWithFields(invoiceFile).text;
}

/**
 * Creates a display label for an invoice file
 */
function createDisplayLabel(invoiceFile: InvoiceFile): string {
  if (!invoiceFile || !invoiceFile.invoice) {
    return invoiceFile?.fileName || '';
  }
  
  const subject = invoiceFile.invoice.subject || '';
  const buyerName = invoiceFile.invoice.buyer?.name || '';
  
  if (subject && buyerName) {
    return `${subject} - ${buyerName}`;
  } else if (subject) {
    return subject;
  } else if (buyerName) {
    return buyerName;
  } else {
    return invoiceFile.fileName;
  }
}

/**
 * Hook for searching invoices using Flexsearch Worker
 */
export function useInvoiceSearch(): UseInvoiceSearchReturn {
  const { data, isLoading: queryLoading } = useInvoiceFilesQuery();
  const [isIndexReady, setIsIndexReady] = useState(false);
  const workerRef = useRef<any>(null);
  const invoiceFilesMapRef = useRef<Map<string, InvoiceFile>>(new Map());
  const invoiceFieldsMapRef = useRef<Map<string, Map<string, string>>>(new Map());

  const invoiceFiles = useMemo(() => {
    return data?.invoiceFiles?.filter((file): file is InvoiceFile => file !== null && file !== undefined) || [];
  }, [data]);

  // Initialize worker and index data
  useEffect(() => {
    if (queryLoading || invoiceFiles.length === 0) {
      return;
    }

    let isMounted = true;

    async function initializeIndex() {
      try {
        // @ts-ignore - ignore type safety for flexsearch
        const worker = new Index({
          tokenize: 'forward',
          resolution: 9,
        });

        workerRef.current = worker;

        // Index all invoice files
        for (const invoiceFile of invoiceFiles) {
          if (!invoiceFile) continue;
          
          const { text: searchableText, fields } = extractSearchableTextWithFields(invoiceFile);
          const fileName = invoiceFile.fileName;
          
          // Store reference to invoice file and its fields
          invoiceFilesMapRef.current.set(fileName, invoiceFile);
          invoiceFieldsMapRef.current.set(fileName, fields);
          
          // Add to index
          // @ts-ignore - ignore type safety for flexsearch
          worker.add(fileName, searchableText);
        }

        if (isMounted) {
          setIsIndexReady(true);
        }
      } catch (error) {
        console.error('Error initializing search index:', error);
        if (isMounted) {
          setIsIndexReady(false);
        }
      }
    }

    initializeIndex();

    return () => {
      isMounted = false;
      if (workerRef.current) {
        //workerRef.current.destroy?.();
        workerRef.current = null;
      }
      invoiceFilesMapRef.current.clear();
      invoiceFieldsMapRef.current.clear();
    };
  }, [queryLoading, invoiceFiles]);

  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!isIndexReady || !workerRef.current || query.trim() === '') {
      return [];
    }

    try {
      // @ts-ignore - ignore type safety for flexsearch
      const results: string[] = workerRef.current.search(query, { limit: 50 });
      
      const queryLower = query.toLowerCase();
      
      const searchResults: SearchResult[] = [];
      
      for (const fileName of results) {
        const invoiceFile = invoiceFilesMapRef.current.get(fileName);
        if (!invoiceFile) {
          continue;
        }
        
        // Find which fields matched
        const fields = invoiceFieldsMapRef.current.get(fileName);
        const matchedFields: string[] = [];
        
        if (fields) {
          fields.forEach((fieldValue, fieldKey) => {
            if (fieldValue.toLowerCase().includes(queryLower)) {
              matchedFields.push(fieldKey);
            }
          });
        }
        
        searchResults.push({
          invoiceFile,
          displayLabel: createDisplayLabel(invoiceFile),
          fileName,
          matchedFields,
        });
      }
      
      return searchResults;
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }, [isIndexReady]);

  return {
    search,
    isLoading: queryLoading || !isIndexReady,
    isIndexReady,
    invoiceFiles,
  };
}

