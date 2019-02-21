import React from 'react'

import Paper from '@material-ui/core/Paper'
import {SortingState, IntegratedSorting ,IntegratedSelection, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableSelection} from '@devexpress/dx-react-grid-material-ui'




class WorksheetTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sorting: [
        {
          columnName: '_id',
          direction: 'desc'
        }
      ]

    }
    this.changeSorting = sorting => this.setState({sorting})
  }



  render() {
    const {
      sorting
    } = this.state
    const {
      rows,
      columns,
      columnWidths,
      changeWidths,
      selection,
    } = this.props
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={rows} columns={columns}>
        <SelectionState
            selection={selection}
            onSelectionChange={this.props.onSelectionChange}
          />
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        <IntegratedSorting/>
        <IntegratedSelection/>
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange = {changeWidths}
        />

        <TableHeaderRow showSortingControls/>

        {!!selection &&<TableSelection
            //selectByRowClick
            highlightRow
            showSelectionColumn
            showSelectAll
          />}
      </Grid>
    </Paper>)
  }
}

export default WorksheetTable
