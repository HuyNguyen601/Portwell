import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { styles } from '../utils/styles'
import OrderInfo from '../components/OrderInfo'
import StationDisplay from '../components/StationDisplay'

import Grid from '@material-ui/core/Grid'

//for xhr
import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'
import loadingStyles from '../styles/loading.module.css'
//import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';
import { Link } from 'gatsby'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

class Tracking extends React.Component {
  async retrieveTrackingsByUniqueCode() {
    try {
      return await axios.post(
        'http://192.168.0.96:8080/try/api/2.4/api_sfc_com.php',
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'retrieveTrackingsByUniqueCode',
          }),
          jsonData: JSON.stringify({
            unique_code: this.state.unique_code,
          }),
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      unique_code: '',
      trackings: [], //{tracking_no:'', delivered:false, deliverToday:false}]
      vendorName: 'Fedex',
      vendorCode: 'code',
      vendorAddress: 'mock address',
      vendorCountry: 'US',
      via: 'via',
      docType: '',
      docNo: '',
      serialNo: '',
      receivedBy: '',
      receivedDate: '',
      loc: '',
      act: '',
      reason: '',
      collectTrackings: [],
      rejectTrackings: [],
      collecting: false,
      rejecting: false,
    }

    this.handleChange = type => e => {
      this.setState({
        [type]: e.target.value,
      })
    }
    this.collectSingleHandler = this.collectSingleHandler.bind(this)
    this.rejectSingleHandler = this.rejectSingleHandler.bind(this) //value=>this.setState({id: value, updateAction: !this.state.updateAction})
    this.collectSingleOpenHandler = this.collectSingleOpenHandler.bind(this)
    this.rejectSingleOpenHandler = this.rejectSingleOpenHandler.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.receiveHandler = this.receiveHandler.bind(this)
    this.confirmCollectionHandler = this.confirmCollectionHandler.bind(this)
    this.collectHandler = this.collectHandler.bind(this)
    /*this.handleReportClick = this.handleReportClick.bind(this)*/
    //this.handleNewEmailChange = this.handleNewEmailChange.bind(this)
  }

  collectSingleOpenHandler = (index, event) => {
    let tracking = this.state.trackings[index]
    this.setState({ collecting: true })
  }

  rejectSingleOpenHandler = (index, event) => {
    let tracking = this.state.trackings[index]
    this.setState({ rejecting: true })
  }

  collectSingleHandler = event => {
    let tracking = this.state.collectTrackings[0]
    const response = axios
      .post(
        common_url,
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'collectSingleTracking',
          }),
          jsonData: JSON.stringify({
            unique_code: this.state.unique_code,
            tracking_no: tracking.tracking_no,
          }),
        })
      )
      .then(response => {})
      .catch(error => {
        console.error(error)
      })
  }

  rejectSingleHandler = event => {
    let tracking = this.state.rejectTrackings[0]
    const response = axios
      .post(
        common_url,
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'rejectSingleTracking',
          }),
          jsonData: JSON.stringify({
            unique_code: this.state.unique_code,
            tracking_no: tracking.tracking_no,
          }),
        })
      )
      .then(response => {})
      .catch(error => {
        console.error(error)
      })
  }

  handleSubmit = e => {
    e.preventDefault()
  }

  handleClose = type => e => {
    this.setState({
      [type]: false,
    })
  }

  handleChangeMasterNo = e => {
    this.setState({ master_no: e.currentTarget.value })
  }

  receiveHandler = e => {
    this.props.navigate('/editTracking', {
      state: {
        master_no: this.state.master_no,
        trackings: this.state.trackings,
      },
    })
  }

  collectHandler = e => {
    let retrieveTrackingsByUniqueCodeResp = this.retrieveTrackingsByUniqueCode()
    retrieveTrackingsByUniqueCodeResp.then(response => {
      let trackings = response.data
      this.setState({ trackings: trackings })
    })
  }

  confirmCollectionHandler = e => {
    const response = axios
      .post(
        common_url,
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'collectTrackings',
          }),
          jsonData: JSON.stringify({
            unique_code: this.state.unique_code,
          }),
        })
      )
      .then(response => {})
      .catch(error => {
        console.error(error)
      })
  }

  handleTrackingNumChange = (index, event) => {
    let trackings = this.state.trackings
    if (!event.target) return false
    trackings[index].tracking_no = event.target.value
    this.setState({
      trackings: trackings,
    })
  }

  handleTrackingNumDeliveredChange = (index, event) => {
    let trackings = this.state.trackings
    if (!event.target) return false
    trackings[index].deliverToday = event.currentTarget.checked
    this.setState({
      trackings: trackings,
    })
  }

  handleChangeNumOfTrackings = e => {
    var trackings = this.state.trackings
    let l = trackings.length
    if (l > e.currentTarget.value) {
      for (let i = 0; i < l - e.currentTarget.value; i++) {
        trackings.pop()
      }
    } else {
      for (let i = 0; i < e.currentTarget.value - l; i++) {
        trackings.push({
          tracking_no: '',
          delivered: false,
          deliverToday: false,
        })
      }
    }
    this.setState({ trackings: trackings })
  }

  componentDidUpdate(prevProps, prevState) {}

  componentDidMount() {}

  render() {
    const { classes } = this.props
    const {
      id,
      order_no,
      qty_remain,
      qty_mr,
      qty_order,
      cust_code,
      item_no,
      updateQty,
      updateAction,
      orderNo,
    } = this.state
    const row = {
      order_no: orderNo,
      item_no: item_no,
      cust_code: cust_code,
      qty_order: qty_order,
      qty_mr: qty_mr,
      qty_remain: qty_remain,
    }
    return (
      <Layout title="Shipping">
        <SEO title="Collection" keywords={[`gatsby`, `application`, `react`]} />
        <main>
          <div className={classes.appBarSpacer} />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Collection
          </Typography>
          <Paper style={{ float: 'left', width: '400px' }}>
            <TextField
              variant="outlined"
              value={this.state.unique_code}
              label="Unique Code"
              className={classes.margin}
            />
            <br />
            <Button
              variant="contained"
              color="primary"
              className={classes.button + ' ' + classes.margin}
              onClick={this.collectHandler}
            >
              Retrieve
            </Button>
            <br />
            {this.state.trackings.length > 0 ? (
              <React.Fragment>
                <h4>Confirm collection for these trackings?</h4>
                <ul style={{ 'list-style-type': 'none' }}>
                  {this.state.trackings.map((trackingNum, index) => (
                    <li>
                      <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        onClick={this.collectSingleOpenHandler.bind(
                          this,
                          index
                        )}
                      >
                        Collect
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        onClick={this.rejectSingleOpenHandler.bind(this, index)}
                      >
                        Reject
                      </Button>
                      {trackingNum.tracking_no}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={this.confirmCollectionHandler}
                >
                  Collect all
                </Button>
              </React.Fragment>
            ) : (
              <br />
            )}
          </Paper>
          <Paper
            style={{ float: 'left', width: '600px', 'margin-left': '20px' }}
          >
            <FormControl className={classes.formControl}>
              <InputLabel className={classes.labelControl}>
                Quantity: 5
              </InputLabel>
            </FormControl>
            <br />
            <br />
            <br />
            <InputLabel className={classes.labelControl}>
              Vendor Info:
            </InputLabel>
            <br />
            {this.state.trackings.map((trackingNum, index) =>
              trackingNum.deliverToday ? (
                <React.Fragment>
                  <TextField
                    variant="outlined"
                    value={trackingNum.tracking_no}
                    disabled
                  />
                  <TextField
                    variant="outlined"
                    label="Collected By"
                    onChange={this.collectedByChange.bind(this, index)}
                  />
                  <br />
                </React.Fragment>
              ) : (
                ''
              )
            )}
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Vendor Name"
                value={this.state.vendorName}
                onChange={e =>
                  this.setState({ vendorName: e.currentTarget.value })
                }
              />
            </FormControl>
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Vendor Code"
                value={this.state.vendorCode}
                onChange={e =>
                  this.setState({ vendorCode: e.currentTarget.value })
                }
              />
            </FormControl>
            <br />
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Vendor Address"
                value={this.state.vendorAddress}
                onChange={e =>
                  this.setState({ vendorAddress: e.currentTarget.value })
                }
              />
            </FormControl>
            <FormControl className={''} style={{ 'margin-left': '17px' }}>
              <InputLabel
                htmlFor="via_name_sel"
                className={''}
                style={{ 'margin-top': '12px', 'margin-left': '3px' }}
              >
                VIA
              </InputLabel>
              <br />
              <Select
                variant="outlined"
                value={this.state.via}
                style={{ width: '215px' }}
                onChange={e => this.setState({ via: e.target.value })}
                input={
                  <OutlinedInput
                    labelWidth={this.state.labelWidth}
                    name="viaName"
                    id="via_name_sel"
                  />
                }
                style={{
                  height: '58px',
                  width: '234px',
                  'margin-left': '-8px',
                }}
              >
                <MenuItem value="UPS">UPS</MenuItem>
                <MenuItem value="FEDEX">FEDEX</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={''} style={{ 'margin-left': '17px' }}>
              <InputLabel
                htmlFor="doc_type_sel"
                className={''}
                style={{ 'margin-top': '12px', 'margin-left': '3px' }}
              >
                Doc Type
              </InputLabel>
              <br />
              <Select
                variant="outlined"
                value={this.state.docType}
                style={{ width: '215px' }}
                onChange={e => this.setState({ docType: e.target.value })}
                input={
                  <OutlinedInput
                    labelWidth={this.state.labelWidth}
                    name="docType"
                    id="doc_type_sel"
                  />
                }
                style={{
                  height: '58px',
                  width: '234px',
                  'margin-left': '-8px',
                }}
              >
                <MenuItem value="PO">PO</MenuItem>
                <MenuItem value="PR">PR</MenuItem>
                <MenuItem value="RMA">RMA</MenuItem>
                <MenuItem value="Undefined">Undefined</MenuItem>
              </Select>
            </FormControl>
            <br />
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Doc #"
                value={this.state.docNo}
                onChange={e => this.setState({ docNo: e.currentTarget.value })}
              />
            </FormControl>
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Received By"
                value={this.state.receivedBy}
                onChange={e =>
                  this.setState({ receivedBy: e.currentTarget.value })
                }
              />
            </FormControl>
            <FormControl className={classes.margin}>
              <InputLabel
                htmlFor="received_date"
                className={''}
                style={{ 'margin-top': '-10px', 'margin-left': '3px' }}
              >
                Received Date
              </InputLabel>
              <br />
              <TextField
                id="received_date"
                variant="outlined"
                type="date"
                value={this.state.receivedDate}
                onChange={e =>
                  this.setState({ receivedDate: e.currentTarget.value })
                }
              />
            </FormControl>
            <br />
            <FormControl className={''} style={{ 'margin-left': '17px' }}>
              <InputLabel
                htmlFor="location_sel"
                className={''}
                style={{ 'margin-top': '12px', 'margin-left': '3px' }}
              >
                Location
              </InputLabel>
              <br />
              <Select
                variant="outlined"
                value={this.state.loc}
                style={{ width: '215px' }}
                onChange={e => this.setState({ loc: e.target.value })}
                input={
                  <OutlinedInput
                    labelWidth={this.state.labelWidth}
                    name="loc"
                    id="location_sel"
                  />
                }
                style={{
                  height: '58px',
                  width: '234px',
                  'margin-left': '-8px',
                }}
              >
                <MenuItem value="B1">B1</MenuItem>
                <MenuItem value="B2">B2</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={''} style={{ 'margin-left': '17px' }}>
              <InputLabel
                htmlFor="action_sel"
                className={''}
                style={{ 'margin-top': '12px', 'margin-left': '3px' }}
              >
                Action
              </InputLabel>
              <br />
              <Select
                variant="outlined"
                value={this.state.act}
                style={{ 'margin-left': '5px', width: '215px' }}
                onChange={e => this.setState({ act: e.target.value })}
                input={
                  <OutlinedInput
                    labelWidth={this.state.labelWidth}
                    name="act"
                    id="action_sel"
                  />
                }
                style={{
                  height: '58px',
                  width: '234px',
                  'margin-left': '-8px',
                }}
              >
                <MenuItem value="Ok">Ok</MenuItem>
                <MenuItem value="Reject">Reject</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <br />
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Reason"
                value={this.state.reason}
                onChange={e => this.setState({ reason: e.currentTarget.value })}
              />
            </FormControl>
            <FormControl className={classes.margin}>
              <TextField
                variant="outlined"
                label="Image"
                onChange={e => this.setState({ image: e.currentTarget.value })}
              />
            </FormControl>
            <br />
            <Button
              variant="contained"
              color="primary"
              className={classes.button + ' ' + classes.margin}
              onClick={this.receiveHandler}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button + ' ' + classes.margin}
              onClick={this.closeHandler}
            >
              Close
            </Button>
          </Paper>
          <Dialog
            open={this.state.collecting}
            onClose={this.handleClose('collecting')}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Collect tracking</DialogTitle>
            <DialogContent>
              Collect tracking,{' '}
              {this.state.collectTrackings.length > 0
                ? this.state.collectTrackings[0].tracking_no
                : ''}
              ?
            </DialogContent>
            <DialogActions>
              <Button onClick={this.collectSingleTracking}>Confirm</Button>
              <Button onClick={this.handleClose('collecting')} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.rejecting}
            onClose={this.handleClose('rejecting')}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Reject tracking</DialogTitle>
            <DialogContent>
              Reject tracking,{' '}
              {this.state.rejectTrackings.length > 0
                ? this.state.rejectTrackings[0].tracking_no
                : ''}
              ?
            </DialogContent>
            <DialogActions>
              <Button onClick={this.rejectSingleTracking}>Confirm</Button>
              <Button onClick={this.handleClose('rejecting')} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(Tracking)
