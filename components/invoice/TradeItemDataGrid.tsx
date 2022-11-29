import {ColumnRaw} from "../util/datagrid/columnRaw";
import DeclarativeDataGrid from "../datagrid/DeclarativeDataGrid";
import React, {useCallback} from "react";
import {TypeEditInfo} from "@inovua/reactdatagrid-community/types";
import {TradeItem} from "../generated/graphql";

const columnsRaw: ColumnRaw[] = [
  { name: 'optional', header: 'optional', type: 'boolean', defaultWidth: 20},
  { name: 'amount', header: 'amount', type: 'number', defaultWidth: 50, editable: true},
  { name: 'netPricePerItem', header: 'price/item', type: 'string', defaultWidth: 100, editable: true},
  { name: 'title', header: 'title', type: 'string'},
  { name: 'description', header: 'description', type: 'string'},
  { name: 'netPrice', header: 'net price', type: 'number'}
]
type Props = {
  tradeItems: TradeItem[]
  onTradeItemsChange?: (tradeItems: TradeItem[]) => void
}

export const TradeItemDataGrid = ({tradeItems, onTradeItemsChange}: Props) => {
  const onEditComplete = useCallback(
      ({value, columnId, rowId}: TypeEditInfo) => {
        const newTradeItems = tradeItems.map((tradeItem, index) =>
            index === parseInt(rowId)
                ? {...tradeItem, [columnId]: parseInt( value )}
                : tradeItem )
        onTradeItemsChange && onTradeItemsChange( newTradeItems )
      }, [onTradeItemsChange, tradeItems],
  );
  return <DeclarativeDataGrid
      scrollTopOnFilter={false}
      scrollTopOnGroupBy={false}
      scrollTopOnSort={false}
      onEditComplete={onEditComplete}
      disableScrolling
      data={tradeItems.map((item, index) => ({id: index, ...item}))}
      columnsRaw={columnsRaw} debugEnabled={true} />
}


