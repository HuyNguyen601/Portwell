import React from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper'
import StationTable from './StationTable'
import Badge from '@material-ui/core/Badge';
import {withStyles} from '@material-ui/core/styles'
import axios from 'axios'
import qs from 'qs'
import {common_url, admin_url} from '../config/config'


const styles = theme => ({
  margin: {
    margin: theme.spacing.unit * 2,
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});

const getStationQty = async order_no =>{
  try{
    const response = await axios.post(common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"searchOrderSummary"}),
        jsonData: JSON.stringify({"search_text": order_no}),
      }))
    return response
  } catch (error){
    console.log(error)
  }
}
class StationDisplay extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      value: 0,
      all: 0, //all stations
      mr: 0, //Material Receiving qty
      as: 0, // Assembly qty
      bi: 0, //Burn In qty
      pk: 0, //packing qty
      loading: true,
      rows: []
    }
    this.handleChange = (event,value)=>this.setState({
      value: value,
      loading: true})
    this.handleLoading = ()=>this.setState({loading: false})
  }
  componentDidUpdate(prevProps, prevState){
    if(prevProps.orderNo !== this.props.orderNo){
      getStationQty(this.props.orderNo).then(response=>{
        if(response.data.total > 0){
          const row = response.data.rows[0]
          this.setState({
            all: row.qty_order,
            mr: row.MAR,
            bi: row.BUR,
            as: row.ASM,
            pk: row.PAK
          })
        }
      })
    }

  }


  componentDidMount() {
  }

  render() {
    const {rows, loading, value, all, mr, as, bi, pk} = this.state
    const {classes,id, order_no} = this.props
    return (<Paper>
      <Tabs value={value} variant='fullWidth' indicatorColor="primary" textColor="primary" onChange={this.handleChange}>
        <Tab label={
          <Badge className = {classes.padding} badgeContent={all} max='999' color="primary">
            All
          </Badge>
        }/>
        <Tab label={
          <Badge className = {classes.padding} badgeContent={mr} max='999' color="primary">
            Material Receiving
          </Badge>
        }/><Tab label={
          <Badge className = {classes.padding} badgeContent={as} max='999' color="primary">
            Assembly
          </Badge>
        }/><Tab label={
          <Badge className = {classes.padding} badgeContent={bi} max='999' color="primary">
            Burn In
          </Badge>
        }/><Tab label={
          <Badge className = {classes.padding} badgeContent={pk} max='999' color="primary">
            Packing
          </Badge>
        }/>
      </Tabs>
      <StationTable value={value} id={id} loading={this.state.loading} onLoaded={this.handleLoading}/>
    </Paper>)
  }
}

export default withStyles(styles)(StationDisplay)
