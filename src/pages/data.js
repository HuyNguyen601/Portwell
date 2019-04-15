import React from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { styles } from '../utils/styles'
import { Paper, TextField } from '@material-ui/core'
import MomentUtils from '@date-io/moment'
import { DatePicker, MuiPickersUtilsProvider } from 'material-ui-pickers'
import moment from 'moment'
import { Link } from 'gatsby'

import { Loading } from '../components/Loading'
import AvgTimeTable from '../components/AvgTimeTable'

import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'

const getOrderInfo = async id => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'searchOrderByID' }),
        jsonData: JSON.stringify({
          search_text: id,
          search_form: 'Material Receiving',
        }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

class Data extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      from: moment('01/01/2016', 'MM/DD/YYYY'),
      to: moment(),
      rows: [],
    }
    this.handleChange = type => date => this.setState({ [type]: date })
  }

  render() {
    const { classes } = this.props
    const { from, to } = this.state
    return (
      <Layout title="Data Analysis">
        <SEO
          title="Data Analysis"
          keywords={[`gatsby`, `application`, `react`]}
        />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
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
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Average Time Per Unit (Rounding Unit is Minute)
          </Typography>
          <Typography component="div" className={classes.tableContainer}>
            <AvgTimeTable from={from} to={to} />
          </Typography>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(Data)
