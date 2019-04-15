import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Button, Tooltip, Textfield, Select, FilledInput, MenuItem } from '@material-ui/core'
import Layout from '../components/layout'
import SEO from '../components/seo'
import OrderListTable from '../components/orderListTable'
import { styles } from '../utils/styles'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { common_url, sync_url } from '../config/config'
import { MyDialog } from '../components/MyDialog'
import { Loading } from '../components/loading'
import { getUser } from '../services/auth'
import MomentUtils from '@date-io/moment'
import { DatePicker, MuiPickersUtilsProvider } from 'material-ui-pickers'
import moment from 'moment'

import { Link } from 'gatsby'

class OrderList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      permission: !!getUser().user_id,
      from: moment('01/01/2016', 'MM/DD/YYYY'),
      to: moment(),
      date_type: 'date_delivery',
      infoDialog: false,
      loading: false,
      message: '',
      update: false
    }

    this.syncOrders = this.syncOrders.bind(this)
    this.handleClose = type => e => this.setState({ [type]: false })
    this.handleChange = type=>value=>this.setState({[type]: value})
    this.handleInput = type=>e=>this.setState({[type]: e.target.value})

  }

  syncOrders = async () => {
    this.setState({ loading: true })
    try {
      const response = await axios.post(
        sync_url,
        qs.stringify({
          id: 'production',
          jsonMeta: JSON.stringify({ act: 'sync_eve_sfc2' }),
          jsonData: JSON.stringify({ docnum: '' }),
        })
      )
      const number = response.data.return.length
      if (number > 1) {
        const message = 'Update and Insert ' + number + ' Orders.'
        this.setState({
          infoDialog: true,
          loading: false,
          update: !this.state.update,
          message,
        })
      } else {
        const message = JSON.parse(response.data.return[0]).result
        this.setState({
          infoDialog: true,
          loading: false,
          message,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidMount() {}

  render() {
    const { classes } = this.props
    const { infoDialog, message, loading, permission, from, to, date_type, update } = this.state
    return (
      <Layout title="Order List">
        <SEO title="Order List" keywords={[`gatsby`, `application`, `react`]} />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Order List
          </Typography>
          <Select value={date_type} onChange={this.handleInput('date_type')} input={<FilledInput id='date_type'/>}>
            <MenuItem value='date_delivery'>Date Delivery</MenuItem>
            <MenuItem value='date_order'>Date Order</MenuItem>
          </Select>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              keyboard
              clearable
              variant="outlined"
              label="From"
              value={from}
              onChange={this.handleChange('from')}
              format="MM/DD/YYYY"
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
            />
            <DatePicker
              keyboard
              clearable
              variant="outlined"
              label="To Date"
              value={to}
              onChange={this.handleChange('to')}
              format="MM/DD/YYYY"
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
            />
          </MuiPickersUtilsProvider>
          <Tooltip
            title={
              permission
                ? 'Sync Orders'
                : "You don't have permission to do this"
            }
          >
            <span>
              <Button
                className={classes.button}
                variant="contained"
                onClick={this.syncOrders}
                color="primary"
                disabled={!permission}
              >
                Sync
              </Button>
            </span>
          </Tooltip>
          <Typography component="div" className={classes.tableContainer}>
            <OrderListTable
              from={from}
              to={to}
              date_type={date_type}
              update={update}
            />
          </Typography>
          <MyDialog
            title="Info Dialog"
            open={infoDialog}
            handleClose={this.handleClose('infoDialog')}
          >
            {message.split('\n').map((m, key) => (
              <div key={key}>{m}</div>
            ))}
          </MyDialog>
          {loading && <Loading />}
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(OrderList)
