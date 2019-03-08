import React from 'react'
import ReactToPrint from 'react-to-print'
import moment from 'moment'
//import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import {
  SortingState,
  IntegratedSorting,
  IntegratedPaging,
  PagingState,
  IntegratedSelection,
  SelectionState,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  TableColumnVisibility,
  PagingPanel,
  Toolbar,
  TableSelection,
} from '@devexpress/dx-react-grid-material-ui'
import { Print as PrintIcon } from '@material-ui/icons'
import Button from '@material-ui/core/Button'
//for label printing
import Barcode from 'react-barcode'
import {getUser} from '../services/auth'

import { Loading } from './loading.js'
import { Link } from 'gatsby'
import './print.css'
import axios from 'axios'
import qs from 'qs'
import { common_url, admin_url } from '../config/config'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})

class SubTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      rows: [],
      totalCount: 0,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      selection: [],
      sorting: [
        {
          columnName: '_id',
          direction: 'desc',
        },
      ],
    }
    this.changeSelection = selection => this.setState({ selection })
    this.changeSorting = sorting => this.setState({ sorting })
    this.changePageSize = pageSize => this.setState({ pageSize })
    this.changeCurrentPage = currentPage => this.setState({ currentPage })
    this.getBatchDetailByBatchId = this.getBatchDetailByBatchId.bind(this)
    this.handlePrint = this.handlePrint.bind(this)
  }

  getBatchDetailByBatchId = async id => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchBatchDetailByBatchID' }),
          jsonData: JSON.stringify({
            search_text: id,
            search_form: 'Material Receiving',
          }),
        })
      )
      const data = response.data
      if (data.total > 0) {
        const rows = data.rows
        rows.forEach(row => {
          row.uid_link = (
            <Link to="/unit" state={{ uid: row.apt_id }}>
              {row.apt_id}
            </Link>
          )
        })
        this.setState({
          rows: rows,
          totalCount: data.total,
        })
      } else {
        this.setState({
          rows: [],
          totalCount: 0,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  handlePrint = async ()=>{
    const {selection, rows} = this.state
    const uids = selection.map(index=>rows[index].apt_id)
    console.log(uids)
    try {
      const response = await axios.post(
        admin_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'printSmall', userid: getUser().user_id, location: getUser().location }),
          jsonData: JSON.stringify({
            search_text: uids,
          }),
        })
      )
      const data = response.data
      if(data.total >0){
        this.setState({loading: true, selection: []})
        this.getBatchDetailByBatchId(this.props.id).then(response => {
          this.setState({ loading: false })
        })
      }
    } catch(error){
      console.log(error)
    }
  }

  componentDidMount() {
    this.getBatchDetailByBatchId(this.props.id).then(response => {
      this.setState({ loading: false })
    })
  }

  render() {
    const {
      rows,
      loading,
      currentPage,
      pageSize,
      pageSizes,
      sorting,
      columnWidths,
      selection,
    } = this.state
    const { columns, classes } = this.props
    return (
      <div>
        <ReactToPrint
          trigger={() => (
            <Button
              variant="contained"
              className={classes.button}
              disabled={selection.length === 0}
            >
              <PrintIcon className={classes.leftIcon} />
              Small Label
            </Button>
          )}
          content={() => this.smallRef}
          onBeforePrint={this.handlePrint}
        />
        <ReactToPrint
          trigger={() => (
            <Button
              variant="contained"
              className={classes.button}
              disabled={selection.length === 0}
            >
              <PrintIcon className={classes.leftIcon} />
              Large Label
            </Button>
          )}
          content={() => this.largeRef}
          onBeforePrint={this.handlePrint}
        />
        <div className = 'print'
          ref={el => {
            this.smallRef = el
          }}
        >
          {selection.map((index,run) => <div key={rows[index].apt_id}>
            <Barcode
              value={rows[index].apt_id}
              fontOptions="bold"
              font="san serif"
              margin={20}
              fontSize={30}
            />
            <div className='pageBreak'/>
          </div>)}
        </div>
        <div className ='print'
          ref={el => {
            this.largeRef = el
          }}
        >
          {selection.map((index,run)=><div key={rows[index].apt_id}
            style={{
              fontSize: '16px',
              paddingLeft: '15px',
              paddingRight: '15px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <table style={{ borderSpacing: 0, borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <th style={{ fontSize: '30px' }}>{rows[0].order_no}</th>
                  <th style={{ float: 'right', marginRight: '50px' }}>{'Qty:'+rows[0].qty}</th>
                </tr>
                <tr>
                  <th style={{ width: '150px' }}>
                    <span style={{ textDecoration: 'underline' }}>From:</span>{' '}
                    Portwell{' '}
                  </th>
                  <th>
                    <span style={{ textDecoration: 'underline' }}>
                      Schedule:
                    </span>
                    <span>{moment(rows[0].date_delivery.date).format('MM/DD/YYYY')}</span>
                  </th>
                </tr>
                <tr>
                  <th style={{ textDecoration: 'underline' }}>Customer:</th>
                  <th style={{ textDecoration: 'underline' }}>
                    Delivery Method:{' '}
                  </th>
                </tr>
                <tr>
                  <th>{rows[0].cust_code}</th>
                  <th>{rows[0].dmethod}</th>
                </tr>
                <tr>
                  <th style={{ textFieldecoration: 'underline' }}>Batch #:</th>
                  <th>{<Barcode
                      value={rows[0].batch_no}
                      width={1}
                      height= {20}
                      fontOptions= 'bold'
                      font= "san serif"
                      margin={3}
                      fontSize={16}
                      textAlign= 'left'
                  />}</th>
                </tr>
                <tr>
                  <th style={{ textDecoration: 'underline' }}>Order #:</th>
                  <th>{<Barcode
                      value={rows[0].order_no}
                      width={1}
                      height= {20}
                      fontOptions= 'bold'
                      font= "san serif"
                      margin={3}
                      fontSize={16}
                      textAlign= 'left'
                  />}</th>
                </tr>
                <tr>
                  <th style={{ textDecoration: 'underline' }}>UID #:</th>
                  <th>{<Barcode
                      value={rows[index].apt_id}
                      width={1}
                      height= {20}
                      fontOptions= 'bold'
                      font= "san serif"
                      margin={3}
                      fontSize={16}
                      textAlign= 'left'
                  />}</th>
                </tr>
              </tbody>
            </table>
            <div className='pageBreak'/>
          </div>)}
        </div>
        <Grid rows={rows} columns={columns}>
          <SelectionState
            selection={selection}
            onSelectionChange={this.changeSelection}
          />
          <PagingState
            currentPage={currentPage}
            onCurrentPageChange={this.changeCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={this.changePageSize}
          />
          <IntegratedPaging />

          <SortingState
            sorting={sorting}
            onSortingChange={this.changeSorting}
          />

          <IntegratedSorting />
          <IntegratedSelection />
          <Table />
          <TableColumnResizing columnWidths={columnWidths} />

          <TableHeaderRow showSortingControls />

          <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn
            showSelectAll
          />
          <TableColumnVisibility defaultHiddenColumnNames={['_id']} />
          <Toolbar />
          <PagingPanel pageSizes={pageSizes} />
        </Grid>
        {loading && <Loading />}
      </div>
    )
  }
}

export default withStyles(styles)(SubTable)
