import React from 'react'
import Typography from '@material-ui/core/Typography'
import {withStyles} from '@material-ui/core/styles'
import Layout from '../components/layout'
import SEO from '../components/seo'
import {styles} from '../utils/styles'

import {Paper, TextField} from '@material-ui/core'
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui'

import {Link} from 'gatsby'

import OrderInfo from '../components/OrderInfo'
import {Loading} from '../components/Loading'


import axios from 'axios'
import qs from 'qs'
import {common_url} from '../config/config'

const columns = [
  {
    name: 'status',
    title: 'Status'
  }, {
    name: 'batch_no',
    title: 'Batch Number'
  }, {
    name: 'station',
    title: 'Station'
  }, {
    name: 'date_start',
    title: 'Date Start'
  }, {
    name: 'date_end',
    title: 'Date End'
  }, {
    name: 'open_reason',
    title: 'Open Reason'
  }, {
    name: 'exit_reason',
    title: 'Exit Reason'
  }, {
    name: 'location',
    title: 'Location'
  }, {
    name: 'act_by',
    title: 'User'
  }
]

const getUnitHistory = async uid => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "searchActionByAPTID"}),
      jsonData: JSON.stringify({"search_text": uid, "search_form": ""})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

const getOrderInfo = async id => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "searchOrderByID"}),
      jsonData: JSON.stringify({"search_text": id, "search_form": "Material Receiving"})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

class Unit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      uid: !!this.props.location.state
        ? this.props.location.state.uid
        : '',
      order_id: '',
      order_no: '',
      item_no: '',
      cust_code: '',
      qty_order: '',
      qty_mr: '',
      qty_remain: '',
      rows: []
    }
    this.handleChange = type => e => {
      this.setState({[type]: e.target.value})
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit = e => {
    e.preventDefault()
    getUnitHistory(this.state.uid).then(response => {
      if (response.data.total > 0) {
        const rows = response.data.rows
        const order_id = rows[0].order_id
        const station = rows[0].station
        getOrderInfo(order_id).then(response => {
          if (response.data.total > 0) {
            const state = response.data.rows[0]
            state.qty_mr = state.qty_mr === null
              ? 0
              : state.qty_mr
            state.qty_remain = state.qty_order - state.qty_mr
            state.rows = rows
            state.order_no = <Link to='/orderDetail' state={{id: order_id, search: this.state.uid}}> {state.order_no}</Link>
            this.setState(state)
          } else {
            this.setState({item_no: '', cust_code: '', qty_order: 0, qty_mr: 0, qty_remain: 0})
          }
        })
      } else {
        this.setState({rows: []})
      }
    })
  }

componentDidMount() {
  getUnitHistory(this.state.uid).then(response => {
    if (response.data.total > 0) {
      const rows = response.data.rows
      const order_id = rows[0].order_id
      const station = rows[0].station
      getOrderInfo(order_id).then(response => {
        if (response.data.total > 0) {
          const state = response.data.rows[0]
          state.qty_mr = state.qty_mr === null
            ? 0
            : state.qty_mr
          state.qty_remain = state.qty_order - state.qty_mr
          state.rows = rows
          state.order_no = <Link to='/orderDetail' state={{id: order_id, uid: this.state.uid, station: station}}> {state.order_no}</Link>
          this.setState(state)
        } else {
          this.setState({item_no: '', cust_code: '', qty_order: 0, qty_mr: 0, qty_remain: 0})
        }
      })
    }
  })
}

render() {
  const {classes} = this.props
  const {
    uid,
    rows,
    item_no,
    cust_code,
    qty_order,
    qty_mr,
    qty_remain,
    order_no
  } = this.state
  const row = {
    order_no: order_no,
    item_no: item_no,
    cust_code: cust_code,
    qty_order: qty_order,
    qty_mr: qty_mr,
    qty_remain: qty_remain
  }
  return (<Layout title='Unit History'>
    <SEO title="Unit" keywords={[`gatsby`, `application`, `react`]}/>
    <main className={classes.content}>
      <div className={classes.appBarSpacer}/>
      <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
        Unit History
      </Typography>
      <Paper>
        <form onSubmit={this.handleSubmit}>
          <TextField id="uid" className={classes.textField} label="Enter UID" value={uid} onChange={this.handleChange('uid')} margin="normal" variant='outlined' required style={{
              width: 500
            }}/>
        </form>
      </Paper>
      <OrderInfo row={row}/>
      <Typography component="div" className={classes.tableContainer}>
        <Paper>
          <Grid columns={columns} rows={rows}>
            <Table/>
            <TableHeaderRow/> {this.props.loading && <Loading/>}
          </Grid>
        </Paper>
      </Typography>
    </main>
  </Layout>)
}
}

export default withStyles(styles)(Unit)
