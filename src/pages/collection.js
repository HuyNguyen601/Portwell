import React from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'
import { withStyles } from '@material-ui/core/styles'
import { Typography, TextField, Button } from '@material-ui/core'
import RemoteTable from '../components/RemoteTable'
import ReportTable from '../components/ReportTable'
import ExportExcel from '../components/exportExcel'

import { Link } from 'gatsby'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'
const defaultHeaders = [
  {
    label: 'Document No',
    key: 'order_no',
  },
  {
    label: 'UID',
    key: 'uid',
  },
  {
    label: 'Part No',
    key: 'kit_pn',
  },
  {
    label: 'KIT SN',
    key: 'kit_sn',
  },
]
const styles = theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  title: {
    flexGrow: 1,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%',
  },
  tableContainer: {
    height: 320,
  },
  button: {
    margin: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
})

class Collection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      totalCount: 0,
      update: false,
      order_no: '',
      submit_order: '',
      rows: [],
      columns: [
        {
          name: 'order_no',
          title: 'Order No',
        },
        {
          name: 'uid',
          title: 'UID',
        },
        {
          name: 'itemno',
          title: 'Part No',
        },
        {
          name: 'type',
          title: 'Type',
        },
        {
          name: 'qty',
          title: 'Qty',
        },
        {
          name: 'seq',
          title: 'Seq',
        },
        {
          name: 'sn',
          title: 'SN',
        },
      ],
      columnWidths: [
        {
          columnName: 'order_no',
          width: 80,
        },
        {
          columnName: 'itemno',
          width: 200,
        },
        {
          columnName: 'type',
          width: 100,
        },
        {
          columnName: 'qty',
          width: 80,
        },
        {
          columnName: 'seq',
          width: 80,
        },
        {
          columnName: 'sn',
          width: 100,
        },
      ],
      selection: [],
      data: [],
      headers: [
        {
          label: 'Document No',
          key: 'order_no',
        },
        {
          label: 'UID',
          key: 'uid',
        },
        {
          label: 'Part No',
          key: 'kit_pn',
        },
        {
          label: 'KIT SN',
          key: 'kit_sn',
        },
        {
          label: 'Component 1',
          key: 'components[0]',
        },
      ],
    }
    this.getSNCollection = this.getSNCollection.bind(this)
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.handleSubmit = this.handleSubmit.bind(this)
    this.exportSNByOrderNo = this.exportSNByOrderNo.bind(this)
  }
  handleSubmit = e => {
    e.preventDefault()
    this.setState({ submit_order: this.state.order_no })
    this.exportSNByOrderNo()
  }
  exportSNByOrderNo = async () => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'exportSNByOrderNo' }),
          jsonData: JSON.stringify({
            order_no: this.state.order_no,
          }),
        })
      )
      if (response.data.total > 0) {
        const rows = response.data.rows
        const reduce = rows.reduce((acc, current, index) => {
          if (index === 0 || current.uid !== rows[index - 1].uid) {
            acc[current.uid] = {
              order_no: this.state.order_no,
              uid: current.uid,
              kit_pn: '',
              kit_sn: '',
              components: [],
              headers: [],
            }
          }
          if (current.type.includes('KIT')) {
            acc[current.uid]['kit_sn'] = !!current.sn
              ? current.sn.toString()
              : ''
            acc[current.uid]['kit_pn'] = current.itemno
          } else {
            const sn = !!current.sn ? current.sn.toString() : ''
            const i = acc[current.uid]['components'].push(sn) - 1
            const key = 'components[' + i + ']'
            const header = { label: current.descript, key: key }
            acc[current.uid]['headers'].push(header)
          }
          return acc
        }, {})
        const data = []
        Object.keys(reduce).forEach(key => {
          data.push(reduce[key])
        })

        const headers = [...defaultHeaders, ...data[0].headers]
        this.setState({ data, headers })
      } else {
        this.setState({ data: [], headers: defaultHeaders })
      }
    } catch (error) {
      console.log(error)
    }
  }

  getSNCollection = async state => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'getSNCollection' }),
          jsonData: JSON.stringify({
            search_text: state.searchValue,
          }),
          rows: state.pageSize,
          page: state.currentPage + 1,
          sidx: state.sorting[0].columnName,
          sord: state.sorting[0].direction,
        })
      )
      if (response.data.total > 0) {
        const rows = response.data.rows
        rows.forEach(row => {
          row.uid = (
            <Link to="/sn" state={{ uid: row.uid }}>
              {row.uid}
            </Link>
          )
        })
        this.setState({ rows: rows, totalCount: response.data.total })
      } else {
        this.setState({ rows: [], totalCount: 0 })
      }
    } catch (error) {
      console.log(error)
    }
  }
  render() {
    const {
      rows,
      columns,
      totalCount,
      order_no,
      submit_order,
      data,
      headers,
    } = this.state
    const { classes } = this.props
    return (
      <Layout title="SN Collections">
        <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            SN Collection Dashboard
          </Typography>
          <Typography component="div" className={classes.tableContainer}>
            <RemoteTable
              rows={rows}
              columns={columns}
              totalCount={totalCount}
              getData={this.getSNCollection}
            />
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              SN Collection Report
            </Typography>
            <form onSubmit={this.handleSubmit}>
              <TextField
                id="order_input"
                className={classes.textField}
                label="Enter Order No"
                value={order_no}
                onChange={this.handleInput('order_no')}
                margin="normal"
                variant="outlined"
                required
                style={{
                  width: 500,
                }}
              />
            </form>
            <ExportExcel order_no={order_no} data={data} headers={headers} />
            <Button className={classes.button} variant="contained">
              {' '}
              Export To PDF{' '}
            </Button>
            <ReportTable order_no={submit_order} />
          </Typography>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(Collection)
