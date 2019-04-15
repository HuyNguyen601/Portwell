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
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      selection: [],
      columns: [{
        title: 'Status',
        name: 'status'
      }, {
        title: 'UID',
        name: 'uid_link'
      }, {
        title: 'Station',
        name: 'station'
      }, {
        title: 'Started Time',
        name: 'start_date'
      }, {
        title: 'Received Time',
        name: 'end_date'
      }, {
        title: 'Location',
        name: 'location'
      }, {
        title: 'User',
        name: 'act_by'
      }],
      columnWidths: [{
        width: 150,
        columnName: 'status'
      }, {
        width: 150,
        columnName: 'uid_link'
      }, {
        width: 100,
        columnName: 'station'
      }, {
        width: 150,
        columnName: 'start_date'
      }, {
        width: 150,
        columnName: 'end_date'
      }, {
        width: 100,
        columnName: 'location'
      }, {
        width: 200,
        columnName: 'act_by'
      }],
      sorting: [
        {
          columnName: '_id',
          direction: 'desc',
        },
      ],
    }
    this.changeWidths = columnWidths => this.setState({columnWidths})
    this.changeSelection = selection => this.setState({ selection })
    this.changeSorting = sorting => this.setState({ sorting })
    this.changePageSize = pageSize => this.setState({ pageSize })
    this.changeCurrentPage = currentPage => this.setState({ currentPage })
    this.handlePrint = this.handlePrint.bind(this)
  }


  handlePrint = async ()=>{
    const {selection} = this.state
    const {rows} = this.props
    const uids = selection.map(index=>rows[index].apt_id)
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
        this.setState({selection: []})
      }
    } catch(error){
      console.log(error)
    }
  }

  componentDidMount() {

  }

  render() {
    const {
      currentPage,
      pageSize,
      pageSizes,
      sorting,
      columns,
      columnWidths,
      selection,
    } = this.state
    const { classes, rows } = this.props
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
          {selection.map((index,run) => <React.Fragment key={rows[index].apt_id}>
            <Barcode
              full
              value={rows[index].apt_id}
              height={100}
              fontOptions="bold"
              font="san serif"
              margin={30}
              fontSize={30}
            />
            <div className='pageBreak'/>

          </React.Fragment>)}
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
                      width={2}
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
                      width={2}
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
          <SortingState
            sorting={sorting}
            onSortingChange={this.changeSorting}
          />
          <IntegratedSorting />
          <IntegratedPaging />
          <IntegratedSelection />
          <Table />
          <TableColumnResizing columnWidths={columnWidths} onColumnWidthsChange={this.changeWidths}/>

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
      </div>
    )
  }
}

export default withStyles(styles)(SubTable)
