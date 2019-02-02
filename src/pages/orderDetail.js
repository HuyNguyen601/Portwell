import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Layout from '../components/layout'
import SEO from '../components/seo'
import MyTable from '../components/MyTable'
import {styles} from '../utils/styles'
import OrderInfo from '../components/OrderInfo'
import StationDisplay from '../components/StationDisplay'
//for xhr
import axios from 'axios'
import qs from 'qs'
import {common_url} from '../config/config'

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
/*

  */
const getOrderId = async order_no =>{
  try{
    const response = await axios.post(common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"searchOrderByOrder"}),
        jsonData: JSON.stringify({"search_text": order_no,"search_form":"Material Receiving"}),
      }))
    return response
  } catch (error){
    console.log(error)
  }
}

class OrderDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.props.location.state === null ? '' : this.props.location.state.id,
      order_no: '',
      qty_remain: 0,
      qty_mr: 0,
      qty_order: 0,
      cust_code: '',
      item_no: '',
      result: 'Result',
      updateAction: false, //toggle to update child components, when add or update actions in stations
      updateQty: false //toggle to update Qty info, when generate or delete batch
    }
    this.handleChange = type=>e=>{
      this.setState({
        [type]: e.target.value
      })
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleOrderId = value=>this.setState({id: value, updateAction: !this.state.updateAction})
    this.handleUpdate = ()=>this.setState({updateQty: !this.state.updateQty})
  }

  handleSubmit = e=>{
    e.preventDefault()
    getOrderId(this.state.order_no).then(response=>{
      if(response.data.total>0){
        this.setState({
          id: response.data.rows[0].order_id,
          result: 'Found '+response.data.total +' order id.'
        })
      }
      else {
        this.setState({
          id: '',
          result: 'No order found!'
        })
      }
    })
  }

  componentDidUpdate(prevProps, prevState){
    const {id, updateQty} = this.state
    console.log(updateQty, prevState.updateQty)
    if(prevState.id !== id || prevState.updateQty !== updateQty){
      getOrderInfo(id).then(response=>{
        if(response.data.total>0){
          const state = response.data.rows[0]
          state.qty_mr = state.qty_mr === null ? 0 : state.qty_mr
          state.qty_remain = state.qty_order - state.qty_mr
          this.setState(state)
        }
        else {
          this.setState({
            item_no: '',
            cust_code: '',
            qty_order: 0,
            qty_mr: 0,
            qty_remain: 0
          })
        }
      })
    }
  }

  componentDidMount(){
    const {id} = this.state
    if(id !== ''){
      getOrderInfo(id).then(response=>{
        if(response.data.total>0){
          const state = response.data.rows[0]
          state.qty_mr = state.qty_mr === null ? 0 : state.qty_mr
          state.qty_remain = state.qty_order - state.qty_mr
          this.setState(state)
        }
        else {
          this.setState({
            item_no: '',
            cust_code: '',
            qty_order: 0,
            qty_mr: 0,
            qty_remain: 0
          })
        }
      })
    }
  }

  render() {
    const {classes} = this.props
    const {id,result,order_no,qty_remain, qty_mr, qty_order, cust_code, item_no, updateQty, updateAction} = this.state
    const row = {
      order_no: order_no,
      item_no: item_no,
      cust_code: cust_code,
      qty_order: qty_order,
      qty_mr: qty_mr,
      qty_remain: qty_remain
    }
    return (
      <div>
        <SEO title="Order Detail" keywords={[`gatsby`, `application`, `react`]} />

        <main className={classes.content}>
          <div className={classes.appBarSpacer}/>
          <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                className={classes.title}
          >
            Order Detail
          </Typography>
          <Paper>
            <form onSubmit={this.handleSubmit}>
              <TextField id="order_no" className={classes.textField} label="Enter Order Number" value={order_no}
                onChange={this.handleChange('order_no')} margin="normal"
                variant='outlined' autoComplete='off' required style={{width: 500}}
              />
            </form>

          </Paper>
          <OrderInfo row={row} />
          <StationDisplay id={id} qtyRemain={qty_remain} handleOrderId={this.handleOrderId} updateQty={updateQty} handleUpdate={this.handleUpdate} updateAction={updateAction}/>
        </main>
    </div>)
  }
}

export default withStyles(styles)(OrderDetail)
