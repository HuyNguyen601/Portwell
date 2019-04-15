import React from 'react'

import {Paper, Button} from '@material-ui/core'
import {SortingState, IntegratedSorting , IntegratedPaging, PagingState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, PagingPanel} from '@devexpress/dx-react-grid-material-ui'

class ReportTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [
        {
          name: 'uid_link',
          title: 'UID'
        },
        {
          name: 'status_button',
          title: 'Status'
        },
        {
          name: 'collected',
          title: 'SN Collected'
        },
        {
          name: 'sn',
          title: 'KIT SN'
        },
      ],
      columnWidths: [
        {
          columnName: 'uid_link',
          width: 300,
        },
        {
          columnName: 'status_button',
          width: 250,
        },
        {
          columnName: 'collected',
          width: 250,
        },
        {
          columnName: 'sn',
          width: 400,
        }],
      sorting: [
        {
          columnName: 'collected',
          direction: 'asc'
        }
      ]

    }
    this.changeWidths = columnWidths=>this.setState({columnWidths})
    this.changeSorting = sorting => this.setState({sorting})
  }


  render() {
    const {
      sorting,
      columns,
      columnWidths,
    } = this.state
    const {
      info_rows,
      report_rows,
    } = this.props
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={info_rows} columns={[
        {
          name: 'qty_order',
          title: 'Qty Order',
        },
        {
          name: 'qty_receive',
          title: 'Qty Receive',
        },
        {
          name: 'sn_collected',
          title: 'SN Collected',
        },
        ]
      }>
        <Table/>
        <TableHeaderRow/>
      </Grid>
      <Grid rows={report_rows} columns={columns}>
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        <IntegratedSorting/>
        <PagingState />
        <IntegratedPaging />
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange = {this.changeWidths}
        />
        <TableHeaderRow showSortingControls/>
        <PagingPanel />
      </Grid>
    </Paper>)
  }
}

export default ReportTable
