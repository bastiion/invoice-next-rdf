'use client';

import {ColumnRaw} from "../util/datagrid/columnRaw";
import DeclarativeDataGrid from "../datagrid/DeclarativeDataGrid";
import React, {useCallback, useMemo} from "react";
import {TypeEditInfo} from "@inovua/reactdatagrid-community/types";
import {TradeItem} from "../generated/graphql";
import {useTranslations} from 'next-intl';
type Props = {
  tradeItems: TradeItem[]
  onTradeItemsChange?: (tradeItems: TradeItem[]) => void
}

export const TradeItemDataGrid = ({tradeItems, onTradeItemsChange}: Props) => {
  const t = useTranslations('TradeItemDataGrid');
  const columnsRaw: ColumnRaw[] = useMemo(() => [
    { name: 'optional', header: t('columns.optional'), type: 'boolean', defaultWidth: 20},
    { name: 'amount', header: t('columns.amount'), type: 'number', defaultWidth: 50, editable: true},
    { name: 'netPricePerItem', header: t('columns.netPricePerItem'), type: 'string', defaultWidth: 100, editable: true},
    { name: 'title', header: t('columns.title'), type: 'string'},
    { name: 'description', header: t('columns.description'), type: 'string'},
    { name: 'netPrice', header: t('columns.netPrice'), type: 'number'}
  ], [t]);
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


