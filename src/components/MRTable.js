import React from 'react'
//import { Link } from 'gatsby'
import SubTable from './SubTable'
import Paper from '@material-ui/core/Paper'
import {
  SortingState,
  IntegratedSorting,
  IntegratedPaging,
  PagingState,
  SearchState,
  RowDetailState,
  IntegratedSelection,
  SelectionState,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  TableColumnVisibility,
  PagingPanel,
  Toolbar,
  SearchPanel,
  TableRowDetail,
  TableSelection,
} from '@devexpress/dx-react-grid-material-ui'
import { MyDialog } from './MyDialog'
import axios from 'axios'
import qs from 'qs'
import {Link} from 'gatsby'
import { common_url } from '../config/config'

//***********STATE IS HERE ******///////////////
export default class StationTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      info: false,
      message: '',
      columns: [
        {
          name: 'batch_id',
          title: 'Batch ID',
        },
        {
          name: 'status',
          title: 'Status',
        },
        {
          name: 'batch_no',
          title: 'Batch Number',
        },
        {
          name: 'qty',
          title: 'Qty',
        },
        {
          name: 'start_date',
          title: 'Date Receive',
        },
        {
          name: 'date_delivery',
          title: 'Date Deliver',
        },
        {
          name: 'location',
          title: 'Location',
        },
        {
          name: 'act_by',
          title: 'User',
        },
      ],
      columnWidths: [
        { columnName: 'batch_id', width: 100 },
        { columnName: 'status', width: 200 },
        { columnName: 'batch_no', width: 150 },
        { columnName: 'qty', width: 100 },
        { columnName: 'start_date', width: 200 },
        { columnName: 'date_delivery', width: 200 },
        { columnName: 'location', width: 100 },
        { columnName: 'act_by', width: 100 },
      ],
      selection: [],
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      searchValue: '',
      expandedRowIds: [],
      sorting: [
        {
          columnName: 'batch_id',
          direction: 'desc',
        },
      ],
      rows: [],
    }
    this.changeWidths = columnWidths => this.setState({ columnWidths })
    this.changeSorting = sorting => this.setState({ sorting })
    this.changePageSize = pageSize =>
      this.setState({ pageSize: pageSize, currentPage: 0 })
    this.changeCurrentPage = currentPage => this.setState({ currentPage })
    this.handleClose = type => e => this.setState({ [type]: false })
    this.changeExpandedRowIds = expandedRowIds=>this.setState({expandedRowIds})
    this.loadSubRows = this.loadSubRows.bind(this)
    this.changeSearchValue = this.changeSearchValue.bind(this)
    this.getBatchByBatchNo = this.getBatchByBatchNo.bind(this)
    this.getBatchByOrderID = this.getBatchByOrderID.bind(this)
    this.getBatchDetailByBatchId = this.getBatchDetailByBatchId.bind(this)
    this.changeSelection = selection => {
      if ( // only take 1 selection to update order info
        selection.length - this.state.selection.length === 1 ||
        selection.legnth - this.state.selection.length ===-1
      ) {
        if (selection.length > this.state.selection.length) {
          const index = selection[selection.length - 1]
          const id = this.state.rows[index].order_id
          this.props.updateOrderInfo(id)
        } else {
          const index = this.state.selection[this.state.selection.length - 1]
          const id = this.state.rows[index].order_id
          this.props.updateOrderInfo(id)
        }
      }
      this.setState({ selection })
      const ids = []
      selection.forEach(s => {
        ids.push(this.state.rows[s].batch_id)
      })
      this.props.getDeleteIds(ids)
    }
  }
  changeSearchValue(searchValue) {
    this.setState({
      searchValue,
    })
  }
  loadSubRows = ()=>{
    const {expandedRowIds, rows } = this.state
    const rowIdsWithNotLoadedChilds = expandedRowIds.filter(rowId => rows[rowId].subRows === undefined);
    rowIdsWithNotLoadedChilds.forEach(rowId=>{
      this.getBatchDetailByBatchId(rowId)
    })
  }

  getBatchDetailByBatchId = async (rowId) => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchBatchDetailByBatchID' }),
          jsonData: JSON.stringify({
            search_text: this.state.rows[rowId].batch_id,
            search_form: 'Material Receiving',
          }),
        })
      )
      const data = response.data
      if (data.total > 0) {
        const subRows = data.rows
        subRows.forEach(row => {
          row.uid_link = (
            <Link to="/unit" state={{ uid: row.apt_id }}>
              {row.apt_id}
            </Link>
          )
        })
        const rows = this.state.rows
        rows[rowId].subRows = subRows
        this.setState({rows})
      }
    } catch (error) {
      console.log(error)
    }
  }

  getBatchByBatchNo = async () => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchBatchByBatchNo' }),
          jsonData: JSON.stringify({
            search_text: this.props.batch_no,
            search_form: 'Material Receiving',
          }),
        })
      )
      if (response.data.total > 0) {
        const rows = response.data.rows
        this.setState({ rows, selection: [], expandedRowIds: []})
      } else {
        this.setState({
          selection: [],
          expandedRowIds: [],
          info: true,
          message: 'No Records Found With This Batch Number',
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  getBatchByOrderID = async () => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchBatchByOrderID' }),
          jsonData: JSON.stringify({
            search_text: this.props.id,
            search_form: 'Material Receiving',
          }),
        })
      )
      if (response.data.total > 0) {
        this.setState({
          selection: [],
          expandedRowIds: [],
          rows: response.data.rows,
        })
      } else {
        this.setState({
          info: true,
          message: 'No Records Found With This Order Number',
          selection: [],
          expandedRowIds: [],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.id !== this.props.id ||
      prevProps.batch_no !== this.props.batch_no ||
      this.props.update !== prevProps.update
    ) {
      //Material Receiving stations
      if (this.props.id !== '') {
        this.getBatchByOrderID()
      } else {
        this.getBatchByBatchNo()
      }
    }
    this.loadSubRows()
  }

  componentDidMount(props) {
    //this.loadSubRows()
    if (this.props.id !== '') {
      this.getBatchByOrderID()
    } else {
      this.getBatchByBatchNo()
    }
  }

  render() {
    const {
      columns,
      rows,
      selection,
      columnWidths,
      pageSize,
      currentPage,
      searchValue,
      sorting,
      pageSizes,
      info,
      message,
      expandedRowIds,
    } = this.state
    const { update, uid } = this.props
    const filterRows = rows.filter(row => {
      if (
        row.batch_no.includes(searchValue) ||
        (!!row.act_by && row.act_by.includes(searchValue))
      )
        return row
    })
    return (
      <Paper
        style={{
          position: 'relative',
        }}
      >
        <Grid rows={filterRows} columns={columns}>
          <RowDetailState expandedRowIds={expandedRowIds} onExpandedRowIdsChange={this.changeExpandedRowIds}/>
          <SelectionState
            selection={selection}
            onSelectionChange={this.changeSelection}
          />
          <SortingState
            sorting={sorting}
            onSortingChange={this.changeSorting}
          />
          <PagingState
            currentPage={currentPage}
            onCurrentPageChange={this.changeCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={this.changePageSize}
          />
          <IntegratedSorting />
          <IntegratedPaging />
          <SearchState
            value={searchValue}
            onValueChange={this.changeSearchValue}
          />
          <IntegratedSelection />
          <Table />
          <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange={this.changeWidths}
          />

          <TableHeaderRow showSortingControls />

          <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn
            showSelectAll
          />
          <TableColumnVisibility defaultHiddenColumnNames={['batch_id']} />
          <Toolbar />
          <SearchPanel />
          <TableRowDetail
            contentComponent={({ row }) => <SubTable rows={!!row.subRows ? row.subRows:[]} />}
          />
          <PagingPanel pageSizes={pageSizes} />
        </Grid>
        <MyDialog
          open={info}
          handleClose={this.handleClose('info')}
          title="Info Dialog"
        >
          {message}
        </MyDialog>
      </Paper>
    )
  }
}
