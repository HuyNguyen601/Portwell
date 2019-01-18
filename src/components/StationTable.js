import React from 'react'
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui'
import {Loading} from './loading.js'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper'

class StationTable extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      value: 1,
      rows: [],
      loading: true
    }
    this.handleChange = (event,value)=>this.setState({value})
  }


  componentDidMount() {}

  render() {
    const {rows, loading, value} = this.state
    return (<Paper>
      <Tabs value={value} variant='fullWidth' indicatorColor="primary" textColor="primary" onChange={this.handleChange}>
        <Tab label="All"/>
        <Tab label="Material Receiving"/>
        <Tab label="Assembly"/>
        <Tab label="Burn In"/>
        <Tab label="Packing"/>
      </Tabs>
      <Grid columns={[
          {
            name: 'id',
            title: 'ID'
          }, {
            name: 'status',
            title: 'Status'
          }, {
            name: 'descript',
            title: 'Batch Number'
          }, {
            name: 'qty',
            title: 'Qty'
          }, {
            name: 'start_date',
            title: 'Start Date'
          }, {
            name: 'date_delivery',
            title: 'Delivery Date'
          }, {
            name: 'location',
            title: 'Location'
          }, {
            name: 'act_by',
            title: 'User'
          }
        ]} rows={rows}>
        <Table/>
        <TableHeaderRow/>
      </Grid>
    </Paper>)
  }
}

export default StationTable
