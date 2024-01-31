import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { Link } from "react-router-dom";

import { ExternalLink } from './ExternalLink';

type Order = 'asc' | 'desc';

function sortData(array: any[], columnConfig: IColumnConfigEntry[], order: 'asc' | 'desc', orderBy: string) {
  let sortedArray = array.sort((a, b) => {
    let sortedColumnConfig = columnConfig.find((item) => item.valueKey === orderBy);
    if(sortedColumnConfig && sortedColumnConfig.numeric) {
      return order === 'desc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    } else {
      return order === 'desc' ? a[orderBy].localeCompare(b[orderBy]) : b[orderBy].localeCompare(a[orderBy]);
    }
  });
  return sortedArray;
}

interface IColumnConfigEntry {
  id: string
  label: string
  valueKey: string
  valueFormatterKeyArgs?: string[],
  numeric: boolean
  disablePadding: boolean
  valueFormatter?: (...args: any[]) => any
  valueFormatterAsElement?: (...args: any[]) => React.ReactNode,
  imageGetter?: (arg0: any) => any
  fallbackImage?: string
  positiveGood?: boolean
  negativeBad?: boolean
  internalLinkGetter?: (...args: any[]) => string
  externalLinkGetter?: (...args: any[]) => string | false
  externalLinkGetterKeyArgs?: string[],
  tHeadStyle?: {[key: string]: string},
  tCellStyle?: {[key: string]: string},
}

