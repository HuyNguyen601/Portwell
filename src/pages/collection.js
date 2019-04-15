import React from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'
import { withStyles } from '@material-ui/core/styles'
import { Typography, TextField, Button } from '@material-ui/core'
import CollectionTable from '../components/CollectionTable'
import ReportTable from '../components/ReportTable'
import ExportExcel from '../components/exportExcel'
import { MyDialog } from '../components/MyDialog'
import XLSX from 'xlsx'
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
      infoDialog: false,
      message: '',
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
          name: 'descript',
          title: 'Description',
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
          width: 120,
        },
        {
          columnName: 'uid',
          width: 180,
        },
        {
          columnName: 'itemno',
          width: 200,
        },
        {
          columnName: 'type',
          width: 200,
        },
        {
          columnName: 'descript',
          width: 200,
        },
        {
          columnName: 'qty',
          width: 100,
        },
        {
          columnName: 'seq',
          width: 100,
        },
        {
          columnName: 'sn',
          width: 200,
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
      ],
      info_rows: [],
      report_rows: [],
    }

    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.changeColumnWidths = columnWidths => this.setState({ columnWidths })
    this.handleClose = type => e => this.setState({ [type]: false })
    this.getSNCollection = this.getSNCollection.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getSNReport = this.getSNReport.bind(this)
    this.exportSNByOrderNo = this.exportSNByOrderNo.bind(this)
    this.exportToExcel = this.exportToExcel.bind(this)
    this.exportToPDF = this.exportToPDF.bind(this)
  }
  componentDidMount(){

  }
  getSNReport = async ()=>{
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'getSNByOrderNo'}),
          jsonData: JSON.stringify({ order_no: this.state.order_no}),
        })
      )
      if(response.data.total > 0){
        const rows = response.data.rows
        const info = {
          qty_receive: response.data.total,
          qty_order: rows[0].qty_order,
          sn_collected: '',
          collected: 0,
          total: rows[0].qty_order*rows[0].total
        }
        rows.forEach(row=>{
          row.uid_link = <Link to='/sn' state={{uid: row.uid}} >{row.uid}</Link>
          if(row.total_sn){
            info.total = info.total - row.total + row.total_sn
          }
          row.total = row.total_sn ? row.total_sn : row.total
          row.collected = row.qty + '/'+row.total
          info.collected += row.qty
          row.status = row.qty >= row.total
            ? 'Completed'
            : 'Open'
          row.status_button = row.qty >= row.total
            ? <Button color='primary'>Completed</Button>
            : <Button color='secondary'>Open</Button>
        })
        info.sn_collected = info.collected + '/' +info.total
        this.setState({
          report_rows: rows,
          info_rows: [info]
        })
      } else {
        this.setState({
          report_rows: [],
          infoDialog: true,
          message: 'No Worksheet or UIDs for this order',
          info_rows: []
        })
      }
    } catch (error) {
      console.log(error)
    }

  }
  handleSubmit = e => {
    e.preventDefault()
    this.setState({ submit_order: this.state.order_no })
    this.exportSNByOrderNo()
    this.getSNReport()
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
        const componentHeaders = []
        const reduce = rows.reduce((acc, current, index) => {
          if (index === 0 || current.uid !== rows[index - 1].uid) {
            acc[current.uid] = {
              order_no: this.state.order_no,
              uid: current.uid,
            }
          }
          if (
            current.type.includes('KIT') &&
            acc[current.uid]['kit_sn'] === undefined
          ) {
            acc[current.uid]['kit_sn'] = !!current.sn
              ? current.sn.toString()
              : ''
            acc[current.uid]['kit_pn'] = current.itemno
          } else {
            const sn = !!current.sn ? current.sn.toString() : ''
            const componentKey = current.componentID + current.itemno + current.seq
            acc[current.uid][componentKey] = sn
            componentHeaders.push({
              label: current.descript,
              key: componentKey,
            })
          }
          return acc
        }, {})
        const data = []
        Object.keys(reduce).forEach(key => {
          data.push(reduce[key])
        })
        //filter out all duplicate headers
        const filterHeaders = componentHeaders.filter(
          (header, index, self) =>
            index ===
            self.findIndex(
              h => h.label === header.label && h.key === header.key
            )
        )
        const headers = [...defaultHeaders, ...filterHeaders]
        this.setState({ data, headers })
        console.log(data, headers)
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

  exportToExcel = () => {
    const {data, order_no, headers} = this.state
    /* make the worksheet */
    const excelHeader = {}
    headers.forEach(header=>{
      excelHeader[header.key] = header.label
    })
    const ws = XLSX.utils.json_to_sheet([excelHeader,...data], {skipHeader: true})

    /* add to workbook */
    var wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    /* generate an XLSX file */
    XLSX.writeFile(wb, order_no+'.xlsx')
  }

  exportToPDF = ()=>{
    const {order_no, info_rows, report_rows} = this.state
    const info = info_rows[0]
    const isBrowser = typeof window !== 'undefined';
    const jsPDF = isBrowser ? require('jspdf') : undefined;
    require('jspdf-autotable')
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Order No', 'Qty Order', 'Qty Receive', 'SN Collected']],
      body: [[order_no, info.qty_order, info.qty_receive, info.sn_collected]]
    })
    const rows = report_rows.map((row, index)=>[index+1,row.uid, row.status, row.collected, row.sn])
    doc.autoTable({
      head: [['_id', 'UID', 'Status', 'SN Collected', 'KIT SN']],
      body: rows,
    })
    doc.save(order_no+'.pdf')
  }

  render() {
    const {
      rows,
      columns,
      columnWidths,
      totalCount,
      order_no,
      data,
      headers,
      infoDialog,
      message,
      info_rows,
      report_rows,
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
            <CollectionTable
              rows={rows}
              columns={columns}
              columnWidths={columnWidths}
              changeColumnWidths={this.changeColumnWidths}
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
            <Button
              className={classes.button}
              variant="contained"
              onClick={this.exportToExcel}
              disabled={data.length===0}
            >
              {' '}
              Export To Excel{' '}
            </Button>
            <Button
              className={classes.button}
              variant="contained"
              onClick={this.exportToPDF}
              disabled={report_rows.length===0}
            >
              {' '}
              Export To PDF{' '}
            </Button>
            <ReportTable report_rows={report_rows} info_rows={info_rows} />
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
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(Collection)
