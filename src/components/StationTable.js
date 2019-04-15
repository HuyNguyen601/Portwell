import React from 'react'
import { Link } from 'gatsby'
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui'
import {IntegratedPaging, PagingState} from '@devexpress/dx-react-grid'

import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'


//***********STATE IS HERE ******///////////////
export default class StationTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      columnWidths: [
        { columnName: 'apt_id', width: 200 },
        { columnName: 'status', width: 100 },
        { columnName: 'station', width: 100 },
        { columnName: 'batch_no', width: 100 },
        { columnName: 'date_start', width: 200 },
        { columnName: 'date_end', width: 200 },
        { columnName: 'open_reason', width: 160 },
        { columnName: 'exit_reason', width: 160 },
      ],
      columns: [
        {
          name: 'apt_id',
          title: 'UID',
        },
        {
          name: 'status',
          title: 'Status',
        },
        {
          name: 'station',
          title: 'Station',
        },
        {
          name: 'batch_no',
          title: 'Batch Number',
        },
        {
          name: 'date_start',
          title: 'Date Start',
        },
        {
          name: 'date_end',
          title: 'Date End',
        },
        {
          name: 'open_reason',
          title: 'Open Reason',
        },
        {
          name: 'exit_reason',
          title: 'Exit Reason',
        },
      ],
      selection: [],
    }
    this.changeWidths = columnWidths =>this.setState({columnWidths})
    this.changeCurrentPage = currentPage=>this.setState({currentPage})
    this.changePageSize = pageSize =>this.setState({pageSize})
  }

  render() {
    const {
      columns,
      columnWidths,
      currentPage,
      pageSize,
      pageSizes,

    } = this.state
    const { rows } = this.props
    return (
      <Grid rows={rows} columns={columns}>
        <PagingState currentPage={currentPage}
          onCurrentPageChange={this.changeCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={this.changePageSize}/>
        <IntegratedPaging/>
        <Table />
        <TableColumnResizing columnWidths={columnWidths} onColumnWidthsChange={this.changeWidths}/>
        <TableHeaderRow />
        <PagingPanel pageSizes={pageSizes}/>
      </Grid>

    )
  }
}
