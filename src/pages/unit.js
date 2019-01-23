import React from 'react'
import Typography from '@material-ui/core/Typography'
import {withStyles} from '@material-ui/core/styles'
import SEO from '../components/seo'
import {styles} from '../utils/styles'

import {Paper, TextField} from '@material-ui/core'
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui'

import OrderInfo from '../components/OrderInfo'
import Loading from '../components/Loading'

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

const getUnitHistory = async uid =>{
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

class Unit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      uid: this.props.location.state === undefined ? '' : this.props.location.state.uid,
      result: 'Cannot find any actions!',
      order_id: '',
      order_no: '',
      rows: []
    }
    this.handleChange = type => e =>{
      this.setState ({
        [type]: e.target.value
      })
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.uid !== this.state.uid){
      getUnitHistory(this.state.uid).then(response=>{
        if(response.data.total>0){
          const rows = response.data.rows
          const order_id = rows[0].order_id
          const order_no = rows[0].order_no
          const result = 'Found '+response.data.total+' actions!'
          this.setState({
            rows: rows,
            order_id: order_id,
            result: result
          })
        }
        else {
          this.setState({
            rows: [],
            result: 'Cannot find any actions!'
          })
        }
      })
    }
  }

  componentDidMount(){
    getUnitHistory(this.state.uid).then(response=>{
      if(response.data.total>0){
        const rows = response.data.rows
        const order_id = rows[0].order_id
        const order_no = rows[0].order_no
        const result = 'Found '+response.data.total+' actions!'
        this.setState({
          rows: rows,
          order_id: order_id,
          result: result
        })
      }
    })
  }

  render() {
    const {classes} = this.props
    const {uid, result, rows, order_id} =this.state
    return (<div>
      <SEO title="Unit" keywords={[`gatsby`, `application`, `react`]}/>
      <main className={classes.content}>
        <div className={classes.appBarSpacer}/>
        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
          Unit History
        </Typography>
        <Paper>
          <TextField id="uid" className={classes.textField} label="Enter UID" value={uid} onChange={this.handleChange('uid')} margin="normal" variant='outlined' required style={{width: 500}}/>
          <TextField id="result" className = {classes.textField} label="Result"  value={result} margin="normal" variant='outlined' style={{width: 500}} disabled/>
        </Paper>
        <OrderInfo id={order_id} />
        <Typography component="div" className={classes.tableContainer}>
          <Paper>
            <Grid columns={columns} rows={rows}>
              <Table/>
              <TableHeaderRow/> {this.props.loading && <Loading/>}
            </Grid>
          </Paper>
        </Typography>
      </main>
    </div>)
  }
}

export default withStyles(styles)(Unit)
