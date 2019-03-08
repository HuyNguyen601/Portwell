import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Layout from '../components/layout'
import SEO from '../components/seo'

import Grid from '@material-ui/core/Grid'

import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'
import loadingStyles from '../styles/loading.module.css'
//import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    padding: 20,
    minWidth: 120,
    width: 200,
  },
  labelControl: {
    width: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
})

class Tracking extends React.Component {
  async getCountries() {
    try {
      return await axios.post(
        'http://192.168.0.96:8080/try/api/2.4/api_sfc_com.php',
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'getListOfCountries',
          }),
          jsonData: JSON.stringify({}),
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  async loadTrackingMaster(masterNo) {
    try {
      return await axios.post(
        'http://192.168.0.96:8080/try/api/2.4/api_sfc_com.php',
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'loadTrackingMaster',
          }),
          jsonData: JSON.stringify({
            master_no: masterNo,
          }),
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  constructor(props) {
    super(props)
    let master_no = !!this.props.location.state
      ? this.props.location.state.master_no
      : ''
    let trackingMasterResp = this.loadTrackingMaster(master_no)

    this.state = {
      master_no: master_no,
      trackings: [],
      vendorName: '',
      vendorCode: '',
      vendorAddress: '',
      vendorCountry: '',
      via: '',
      docType: '',
      docNo: '',
      serialNo: '',
      receivedBy: '',
      receivedDate: '',
      loc: '',
      act: '',
      reason: '',
      image: '',
      followUpBy: '',
      startDate: '',
      endDate: '',
      countries: ['a', 'b', 'c'],
      mockTrackings: [
        { tracking_no: '123abc' },
        { tracking_no: '234bcd' },
        { tracking_no: '345cde' },
      ],
    }
    this.handleChange = type => e => {
      this.setState({
        [type]: e.target.value,
      })
      alert('select changed')
    }
    this.collectedByChange = this.collectedByChange.bind(this)
    this.handleTrackingNumDeliveredChange = this.handleTrackingNumDeliveredChange.bind(
      this
    )
    this.receiveHandler = this.receiveHandler.bind(this)
    this.closeHandler = this.closeHandler.bind(this)
    this.handleClose = this.handleClose.bind(this)
    /*this.handleClick = this.handleClick.bind(this)
        this.handleReportClick = this.handleReportClick.bind(this)*/
    //this.handleNewEmailChange = this.handleNewEmailChange.bind(this)
  }

  handleSubmit = e => {
    e.preventDefault()
  }

  handleClose = type => e => {
    this.setState({
      [type]: false,
    })
  }

  receiveHandler = e => {
    const response = axios
      .post(
        common_url,
        qs.stringify({
          jsonMeta: JSON.stringify({
            act: 'receiveTrackings',
          }),
          jsonData: JSON.stringify({
            master_no: this.state.master_no,
            trackings: this.state.trackings,
            vendor_name: this.state.vendorName,
            vendor_code: this.state.vendorCode,
            vendor_address: this.state.vendorAddress,
            vendor_country: this.state.country,
            via: this.state.via,
            doc_type: this.state.docType,
            doc_no: this.state.docNo,
            serial_no: this.state.serialNo,
            received_by: this.state.receivedBy,
            received_date: this.state.receivedDate,
            loc: this.state.loc,
            act: this.state.act,
            reason: this.state.reason,
            followUpBy: this.state.followUpBy,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
          }),
        })
      )
      .then(response => {})
      .catch(error => {
        console.error(error)
      })
  }

  closeHandler = e => {}

  collectedByChange = (index, event) => {
    let trackings = this.state.trackings
    if (!event.target) return false
    trackings[index].collected_by = event.currentTarget.value
    this.setState({
      trackings: trackings,
    })
  }

  handleTrackingNumDeliveredChange = (index, event) => {
    let trackings = this.state.trackings
    if (!event.target) return false
    trackings[index].delivered = event.currentTarget.checked
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
        })
      }
    }
    this.setState({ trackings: trackings })
  }

  componentDidUpdate(prevProps, prevState) {}

  componentDidMount() {
    let countriesResp = this.getCountries()
    let countries = []
    countriesResp.then(response => {
      for (var i in response.data) {
        countries.push({ name: i, iso: response.data[i] })
        //countries.push(response.data[i])
      }
      this.setState({ countries: countries })
      //this.forceUpdate()
    })
  }

  render() {
    const { classes } = this.props
    const props = this.props
    return (
      <Layout title="Shipping Master">
        <SEO
          title="Receiving Detail Edit"
          keywords={[`gatsby`, `application`, `react`]}
        />

        <div className={classes.appBarSpacer} />
        <main>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
            style={{ 'margin-top': '65px' }}
          >
            Receiving Detail
          </Typography>
          <Paper style={{ float: 'left', width: '400px' }}>
            <FormControl className={classes.margin}>
              <InputLabel
                className={classes.labelControl}
                style={{ 'margin-top': '-20px' }}
              >
                Master Number:
              </InputLabel>
              <br />
              <TextField variant="outlined" value={this.state.master_no} />
            </FormControl>
            <br />
            <Button
              variant="contained"
              color="primary"
              className={classes.button + ' ' + classes.margin}
              onClick={e => this.setState({ addTracking: true })}
            >
              Add Tracking
            </Button>
            <br />
            {this.state.mockTrackings.map((trackingNum, index) => (
              <React.Fragment>
                <FormControl className={classes.formControl}>
                  <TextField
                    variant="outlined"
                    label="Tracking Number"
                    key={index}
                    value={trackingNum.tracking_no}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ 'margin-top': '30px' }}
                  className={classes.button + ' ' + classes.margin}
                  onClick={e => this.setState({ rejecting: true })}
                >
                  Reject
                </Button>
              </React.Fragment>
            ))}
          </Paper>
          <Paper
            style={{ float: 'left', width: '600px', 'margin-left': '20px' }}
          >
            <FormControl className={classes.formControl}>
              <InputLabel className={classes.labelControl}>
                Quantity:
              </InputLabel>
              <br />
              <TextField variant="outlined" />
            </FormControl>
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
            <FormControl
              className={classes.margin}
              style={{ 'margin-top': '-23px' }}
            >
              <InputLabel
                htmlFor="country_sel"
                className={''}
                style={{ 'margin-top': '18px', 'margin-left': '7px' }}
              >
                Country
              </InputLabel>
              <br />
              <Select
                variant="outlined"
                style={{ width: '215px' }}
                value={this.state.country}
                onChange={e => this.setState({ country: e.target.value })}
                input={
                  <OutlinedInput
                    labelWidth={this.state.labelWidth}
                    name="countryName"
                    id="country_sel"
                  />
                }
              >
                {this.state.countries.map((country, index) => {
                  //let countryHelper = country.split(":")
                  return <MenuItem value={country.iso}>{country.name}</MenuItem>
                })}
              </Select>
            </FormControl>
            <br />
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
                label="Serial Number"
                value={this.state.serialNo}
                onChange={e =>
                  this.setState({ serialNo: e.currentTarget.value })
                }
              />
            </FormControl>
            <br />
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
            <br />
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
            open={this.state.addTracking}
            onClose={this.handleClose('addTracking')}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Add tracking</DialogTitle>
            <DialogContent>
              <FormControl className={classes.margin}>
                <TextField variant="outlined" label="Tracking #" />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button>Add</Button>
              <Button onClick={this.handleClose('addTracking')} color="primary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.rejecting}
            onClose={this.handleClose('rejecting')}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Reject Tracking</DialogTitle>
            <DialogContent>
              <FormControl className={classes.margin}>
                <InputLabel
                  className={classes.labelControl}
                  style={{ 'margin-top': '-20px' }}
                >
                  Image:
                </InputLabel>
                <br />
                <TextField variant="outlined" label="Image" />
              </FormControl>
              <FormControl className={classes.margin}>
                <InputLabel
                  className={classes.labelControl}
                  style={{ 'margin-top': '-20px' }}
                >
                  Reason:
                </InputLabel>
                <br />
                <TextField variant="outlined" />
              </FormControl>
              <br />
            </DialogContent>
            <DialogActions>
              <Button>Reject</Button>
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
