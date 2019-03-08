import React from 'react'
import ReactToPrint from 'react-to-print'

//import Paper from '@material-ui/core/Paper'
import {withStyles} from '@material-ui/core/styles'
import {SortingState, IntegratedSorting, IntegratedPaging, PagingState ,IntegratedSelection, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableColumnVisibility, PagingPanel, Toolbar , TableSelection} from '@devexpress/dx-react-grid-material-ui'
import {Print} from '@material-ui/icons'
import Button from '@material-ui/core/Button';
import JsBarcode from 'jsbarcode'


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
      print: false,
      loading: true,
      rows: [],
      totalCount: 0,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      printSmall: '',
      currentPage: 0,
      selection: [],
      sorting: [
        {
          columnName: '_id',
          direction: 'desc'
        }
      ]

    }
    this.handlePrint = e=>this.setState({print: !this.state.print})
    this.changeSelection = selection => this.setState({selection})
    this.changeSorting = sorting => this.setState({sorting})
    this.changePageSize = pageSize =>this.setState({pageSize})
    this.changeCurrentPage = currentPage=>this.setState({currentPage})
    this.handleBeforePrint = e =>{
      const uids = []
      this.state.selection.forEach(index=>{
        uids.push(this.state.rows[index].uid)
      })
      const uid = uids[0]
      const svg = document.getElementById('svg')
      /*JsBarcode(svg, uid, {
        width: 2,
        height: 100,
        fontOptions: 'bold',
        font: "san serif",
        margin: 20,
        fontSize: 30,
        displayValue: true
      });
      */

      console.log(svg)
      this.setState({printSmall: 'Hi'})
    }
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
    JsBarcode('#svg','Hi')
  }

  render() {
    const {rows, loading, currentPage, pageSize, pageSizes, sorting, columnWidths, selection, printSmall} = this.state
    const {columns, classes} = this.props
    return (<div>
      <ReactToPrint trigger = {()=>
        <Button variant = 'contained' className={classes.button} disabled={selection.length===0}>
          <Print className ={classes.leftIcon} />
            Small Label
        </Button>}
        content={()=>this.componentRef}
        onBeforePrint={this.handleBeforePrint}
        onAfterPrint={this.handlePrint}
      />
      <Button  onClick ={this.handleBeforePrint} variant = 'contained' className={classes.button} disabled={selection.length===0}>
        <Print className ={classes.leftIcon} />
        Large Label
      </Button>
      <div id='print'>
        {printSmall}
        <svg id='svg'></svg>

      </div>
      <Grid rows={rows} columns={columns}>
        <SelectionState
            selection={selection}
            onSelectionChange={this.changeSelection}
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
