import { List } from "@mui/joy";
import { useRouter } from "next/router";
import { useInvoiceFilesQuery } from "../generated/graphql";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ListItemContent from "@mui/joy/ListItemContent";
import * as React from "react";
import { Tooltip } from "@mui/material";
import { filterUndefOrNull } from "../util/notEmpty";

export const InvoiceList = () => {
  const { push } = useRouter()
  const { data } = useInvoiceFilesQuery()


  return <List
    aria-labelledby="nav-list-browse"
    sx={{
      '& .JoyListItemButton-root': { p: '8px' },
    }}
  >
    {filterUndefOrNull(data?.invoiceFiles).map(invoiceFile => {
      const fullText = `${invoiceFile.invoice.subject} - ${invoiceFile.invoice.buyer.name}`;
      return (
        <ListItemButton key={invoiceFile.fileName} onClick={() => push(`/invoice/?fileName=${invoiceFile.fileName}`)}>
          <ListItemDecorator sx={{ color: 'inherit' }}>
            <FolderOpenIcon fontSize="small" />
          </ListItemDecorator>
          <ListItemContent sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem'
          }}>
              <span>{fullText}</span>
          </ListItemContent>
        </ListItemButton>
      )
    })}
  </List>
}
