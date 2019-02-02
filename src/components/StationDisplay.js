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

import {MyDialog} from './MyDialog'
import ActionManagement from './ActionManagement'


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

const toStation = value => {
  const station = value === 0
    ? 'All'
    : value === 1
      ? 'Material R' //this because database only hold 10 varchar
      : value === 2
        ? 'Assembly'
        : value === 3
          ? 'Burn In'
          : 'Packing'
  return station
}

const getStationQty = async order_id =>{
  try{
    const response = await axios.post(common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"getStationQty"}),
        jsonData: JSON.stringify({"search_text": order_id}),
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

const deleteBatch = async ids=>{
  try{
    const response = await axios.post(admin_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"deleteBatchByBatchID"}),
        jsonData: JSON.stringify({"search_text": ids}),
      }))
    return response
  } catch (error){
    console.log(error)
  }
}

//**** STATE IS HERE ****///////
class StationDisplay extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      generate: false, //for new - generate batch dialog
      deleteDialog: false, //for delete dialog
      infoDialog: false, // for general dialogs
      message: '', //dialog message
      value: 0,
      all: 0, //all stations
      mr: 0, //Material Receiving qty
      as: 0, // Assembly qty
      bi: 0, //Burn In qty
      pk: 0, //packing qty
      uid: '',
      newQty: 0,
      deleteIds: [],
      rows: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getDeleteIds = deleteIds=>this.setState({deleteIds})
    this.handleDelete = this.handleDelete.bind(this)

    //this function to close dialog, used for all types
    this.handleClose = type=> e=>{
      this.setState({
        [type]: false
      })
    }
  }
  handleDelete = ()=>{
    this.setState({
      deleteDialog: false
    })
    const ids = this.state.deleteIds
    deleteBatch(ids).then(response=>{
      let message = ''
      let qty = 0
      response.data.rtn.forEach(r=>{
        qty += r.result === 'deleteBatch_success'
          ? r.total : 0
        message += r.result === 'deleteBatch_success'
          ? 'Successfully deleted batch '+r._id +"!\n"
          : 'Failed to delete batch '+r._id +"!\n"
      })
      this.setState({
        message: message,
        infoDialog: true,
        all: this.state.all - qty,
        mr: this.state.mr - qty,
        //update: !this.state.update
      })
      this.props.handleUpdate()
    })
  }
  handleSubmit = ()=>{
    generateBatch(this.props.id, this.state.newQty).then(response=>{
      if(response.data.total > 0){
        this.setState({
          newQty: 0,
          generate: false,
          mr: this.state.mr + response.data.total,
          all: this.state.all+response.data.total,
        //  update: !this.state.update
        })
        //force update table,
        this.props.handleUpdate()
      }
    })
  }

  handleChange = (event, value)=>{
    if(value !== this.state.value){
      this.setState({
        value: value
      })
    }
  }
  handleInput = type=> event=>{
    if(type==='newQty' && event.target.value > this.props.qtyRemain)
      return
    this.setState({
      [type]: event.target.value
    })
  }


  componentWillReceiveProps(props){
    if(props.id !== this.props.id || props.updateAction !== this.props.updateAction){
      getStationQty(props.id).then(response=>{
        if(response.data.total > 0){
          const rows = response.data.rows
          const temp = {
            mr: 0,
            bi: 0,
            as: 0,
            pk: 0
          }
          rows.forEach(row=>{
            switch(row.station){
              case 'Material R':
                temp.mr = row.qty
                break
              case 'Assembly':
                temp.as = row.qty
                break
              case 'Burn In':
                temp.bi = row.qty
                break
              case 'Packing':
                temp.pk = row.qty
                break
              default: break
            }
          })
          temp.all = temp.as + temp.bi + temp.mr + temp.pk
          this.setState(temp)
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
    if(this.props.id !== ''){
    getStationQty(this.props.id).then(response=>{
      if(response.data.total > 0){
        const rows = response.data.rows
        const temp = {
          mr: 0,
          bi: 0,
          as: 0,
          pk: 0
        }
        rows.forEach(row=>{
          switch(row.station){
            case 'Material R':
              temp.mr = row.qty
              break
            case 'Assembly':
              temp.as = row.qty
              break
            case 'Burn In':
              temp.bi = row.qty
              break
            case 'Packing':
              temp.pk = row.qty
              break
            default: break
          }
        })
        temp.all = temp.as + temp.bi + temp.mr + temp.pk
        this.setState(temp)
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

  render() {
    const {rows, value, all, mr, as, bi, pk, uid, generate, newQty, deleteIds, deleteDialog, infoDialog, message} = this.state
    const {classes, id, order_no, qtyRemain, updateQty} = this.props
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
        <div>
          <Fab color="primary" aria-label="Add" onClick={e=>this.setState({generate: true})} className={classes.fab} disabled={!qtyRemain}>
            <AddIcon />
          </Fab>
          <Fab color='secondary' aria-label='Delete' onClick={e=>this.setState({deleteDialog:true})} className={classes.fab} disabled={deleteIds.length===0}>
            <DeleteIcon />
          </Fab>
          <Button variant = 'contained' className={classes.button} disabled>
            <Print className ={classes.leftIcon} />
            Small Label
          </Button>
          <Button variant = 'contained' className={classes.button} disabled>
            <Print className ={classes.leftIcon} />
            Large Label
          </Button>
        </div>
      }
      { (value !== 1 && value !== 0) && //Any station but All and MR
        <ActionManagement station={toStation(value)} id={id} handleOrderId={this.props.handleOrderId}/>
      }

      <StationTable station={toStation(value)} id={id} getDeleteIds={this.getDeleteIds} update={updateQty}/>
      <MyDialog title='Generate Batch' open={generate} handleClose={this.handleClose('generate')} handleSubmit={this.handleSubmit}>
        <TextField id="batch_qty" className={classes.textField} label="Qty" value={newQty} onChange={this.handleInput('newQty')} margin="normal" variant='outlined' required style={{width: 500}}/>
      </MyDialog>
      <MyDialog title='Confirm Delete' open={deleteDialog} handleClose={this.handleClose('deleteDialog')} handleSubmit={this.handleDelete}>
        Are you sure you want to delete these record(s)?
      </MyDialog>
      <MyDialog title='Info Dialog' open={infoDialog} handleClose={this.handleClose('infoDialog')}>
        {message.split("\n").map((m,key)=>
          <div key={key}>{m}</div>
        )}
      </MyDialog>
    </Paper>)
  }
}

export default withStyles(styles)(StationDisplay)
