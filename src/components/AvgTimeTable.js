import React from 'react'

import {Paper, Button} from '@material-ui/core'
import {SortingState, IntegratedSorting , IntegratedPaging, PagingState, SearchState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, PagingPanel, SearchPanel, Toolbar} from '@devexpress/dx-react-grid-material-ui'
import {Link} from 'gatsby'
import {MyDialog} from '../components/MyDialog'
import moment from 'moment'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { api_url } from '../config/config'

class AvgTimeTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      infoDialog: false,
      message: '',
      rows: [],
      searchValue: '',
      columns: [
        {
          name: 'order_no',
          title: 'Order No'
        },
        {
          name: 'item_no',
          title: 'Part No'
        },
        {
          name: 'qty_order',
          title: 'Qty'
        },
        {
          name: 'avg_time',
          title: 'Time(Minute)'
        },
        {
          name: 'cust_code',
          title: 'Customer',
        },
        {
          name: 'date_order',
          title: 'Date Order'
        },
        {
          name: 'date_delivery',
          title: 'Date Delivery'
        },
      ],
      columnWidths: [
        {
          columnName: 'order_no',
          width: 150,
        },
        {
          columnName: 'qty_order',
          width: 120,
        },
        {
          columnName: 'avg_time',
          width: 150,
        },
        {
          columnName: 'cust_code',
          width: 150,
        },
        {
          columnName: 'date_order',
          width: 150,
        },
        {
          columnName: 'date_delivery',
          width: 150,
        },
        {
          columnName: 'item_no',
          width: 200,
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
    this.handleClose = type=>e=>this.setState({[type]: false})
    this.handleChange= type=>value=>this.setState({[type]: value})
    this.getAvgTime = this.getAvgTime.bind(this)
  }

  getAvgTime = async ()=>{
    try {
      const url = api_url+'/AvgTimePerUnit.php'
      const response = await axios.get(url)
      if(response.data.total > 0){
        const rows = response.data.rows
        rows.forEach(row=>{
          row.date_delivery = moment(row.date_delivery.date).format('MM/DD/YYYY')
          row.date_order = moment(row.date_order.date).format('MM/DD/YYYY')
        })
        this.setState({rows})
      } else {
        this.setState({
          rows: [],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidUpdate(prevProps, prevState){

  }

  componentDidMount(props){
    this.getAvgTime()
  }



  render() {
    const {
      sorting,
      rows,
      columns,
      columnWidths,
      infoDialog,
      message,
      searchValue,
    } = this.state
    const {from, to} = this.props
    const filterRows = rows.filter(row=>{
      if(moment(row.date_delivery, 'MM/DD/YYYY') >= moment(from, 'MM/DD/YYYY')
        && moment(row.date_delivery, 'MM/DD/YYYY') <= moment(to, 'MM/DD/YYYY')
        && ((!!row.order_no && row.order_no.includes(searchValue))
          || (!!row.item_no && row.item_no.includes(searchValue))
          || (!!row.cust_code && row.cust_code.includes(searchValue)))){
            return row
          }
    })
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={filterRows} columns={columns}>
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        <IntegratedSorting/>
        <PagingState />
        <IntegratedPaging />
        <SearchState
          value={searchValue}
          onValueChange={this.handleChange('searchValue')}
        />
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange = {this.changeWidths}
        />
        <TableHeaderRow showSortingControls/>
        <Toolbar/>
        <SearchPanel />
        <PagingPanel />
      </Grid>
      <MyDialog
        title="Info Dialog"
        open={infoDialog}
        handleClose={this.handleClose('infoDialog')}
      >
        {message.split("\n").map((m,key)=>
          <div key={key}>{m}</div>
        )}
      </MyDialog>
    </Paper>)
  }
}

export default AvgTimeTable
