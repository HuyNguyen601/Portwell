import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Layout from '../components/layout'
import SEO from '../components/seo'
import MyTable from '../components/MyTable'
import {styles} from '../utils/styles'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import {common_url} from '../config/config'

import {Link} from 'gatsby'



class OrderList extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      rows: [],
      totalCount: 0,
      columns: [{
        'name': '_id',
        'title': 'ID'
      },
      {
        'name': 'status',
        'title': 'Status'
      },{
        'name': 'order_no',
        'title': 'Order Number'
      },{
        'name': 'cust_name',
        'title': 'Customer'
      },{
        'name': 'qty_order',
        'title': 'Qty'
      },{
        'name': 'date_order',
        'title': 'Order Date'
      },{
        'name': 'date_delivery',
        'title': 'Delivery Date'
      },{
        'name': 'dmethod',
        'title': 'Delivery Method'
      }],
      columnWidths: [
        { columnName: '_id', width: 100 },
        { columnName: 'status', width: 100 },
        { columnName: 'order_no', width: 100 },
        { columnName: 'cust_name', width: 300 },
        { columnName: 'qty_order', width: 100 },
        { columnName: 'date_order', width: 160 },
        { columnName: 'date_delivery', width: 160 },
        { columnName: 'dmethod', width: 160 }
     ],
    }
    this.getOrder = async state =>{
      try{
        const response = await axios.post(common_url,
          qs.stringify({
            id: 'developer',
            jsonMeta: JSON.stringify({"act":"searchOrderListByOrderNo"}),
            jsonData: JSON.stringify({"search_text": state.searchValue}),
            rows: state.pageSize,
            page: state.currentPage+1,
            sidx: state.sorting[0].columnName,
            sord: state.sorting[0].direction
          }))
        if(response.data.total>0){
          const rows = response.data.rows
          rows.forEach(row=>{
            row.order_no = <Link to='/orderDetail' state={{id: row._id}}> {row.order_no}</Link>
          })
          this.setState({
            rows: rows,
            totalCount: response.data.total
          })
        }
        else {
          this.setState({
            totalCount: 0,
            rows: []
          })
        }
      } catch (error){
        console.log(error)
      }
    }
    this.changeSelection = this.changeSelection.bind(this)

  }
  changeSelection(selection){
    this.setState({selection})
  }


  componentDidMount(){


  }

  render() {
  const {classes} = this.props
    return (
      <div>
        <SEO title="Order List" keywords={[`gatsby`, `application`, `react`]} />


        <main className={classes.content}>
          <div className={classes.appBarSpacer}/>
          <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                className={classes.title}
          >
            Order List
          </Typography>
          <Typography component="div" className={classes.tableContainer}>
            <MyTable
              columns={this.state.columns}
              rows={this.state.rows}
              totalCount={this.state.totalCount}
              columnWidths={this.state.columnWidths}
              getData={this.getOrder}
              onSelectionChange ={this.changeSelection}
              remotePaging
            />
          </Typography>
        </main>
  </div>)
  }
}

export default withStyles(styles)(OrderList)
