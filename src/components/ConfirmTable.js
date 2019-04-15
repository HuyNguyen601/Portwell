import React from 'react'
import Paper from '@material-ui/core/Paper'
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-material-ui'

class ConfirmTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columnWidths: [
        {
          columnName: 'item_type',
          width: 200,
        },
        {
          columnName: 'descript',
          width: 400,
        },
        {
          columnName: 'itemno',
          width: 200,
        },
        {
          columnName: 'model',
          width: 250,
        },
        {
          columnName: 'qty',
          width: 80,
        }
      ]
    }
    this.changeWidths = columnWidths=>this.setState({columnWidths})
  }

  render() {
    const { rows, columns } = this.props
    const {columnWidths} = this.state
    return (
      <Paper>
        <Grid rows={rows} columns={columns}>
          <Table />
          <TableColumnResizing columnWidths={columnWidths} onColumnWidthsChange={this.changeWidths}/>
          <TableHeaderRow />
        </Grid>
      </Paper>
    )
  }
}

export default ConfirmTable
