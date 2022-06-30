import { List } from "@mui/joy";
import {useRouter} from "next/router";
import {useInvoicesQuery} from "../generated/graphql";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ListItemContent from "@mui/joy/ListItemContent";
import * as React from "react";

export const InvoiceList = () => {
  const { push } = useRouter()
  const { data } = useInvoicesQuery()


  return <List
      aria-labelledby="nav-list-browse"
      sx={{
        '& .JoyListItemButton-root': { p: '8px' },
      }}
  >
    {data?.invoices?.map(invoice => {
      return invoice && (
          <ListItemButton key={invoice.invoiceRef}  onClick={() =>  push(`/invoice/?invoiceRef=${invoice.invoiceRef}`)}>
            <ListItemDecorator sx={{ color: 'inherit' }}>
              <FolderOpenIcon fontSize="small" />
            </ListItemDecorator>
            <ListItemContent>{invoice.subject} - {invoice.buyer.name}</ListItemContent>
          </ListItemButton>
      )})}
  </List>
  }
