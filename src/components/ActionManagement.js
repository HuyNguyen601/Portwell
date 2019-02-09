import React from 'react'
import {TextField, Select, FormControl, InputLabel, Input} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'

import {MyDialog} from './MyDialog'

import axios from 'axios'
import qs from 'qs'
import {common_url, admin_url} from '../config/config'

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 300,
  },
})

const getAction = async (uid, station) => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "searchActionByAPTID"}),
      jsonData: JSON.stringify({search_text: uid, search_form: station})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

const setAction = async (start, input, station, reason) =>{
  const act = start ? 'addActionByAPTID' : 'updateActionByAPTID'
  const uid = input.toUpperCase() // change all to uppercase
  try {
    const response = await axios.post(admin_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": act}),
      jsonData: JSON.stringify({search_text: uid, search_form: station, reason: reason})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

class ActionManagement extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      uid: '',
      multiple: false, // for multiple dialog
      multipleReason: 'Troubleshooting', //for multiple reason value
      reason: 'Completed', // for exit reason value
      exit: false, //for exit dialog,
      message: '', //for info dialog message
      result: '', //for set action result
      info: false //for info dialog
    }

    this.order_id = ''

    this.handleInput = e => this.setState({uid: e.target.value})
    this.handleClose = type => e => this.setState({[type]: false})
    this.handleChange = type => e => this.setState({[type]: e.target.value})
    this.handleSubmit = this.handleSubmit.bind(this)
    this.submitExitAction = this.submitExitAction.bind(this)
    this.submitMultipleAction = this.submitMultipleAction.bind(this)
  }

  handleSubmit = e => {
    e.preventDefault()
    getAction(this.state.uid, this.props.station).then(response => {
      const data = response.data
      if (data.total > 0) {
        const station = data.rows[0].station
        const status = data.rows[0].status
        this.order_id = data.rows[0].order_id
        if (station.trim() !== this.props.station && !status.includes('Completed')) {
          //Not completed, stuck in another station
          this.setState({
            message: 'This UID is under station - '+ station + ' and status is ' + status + '. Please go to station '+ station +'!',
            info: true
          })
        } else if (station.includes(this.props.station) && status.includes('Open')) {
          //open in this station, end the action, let user choose how to end, reasons dialog
          //modal to endAction
          this.setState({exit: true})
        } else {
          let multiple = false
          data.rows.forEach(row => {
            if (row.station.includes(this.props.station) && row.status.includes('Completed')) {
              multiple = true
              this.setState({multiple: true})
            }
          })
          if(!multiple) setAction(true, this.state.uid, this.props.station, 'Open').then(response=>{
            const result = !!response && response.data.result === 'insertAction_success'
              ? "Successfully added action for " + response.data._id + " in "+ this.props.station+ "!"
              : "Failed to add action!"
            this.setState({result: result, uid:''})
            this.props.handleOrderId(this.order_id)
          })
        }
      } else {
        //cannot find this uid
        this.setState({
          message: 'Cannot find this UID!',
          info: true
        })
      }
    })
  }

  submitExitAction = e => {
    this.setState({
      exit: false
    })
    setAction(false, this.state.uid, this.props.station, this.state.reason).then(response=>{
      const result = !!response && response.data.result === 'updateAction_success'
        ? "Successfully updated action for " + response.data._id + " in "+ this.props.station+ "!"
        : "Failed to update action!"
      this.setState({result: result, uid: ''})
      this.props.handleOrderId(this.order_id)
    })
  }
  submitMultipleAction = e => {
    this.setState({
      multiple: false
    })
    setAction(true, this.state.uid, this.props.station, this.state.multipleReason).then(response=>{
      const result = !!response && response.data.result === 'insertAction_success'
        ? "Successfully added action for " + response.data._id + " in "+ this.props.station+ "!"
        : "Failed to update action!"
      this.setState({result: result, uid: ''})
      this.props.handleOrderId(this.order_id)
    })
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps !== this.props){
      this.setState({
        message: ''
      })
    }
  }

  render() {
    const {classes, station} = this.props
    const {uid, multiple, reason, result, exit, multipleReason, info, message} = this.state
    return (<div>
      <form onSubmit={this.handleSubmit}>
        <TextField id="action_input" className={classes.textField} label="Enter UID" value={uid} onChange={this.handleInput} margin="normal" variant='outlined' required style={{
            width: 500
          }}/>
        {result}
      </form>
      <MyDialog title='Scan Out' open={exit} handleClose={this.handleClose('exit')} handleSubmit={this.submitExitAction}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor='exit-reason'>Reason</InputLabel>
          <Select value={reason} onChange={this.handleChange('reason')} input={<Input id = 'exit-reason' />}>
            <option value='Completed'>Completed</option>
            <option value={'Incomplete '+station}>Incomplete {station}</option>
            <option value='Material Shortage'>Material Shortage</option>
            <option value='Troubleshooting'>Troubleshooting</option>
            <option value='Pending-Customer'>Pending for Approval - Customer</option>
            <option value='Pending-Sales'>Pending for Approval - Sales</option>
            <option value='Pending-Production'>Pending for Approval - Production</option>
            <option value='Pending-QA'>Pending for Approval - QA</option>
            <option value='Pending-PM'>Pending for Approval - PM</option>
            <option value='Material Nonconformance'>Material Nonconformance</option>
            <option value='Change Priority'>Change Order Priority</option>
            <option value='Compatibility Issue'>Compatibility Issue</option>
            <option value='Partial Built'>Partial Built</option>
            <option value='Pending-Defective Replacement'>Pending for Defective Replacement</option>
            <option value='Pending-Change Order'>Pending for Change Order</option>
            <option value='Pending-WI/Traveler'>Pending for WI/Traveler</option>
            <option value='Other'>Other</option>
          </Select>
        </FormControl>
      </MyDialog>
      <MyDialog title='Multiple Scan In' open={multiple} handleClose={this.handleClose('multiple')} handleSubmit={this.submitMultipleAction}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor='multiple-reason'>Reason</InputLabel>
          <Select value={multipleReason} onChange={this.handleChange('multipleReason')} input={<Input id = 'multiple-reason' />}>
            <option value='Incomplete'>Incomplete {station}</option>
            <option value='Troubleshooting'>Troubleshooting</option>
            <option value='Rework'>Rework</option>
            <option value='Material Nonconformance'>Material Nonconformance</option>
            <option value='Material Shortage Fulfill'>Material Shortage Fulfill</option>
            <option value='Change Order'>Change Order</option>
            <option value='Change Priority'>Change Order Priority</option>
            <option value='Compatibility Issue'>Compatibility Issue</option>
            <option value='Workmanship-Invalid Status'>Workmanship - Invalid Status</option>
            <option value={'Workmanship-'+station}>Workmanship - {station}</option>
            <option value='Special Requirement'>Special Requirement - Customer</option>
            <option value='Other'>Other</option>
          </Select>
        </FormControl>
      </MyDialog>
      <MyDialog open={info} handleClose={this.handleClose('info')} title='Info Dialog'>
        {message}
      </MyDialog>
    </div>)
  }
}

export default withStyles(styles)(ActionManagement)
