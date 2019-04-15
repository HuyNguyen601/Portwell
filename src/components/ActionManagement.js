import React from 'react'
import {
  TextField,
  Select,
  FormControl,
  InputLabel,
  Input,
  MenuItem,
  Tooltip,
  Button,
  Grid,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import { MyDialog } from './MyDialog'
import { getUser } from '../services/auth'
import StationTable from './StationTable'

import axios from 'axios'
import qs from 'qs'
import { common_url, admin_url } from '../config/config'

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 300,
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: '20px',
  },
})

class ActionManagement extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      permission: !!getUser().user_id,
      uid: '',
      rows: [],
      batch_rows: [],
      completeCheck: true, //check if batch can be batch complete
      startCheck: true, //check if batch can be batch start
      batch_no: '',
      multiple: false, // for multiple dialog
      multipleReason: 'Troubleshooting', //for multiple reason value
      reason: 'Completed', // for exit reason value
      exit: false, //for exit dialog,
      message: '', //for info dialog message
      result: '', //for set action result
      info: false, //for info dialog
    }

    this.order_id = ''
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.handleClose = type => e => this.setState({ [type]: false })
    this.handleChange = type => e => this.setState({ [type]: e.target.value })
    this.getBatch = this.getBatch.bind(this)
    this.startBatch = this.startBatch.bind(this)
    this.completeBatch = this.completeBatch.bind(this)
    this.getAction = this.getAction.bind(this)
    this.setAction = this.setAction.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSubmitBatch = this.handleSubmitBatch.bind(this)
    this.submitExitAction = this.submitExitAction.bind(this)
    this.submitMultipleAction = this.submitMultipleAction.bind(this)
  }

  getAction = async () => {
    const { uid } = this.state
    const { station } = this.props
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchActionByAPTID' }),
          jsonData: JSON.stringify({ search_text: uid, search_form: station }),
        })
      )
      if (response.data.total > 0) {
        this.setState({
          rows: response.data.rows,
        })
      } else {
        //cannot find this uid
        this.setState({
          message: 'Cannot find this UID!',
          info: true,
          rows: [],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  setAction = async (start, reason) => {
    const act = start ? 'addActionByAPTID' : 'updateActionByAPTID'
    const { station } = this.props
    const uid = this.state.uid.toUpperCase() // change all to uppercase
    try {
      const response = await axios.post(
        admin_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({
            act: act,
            userid: getUser().user_id,
            location: getUser().location,
          }),
          jsonData: JSON.stringify({
            search_text: uid,
            search_form: station,
            reason: reason,
          }),
        })
      )
      if (!!response) {
        if (response.data.result === 'insertAction_success') {
          const result =
            'Successfully added action for ' +
            response.data._id +
            ' in ' +
            this.props.station +
            '!'

          this.getAction()
          this.setState({ result: result, uid: '' })
        } else if (response.data.result === 'updateAction_success') {
          const result =
            'Successfully updated action for ' +
            response.data._id +
            ' in ' +
            this.props.station +
            '!'

          this.getAction()
          this.setState({ result: result, uid: '' })
        } else {
          const result = 'Failed to add/update action'
          this.setState({ result: result, uid: '' })
        }
        this.props.handleOrderId(this.order_id)
      }
    } catch (error) {
      console.log(error)
    }
  }
  handleSubmit = async e => {
    if (e.key === 'Enter' || e.keycode === '13') {
      const { uid } = this.state
      const { station } = this.props
      try {
        const response = await axios.post(
          common_url,
          qs.stringify({
            id: 'developer',
            jsonMeta: JSON.stringify({ act: 'searchActionByAPTID' }),
            jsonData: JSON.stringify({
              search_text: uid,
              search_form: station,
            }),
          })
        )
        const data = response.data
        if (data.total > 0) {
          const station = data.rows[0].station
          const status = data.rows[0].status
          this.order_id = data.rows[0].order_id
          if (
            station.trim() !== this.props.station &&
            !status.includes('Completed')
          ) {
            //Not completed, stuck in another station
            this.setState({
              message:
                'This UID is under station - ' +
                station +
                ' and status is ' +
                status +
                '. Please go to station ' +
                station +
                '!',
              info: true,
              rows: response.data.rows,
            })
            this.props.handleOrderId(this.order_id)
          } else if (
            station.includes(this.props.station) &&
            status.includes('Open')
          ) {
            //open in this station, end the action, let user choose how to end, reasons dialog
            //modal to endAction
            this.setState({ exit: true, rows: response.data.rows })
          } else {
            let multiple = false
            data.rows.forEach(row => {
              if (
                row.station.includes(this.props.station) &&
                row.status.includes('Completed')
              ) {
                multiple = true
                this.setState({ multiple: true, rows: response.data.rows })
              }
            })
            if (!multiple) {
              this.setAction(true, 'Open')
            }
          }
        } else {
          //cannot find this uid
          this.setState({
            message: 'Cannot find this UID!',
            info: true,
            rows: [],
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
  handleSubmitBatch = e => {
    if (e.key === 'Enter' || e.keycode === '13') {
      this.getBatch()
    }
  }
  getBatch = async e => {
    const { batch_no } = this.state
    const { station } = this.props
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'getBatchAction' }),
          jsonData: JSON.stringify({ batch_no: batch_no }),
        })
      )
      if (response.data.total > 0) {
        const rows = response.data.rows
        let completeCheck = true
        let startCheck = true
        rows.forEach(row => {
          if (
            row.station !== rows[0].station ||
            row.status !== rows[0].status
          ) {
            completeCheck = false
            startCheck = false
          }
          if (row.status === 'Open') {
            startCheck = false
          } else {
            completeCheck = false
          }
        })
        this.setState({
          rows: rows,
          batch_rows: rows,
          completeCheck,
          startCheck,
        })
        this.props.handleOrderId(rows[0].order_id)
      } else {
        //cannot find this uid
        this.setState({
          message: 'Cannot find any actions with this Batch No!',
          info: true,
          rows: [],
          batch_rows: [],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  startBatch = async e => {
    const { batch_rows, startCheck } = this.state
    if (startCheck) {
      const batch_no = this.state.batch_no
      const station = this.props.station
      try {
        const response = await axios.post(
          admin_url,
          qs.stringify({
            id: 'developer',
            jsonMeta: JSON.stringify({
              act: 'startBatchByStation',
              userid: getUser().user_id,
              location: getUser().location,
            }),
            jsonData: JSON.stringify({ batch_no: batch_no, station: station }),
          })
        )
        const total = response.data.total
        if (total) {
          this.setState({
            info: true,
            message:
              'Completed ' + total + ' units in ' + station + ' station!',
          })
          this.getBatch()
        } else {
          this.setState({
            info: true,
            message: 'No unit to start in ' + station + ' station!',
          })
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      let message = ''
      const middle = Math.floor(batch_rows.length / 2)
      batch_rows.forEach(row => {
        if (row.status === 'Open') {
          message += row.apt_id + ' status is Open!\n'
        }
        if (row.station !== batch_rows[middle].station) {
          console.log(row.station, batch_rows[middle].station)
          message += row.apt_id + ' is in ' + row.station + '!\n'
        }
      })
      this.setState({ message, info: true })
    }
  }
  completeBatch = async e => {
    const { completeCheck, batch_rows } = this.state
    if (completeCheck) {
      const batch_no = this.state.batch_no
      const station = this.props.station
      try {
        const response = await axios.post(
          admin_url,
          qs.stringify({
            id: 'developer',
            jsonMeta: JSON.stringify({
              act: 'completeBatchByStation',
              userid: getUser().user_id,
              location: getUser().location,
            }),
            jsonData: JSON.stringify({ batch_no: batch_no, station: station }),
          })
        )
        const total = response.data.total
        if (total) {
          this.setState({
            info: true,
            message:
              'Completed ' + total + ' units in ' + station + ' station!',
          })
          this.getBatch()
        } else {
          this.setState({
            info: true,
            message: 'No unit to complete in ' + station + ' station!',
          })
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      let message = ''
      batch_rows.forEach(row => {
        if (row.status !== 'Open') {
          message += row.apt_id + ' status is ' + row.status + '!\n'
        }
        if (row.station.trim() !== this.props.station) {
          message += row.apt_id + ' is in ' + row.station + '!\n'
        }
      })
      this.setState({ message, info: true })
    }
  }
  submitExitAction = e => {
    this.setState({
      exit: false,
    })
    this.setAction(false, this.state.reason)
  }
  submitMultipleAction = e => {
    this.setState({
      multiple: false,
    })
    this.setAction(true, this.state.multipleReason)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.station !== this.props.station) {
      this.setState({
        message: '',
      })
    }
  }

  render() {
    const { classes, station } = this.props
    const {
      batch_no,
      rows,
      uid,
      multiple,
      reason,
      result,
      exit,
      multipleReason,
      info,
      message,
      permission,
      batch_rows,
      startCheck,
      completeCheck,
    } = this.state
    return (
      <div>
        <Grid container spacing={24}>
          <Grid item xs={4}>
            <Tooltip
              title={
                permission
                  ? 'Enter UID'
                  : "You don't have permission to do this"
              }
            >
              <span>
                <TextField
                  id="action_input"
                  className={classes.textField}
                  disabled={!permission}
                  label="Enter UID"
                  value={uid}
                  onChange={this.handleInput('uid')}
                  onKeyPress={this.handleSubmit}
                  margin="normal"
                  variant="outlined"
                  required
                  style={{width: '100%'}}
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={8}>
            <TextField
              id="result_output"
              className={classes.textField}
              disabled
              label="Result"
              value={result}
              margin="normal"
              variant="outlined"
              style={{width: '90%'}}
            />
          </Grid>
        </Grid>
        <Tooltip
          title={
            permission
              ? 'Enter Batch Number'
              : "You don't have permission to do this"
          }
        >
          <span>
            <TextField
              id="batch_input"
              className={classes.textField}
              disabled={!permission}
              label="Enter Batch Number"
              onKeyPress={this.handleSubmitBatch}
              value={batch_no}
              onChange={this.handleInput('batch_no')}
              margin="normal"
              variant="outlined"
              required
              style={{
                width: 500,
              }}
            />
          </span>
        </Tooltip>
        <Tooltip
          title={
            permission ? 'Start Batch' : "You don't have permission to do this"
          }
        >
          <span>
            <Button
              variant="contained"
              onClick={this.startBatch}
              disabled={!permission || batch_rows.length === 0}
              className={classes.button}
              color={startCheck ? 'primary' : 'secondary'}
            >
              Start Batch
            </Button>
          </span>
        </Tooltip>
        <Tooltip
          title={
            permission
              ? 'Complete Batch'
              : "You don't have permission to do this"
          }
        >
          <span>
            <Button
              variant="contained"
              onClick={this.completeBatch}
              disabled={!permission || batch_rows.length === 0}
              className={classes.button}
              color={completeCheck ? 'primary' : 'secondary'}
            >
              Complete Batch
            </Button>
          </span>
        </Tooltip>
        <StationTable rows={rows} />
        <MyDialog
          title="Scan Out"
          open={exit}
          handleClose={this.handleClose('exit')}
          handleSubmit={this.submitExitAction}
        >
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="exit-reason">Reason</InputLabel>
            <Select
              value={reason}
              onChange={this.handleChange('reason')}
              input={<Input id="exit-reason" />}
            >
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value={'Incomplete ' + station}>
                Incomplete {station}
              </MenuItem>
              <MenuItem value="Material Shortage">Material Shortage</MenuItem>
              <MenuItem value="Troubleshooting">Troubleshooting</MenuItem>
              <MenuItem value="Pending-Customer">
                Pending for Approval - Customer
              </MenuItem>
              <MenuItem value="Pending-Sales">
                Pending for Approval - Sales
              </MenuItem>
              <MenuItem value="Pending-Production">
                Pending for Approval - Production
              </MenuItem>
              <MenuItem value="Pending-QA">Pending for Approval - QA</MenuItem>
              <MenuItem value="Pending-PM">Pending for Approval - PM</MenuItem>
              <MenuItem value="Material Nonconformance">
                Material Nonconformance
              </MenuItem>
              <MenuItem value="Change Priority">Change Order Priority</MenuItem>
              <MenuItem value="Compatibility Issue">
                Compatibility Issue
              </MenuItem>
              <MenuItem value="Partial Built">Partial Built</MenuItem>
              <MenuItem value="Pending-Defective Replacement">
                Pending for Defective Replacement
              </MenuItem>
              <MenuItem value="Pending-Change Order">
                Pending for Change Order
              </MenuItem>
              <MenuItem value="Pending-WI/Traveler">
                Pending for WI/Traveler
              </MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </MyDialog>
        <MyDialog
          title="Multiple Scan In"
          open={multiple}
          handleClose={this.handleClose('multiple')}
          handleSubmit={this.submitMultipleAction}
        >
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="multiple-reason">Reason</InputLabel>
            <Select
              value={multipleReason}
              onChange={this.handleChange('multipleReason')}
              input={<Input id="multiple-reason" />}
            >
              <MenuItem value="Incomplete">Incomplete {station}</MenuItem>
              <MenuItem value="Troubleshooting">Troubleshooting</MenuItem>
              <MenuItem value="Rework">Rework</MenuItem>
              <MenuItem value="Material Nonconformance">
                Material Nonconformance
              </MenuItem>
              <MenuItem value="Material Shortage Fulfill">
                Material Shortage Fulfill
              </MenuItem>
              <MenuItem value="Change Order">Change Order</MenuItem>
              <MenuItem value="Change Priority">Change Order Priority</MenuItem>
              <MenuItem value="Compatibility Issue">
                Compatibility Issue
              </MenuItem>
              <MenuItem value="Workmanship-Invalid Status">
                Workmanship - Invalid Status
              </MenuItem>
              <MenuItem value={'Workmanship-' + station}>
                Workmanship - {station}
              </MenuItem>
              <MenuItem value="Special Requirement">
                Special Requirement - Customer
              </MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </MyDialog>
        <MyDialog
          open={info}
          handleClose={this.handleClose('info')}
          title="Info Dialog"
        >
          {message.split('\n').map((m, key) => (
            <div key={key}>{m}</div>
          ))}
        </MyDialog>
      </div>
    )
  }
}

export default withStyles(styles)(ActionManagement)
