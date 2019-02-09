import React from 'react'

//import Paper from '@material-ui/core/Paper'
import {withStyles} from '@material-ui/core/styles'
import {SortingState, IntegratedSorting, IntegratedPaging, PagingState ,IntegratedSelection, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableColumnVisibility, PagingPanel, Toolbar , TableSelection} from '@devexpress/dx-react-grid-material-ui'
import {Print} from '@material-ui/icons'
import Button from '@material-ui/core/Button';


import {Loading} from './loading.js'
import {Link} from 'gatsby'

import axios from 'axios'
import qs from 'qs'
import {common_url} from '../config/config'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})

class SubTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      rows: [],
      totalCount: 0,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      selection: [],
      sorting: [
        {
          columnName: '_id',
          direction: 'desc'
        }
      ]

    }

    this.changeSorting = sorting => this.setState({sorting})
    this.changePageSize = pageSize =>this.setState({pageSize})
    this.changeCurrentPage = currentPage=>this.setState({currentPage})
    this.changeCurrentPage = this.changeCurrentPage.bind(this)

    this.getBatchDetailByBatchId = async id=>{
      try {
        const response = await axios.post(common_url, qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({"act": "searchBatchDetailByBatchID"}),
          jsonData: JSON.stringify({"search_text": id, "search_form": "Material Receiving"})
        }))
        const data = response.data
        if(data.total > 0){
          const rows = data.rows
          rows.forEach(row=>{
            row.uid_link = <Link to='/unit' state={{uid: row.apt_id}}>{row.apt_id}</Link>
          })
          this.setState({
            rows: rows,
            totalCount: data.total
          })
        }
        else {
          this.setState({
            rows: [],
            totalCount: 0
          })
        }
      }
      catch (error) {
        console.log(error)
      }

    }

  }



  componentDidMount() {
    this.getBatchDetailByBatchId(this.props.id).then(response=>{
      this.setState({loading: false})
    })
  }

  render() {
    const {rows, loading, currentPage, pageSize, pageSizes, sorting, columnWidths, selection} = this.state
    const {columns, classes} = this.props
    return (<div>
      <Button variant = 'contained' className={classes.button} disabled={selection.length===0}>
        <Print className ={classes.leftIcon} />
        Small Label
      </Button>
      <Button variant = 'contained' className={classes.button} disabled={selection.length===0}>
        <Print className ={classes.leftIcon} />
        Large Label
      </Button>
      <Grid rows={rows} columns={columns}>
        <SelectionState
            selection={selection}
            onSelectionChange={this.props.onSelectionChange}
          />
        <PagingState currentPage={currentPage}
          onCurrentPageChange={this.changeCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={this.changePageSize}/>
        <IntegratedPaging/>

        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>

        <IntegratedSorting/>
        <IntegratedSelection/>
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
        />

        <TableHeaderRow showSortingControls/>

        <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn
            showSelectAll
          />
        <TableColumnVisibility
            defaultHiddenColumnNames={['_id']}
          />
        <Toolbar />
        <PagingPanel pageSizes = {pageSizes} />
      </Grid>
      {loading && <Loading />}
</div>)
  }
}

export default withStyles(styles)(SubTable)
