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
      id: this.props.location.state.id,
      order_no: '',
      result: 'Result'
    }
    this.handleChange = type=>e=>{
      this.setState({
        [type]: e.target.value
      })
    }
    //this.stationChange = this.stationChange.bind(this)
    //this.openOrder = this.openOrder.bind(this)
    //this.orderChange = this.orderChange.bind(this)
  }
  componentDidUpdate(prevProps, prevState){
    if(prevState.order_no !== this.state.order_no){
      getOrderId(this.state.order_no).then(response=>{
        if(response.data.total>0){
          this.setState({
            id: response.data.rows[0].order_id,
            result: 'Found '+response.data.total +' order id.'
          })
        }
        else {
          this.setState({
            result: 'No order found!'
          })
        }
      })
    }
  }

  componentDidMount(){


  }

  render() {
    const {classes} = this.props
    const {id,result,order_no} = this.state
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

            <TextField id="order_no" className={classes.textField} label="Enter Order Number" value={order_no} onChange={this.handleChange('order_no')} margin="normal" variant='outlined' required style={{width: 500}}/>
            <TextField id="result" className = {classes.textField} label="Result"  value={result} margin="normal" variant='outlined' style={{width: 500}} disabled/>
          </Paper>
          <OrderInfo id = {id} onChange={order_no=>this.setState({order_no})}/>
          <StationDisplay id={id} orderNo={order_no}/>


        </main>

    </div>)
  }
}

export default withStyles(styles)(OrderDetail)