interface EnhancedTableProps {
  showNoRecordsFound: boolean;
  columnConfig: IColumnConfigEntry[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  loadingRows: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { 
    columnConfig,
    order,
    orderBy,
    onRequestSort,
    showNoRecordsFound,
    loadingRows,
  } = props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {!showNoRecordsFound && (loadingRows === 0) && columnConfig.map((columnConfigEntry) => (
          <TableCell
            key={columnConfigEntry.id}
            align={'left'}
            padding={columnConfigEntry.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === columnConfigEntry.id ? order : false}
            style={{
              ...(columnConfigEntry.tHeadStyle && columnConfigEntry.tHeadStyle),
            }}
          >
            <TableSortLabel
              active={orderBy === columnConfigEntry.valueKey}
              direction={orderBy === columnConfigEntry.valueKey ? order : 'asc'}
              onClick={createSortHandler(columnConfigEntry.valueKey)}
              style={{whiteSpace: 'nowrap'}}
            >
              {columnConfigEntry.label}
              {orderBy === columnConfigEntry.valueKey ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {(showNoRecordsFound || loadingRows > 0) &&
          <TableCell colSpan={6}/>
        }
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  tableHeading?: string;
  tableSubtitle?: string;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const {
    tableHeading,
    tableSubtitle,
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <div style={{marginTop: 8, marginBottom: 8}}>
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {tableHeading}
        </Typography>
        {tableSubtitle &&
          <Typography
          sx={{ flex: '1 1 100%' }}
          style={{fontWeight: 400}}
          variant="subtitle2"
          id="tableSubtitle"
          component="div"
        >
          {tableSubtitle}
        </Typography>
        }
      </div>
    </Toolbar>
  );
}

interface ISortableTableProps {
  tableHeading?: string
  tableSubtitle?: string
  defaultSortValueKey: string
  columnConfig: IColumnConfigEntry[]
  tableData: any[]
  uniqueRowKey: string
  loadingRows?: number
  showNoRecordsFound?: boolean
}

export default function SortableTable(props: ISortableTableProps) {

  let {
    tableHeading,
    tableSubtitle,
    showNoRecordsFound = false,
    defaultSortValueKey,
    columnConfig,
    tableData,
    uniqueRowKey,
    loadingRows = 0,
  } = props;
  
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState(defaultSortValueKey);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, index: number) => {
    console.log({index})
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, border: '1px solid #ffffff3b' }}>
        {tableHeading && <EnhancedTableToolbar tableHeading={tableHeading} tableSubtitle={tableSubtitle} />}
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              showNoRecordsFound={showNoRecordsFound}
              loadingRows={loadingRows}
              columnConfig={columnConfig}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={tableData.length}
            />
            <TableBody>
              {sortData(tableData, columnConfig, order, orderBy)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: any, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, index)}
                      tabIndex={-1}
                      key={`table-row-${row[uniqueRowKey]}-${index}`}
                    >
                      {columnConfig.map((columnConfigEntry, index) => {
                        return (
                          <TableCell
                            key={`${labelId}-${index}`}
                            component="th"
                            scope="row"
                            align={index > 0 ? "left" : "left"}
                            style={{
                              ...(columnConfigEntry.tCellStyle && columnConfigEntry.tCellStyle),
                            }}
                          >
                            <div 
                              style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  whiteSpace: 'nowrap',
                                  ...(columnConfigEntry.tCellStyle && columnConfigEntry.tCellStyle),
                                }}
                              >
                              {columnConfigEntry?.imageGetter &&
                                <img
                                  loading="lazy"
                                  width="25"
                                  style={{marginRight: 18}}
                                  src={columnConfigEntry?.imageGetter(row[columnConfigEntry.valueKey])}
                                  onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src="https://vagabond-public-storage.s3.eu-west-2.amazonaws.com/question-mark-white.svg";
                                  }}
                                  alt=""
                                />
                              }
                              {
                                columnConfigEntry?.internalLinkGetter &&
                                <Link style={{color: 'white'}} to={columnConfigEntry.internalLinkGetter(row[columnConfigEntry.valueKey])}>
                                  {row[columnConfigEntry.valueKey]}
                                </Link>
                              }
                              {
                                columnConfigEntry?.externalLinkGetter && columnConfigEntry.externalLinkGetterKeyArgs && columnConfigEntry.externalLinkGetter(...columnConfigEntry.externalLinkGetterKeyArgs.map(item => row[item])) &&
                                <ExternalLink style={{color: '#e04dffd9'}} href={columnConfigEntry.externalLinkGetter(...columnConfigEntry.externalLinkGetterKeyArgs.map(item => row[item])) || ''}>
                                  {row[columnConfigEntry.valueKey]}
                                </ExternalLink>
                              }
                              <span 
                                style={
                                  {
                                    ...(columnConfigEntry.numeric && columnConfigEntry.positiveGood && row[columnConfigEntry.valueKey] > 0 && {color: '#00d200'}),
                                    ...(columnConfigEntry.numeric && columnConfigEntry.negativeBad && row[columnConfigEntry.valueKey] < 0 && {color: 'red'}),
                                    ...(columnConfigEntry.tCellStyle && columnConfigEntry.tCellStyle),
                                  }
                                }
                              >
                                {!columnConfigEntry?.internalLinkGetter && (!columnConfigEntry?.externalLinkGetter || (columnConfigEntry.externalLinkGetterKeyArgs && !columnConfigEntry.externalLinkGetter(...columnConfigEntry.externalLinkGetterKeyArgs.map(item => row[item])))) &&
                                  <>
                                    {columnConfigEntry.valueFormatter && !columnConfigEntry.valueFormatterKeyArgs && columnConfigEntry.valueFormatter(row[columnConfigEntry.valueKey])}
                                    {columnConfigEntry.valueFormatter && columnConfigEntry.valueFormatterKeyArgs && columnConfigEntry.valueFormatter(...columnConfigEntry.valueFormatterKeyArgs.map(item => row[item]))}
                                    {columnConfigEntry.valueFormatterAsElement && !columnConfigEntry.valueFormatterKeyArgs ? columnConfigEntry.valueFormatterAsElement(row[columnConfigEntry.valueKey]) : ''}
                                    {columnConfigEntry.valueFormatterAsElement && columnConfigEntry.valueFormatterKeyArgs && columnConfigEntry.valueFormatterAsElement(...columnConfigEntry.valueFormatterKeyArgs.map(item => row[item]))}
                                    {!columnConfigEntry.valueFormatter && !columnConfigEntry.valueFormatterAsElement && row[columnConfigEntry.valueKey]}
                                  </>
                                }
                              </span>
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
              {(loadingRows > 0) && (emptyRows === 0) && (!tableData || (tableData.length === 0)) && (
                <TableRow
                  style={{
                    height: 53 * loadingRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
              {showNoRecordsFound && 
                <TableRow>
                  <TableCell colSpan={6}>
                    No Records Found
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}