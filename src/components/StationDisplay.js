import React from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper'
import StationTable from './StationTable'
import Badge from '@material-ui/core/Badge';
import {TextField} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {Print} from '@material-ui/icons'
import Icon from '@material-ui/core/Icon';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';

import {MyDialog} from '../components/MyDialog'


import axios from 'axios'
import qs from 'qs'
import {common_url, admin_url} from '../config/config'


//styles function for this component only
const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300
  },
  margin: {
    margin: theme.spacing.unit * 2,
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
  fab: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
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
const generateBatch = async (order_id, qty)=>{
  try{
    const response = await axios.post(admin_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"generateBatch"}),
        jsonData: JSON.stringify({"search_text": order_id,"qty": qty}),
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
      generate: false, //for new - generate batch dialog
      value: 0,
      all: 0, //all stations
      mr: 0, //Material Receiving qty
      as: 0, // Assembly qty
      bi: 0, //Burn In qty
      pk: 0, //packing qty
      uid: '',
      newQty: 0,
      loading: true,
      rows: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleLoading = ()=>this.setState({loading: false})

    //this function to close dialog, used for all types
    this.handleClose = type=> e=>{
      this.setState({
        [type]: false
      })
    }
  }
  handleSubmit = ()=>{
    generateBatch(this.props.id, this.state.newQty).then(response=>{
      if(response.data.total > 0){
        this.setState({
          newQty: 0,
          generate: false,
          mr: this.state.mr + response.data.total,
          loading: true
        })
        this.props.onQtyChange(this.props.qtyRemain - response.data.total)
      }

    })
  }

  handleChange = (event, value)=>{
    if(value !== this.state.value){
      this.setState({
        value: value,
        loading: true
      })
    }
  }
  handleInput = type=> event=>{
    if(type==='newQty' && event.target.value >= this.props.qtyRemain)
      return
    this.setState({
      [type]: event.target.value
    })
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
        else {
          this.setState({
            all: 0,
            mr: 0,
            bi: 0,
            as: 0,
            pk: 0,
            uid: ''
          })
        }
      })
    }

  }


  componentDidMount() {
  }

  render() {
    const {rows, loading, value, all, mr, as, bi, pk, uid, generate, newQty} = this.state
    const {classes, id, order_no, qtyRemain} = this.props
    return (<Paper>
      <Tabs value={value} variant='fullWidth' indicatorColor="primary" textColor="primary" onChange={this.handleChange}>
        <Tab label={
          <Badge className = {classes.padding} badgeContent={all} max={999} color="primary">
            All
          </Badge>
        }/>
        <Tab label={
          <Badge className = {classes.padding} badgeContent={mr} max={999} color="primary">
            Material Receiving
          </Badge>
        }/><Tab label={
          <Badge className = {classes.padding} badgeContent={as} max={999} color="primary">
            Assembly
          </Badge>
        }/><Tab label={
          <Badge className = {classes.padding} badgeContent={bi} max={999} color="primary">
            Burn In
          </Badge>
        }/><Tab label={
          <Badge className = {classes.padding} badgeContent={pk} max={999} color="primary">
            Packing
          </Badge>
        }/>
      </Tabs>
      {/*each station has each own buttons*/}
      { value === 0 && //All station buttons
        <Fab color='secondary' aria-label='Delete' className={classes.fab} disabled>
          <DeleteIcon />
        </Fab>
      }
      { (value !== 1 && value !== 0) && //Any station but All and MR
        <TextField id="action_input" className={classes.textField} label="Enter UID" value={uid} onChange={this.handleInput} margin="normal" variant='outlined' required style={{width: 500}}/>
      }
      { value === 1 && //MR station only
      <div>
        <Fab color="primary" aria-label="Add" onClick={e=>this.setState({generate: true})} className={classes.fab} disabled={!qtyRemain}>
          <AddIcon />
        </Fab>
        <Button variant = 'contained' className={classes.button}>
          <Print className ={classes.leftIcon} />
          Small Label
        </Button>
        <Button variant = 'contained' className={classes.button}>
          <Print className ={classes.leftIcon} />
          Large Label
        </Button>
      </div>
      }
      <StationTable value={value} id={id} loading={this.state.loading} onLoaded={this.handleLoading}/>
      <MyDialog title='Generate Batch' open={generate} handleClose={this.handleClose('generate')} handleSubmit={this.handleSubmit}>
        <TextField id="batch_qty" className={classes.textField} label="Qty" value={newQty} onChange={this.handleInput('newQty')} margin="normal" variant='outlined' required style={{width: 500}}/>
      </MyDialog>
    </Paper>)
  }
}

export default withStyles(styles)(StationDisplay)
