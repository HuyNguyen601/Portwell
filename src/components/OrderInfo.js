import React from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

//these two import are for xhr
import qs from 'qs'
import axios from 'axios'
import {common_url} from '../config/config'

const columns = [{
  name: 'order_no',
  title: 'Order No'
}, {
  name: 'item_no',
  title: 'Item Code'
}, {
  name: 'cust_code',
  title: 'Customer'
}, {
  name: 'qty_order',
  title: 'Qty'
}, {
  name: 'qty_mr',
  title: 'Receive'
}, {
  name: 'qty_remain',
  title: 'Remain'
}]
const getOrderInfo = async id=>{
  try{
    const response = await axios.post(common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"searchOrderByID"}),
        jsonData: JSON.stringify({"search_text": id,"search_form":"Material Receiving"}),
      }))
    return response
  } catch (error){
    console.log(error)
  }
}
export default class OrderInfo extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      order_no: '',
      item_no: '',
      cust_code: '',
      qty_order: 0,
      qty_mr: 0,
      qty_remain: 0
    }
  }
  componentDidUpdate(prevProps){
    if(prevProps.id !== this.props.id){
      getOrderInfo(this.props.id).then(response=>{
        const state = response.data.rows[0]
        state.qty_mr = state.qty_mr === null ? 0 : state.qty_mr
        state.qty_remain = state.qty_order - state.qty_mr
        this.setState(state)
      })
    }
  }

  componentDidMount(){
    getOrderInfo(this.props.id).then(response=>{
      if(response.data.total >0)
      {
        const state = response.data.rows[0]
        state.qty_mr = state.qty_mr === null ? 0 : state.qty_mr
        state.qty_remain = state.qty_order - state.qty_mr
        this.setState(state)
        this.props.onChange(state.order_no)
      }
    })

  }



  render() {
    const rows = [this.state]
    return (
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(column=>(
              <TableCell align="right" key={column.name}> {column.title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
        {rows.map(row=>(
          <TableRow key={row.order_id}>
            {columns.map(column=>(
              <TableCell align="right" key={row.order_id+'_'+column.name}> {row[column.name]}</TableCell>
            ))}
          </TableRow>
        ))}
        </TableBody>
      </Table>
    )
  }
}
