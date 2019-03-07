import React from 'react'

import {Paper, Button} from '@material-ui/core'
import {SortingState, IntegratedSorting , IntegratedPaging, PagingState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, PagingPanel} from '@devexpress/dx-react-grid-material-ui'
import {Link} from 'gatsby'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'

class ReportTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: [],
      info_rows: [],
      columns: [
        {
          name: 'uid',
          title: 'UID'
        },
        {
          name: 'status',
          title: 'Status'
        },
        {
          name: 'collected',
          title: 'SN Collected'
        },
        {
          name: 'sn',
          title: 'KIT SN'
        },
      ],
      columnWidths: [
        {
          columnName: 'uid',
          width: 300,
        },
        {
          columnName: 'status',
          width: 250,
        },
        {
          columnName: 'collected',
          width: 250,
        },
        {
          columnName: 'sn',
          width: 400,
        }],
      sorting: [
        {
          columnName: '_id',
          direction: 'desc'
        }
      ]

    }
    this.changeWidths = columnWidths=>this.setState({columnWidths})
    this.changeSorting = sorting => this.setState({sorting})
    this.getSNReport = this.getSNReport.bind(this)
  }

  getSNReport = async ()=>{
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'getSNByOrderNo'}),
          jsonData: JSON.stringify({ order_no: this.props.order_no}),
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
          row.uid = <Link to='/sn' state={{uid: row.uid}} >{row.uid}</Link>
          if(row.total_sn){
            info.total = info.total - row.total + row.total_sn
          }
          row.total = row.total_sn ? row.total_sn : row.total
          row.collected = row.qty + '/'+row.total
          info.collected += row.qty
          row.status = row.qty >= row.total
            ? <Button color='primary'>Completed</Button>
            : <Button color='secondary'>Open</Button>
        })
        info.sn_collected = info.collected + '/' +info.total
        this.setState({
          rows,
          info_rows: [info]
        })
      } else {
        this.setState({
          rows: [],
          info_rows: []
        })
      }
    } catch (error) {
      console.log(error)
    }

  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.order_no !== this.props.order_no){
      this.getSNReport()
    }
  }



  render() {
    const {
      sorting,
      rows,
      info_rows,
      columns,
      columnWidths,
    } = this.state
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={info_rows} columns={[
        {
          name: 'qty_order',
          title: 'Qty Order',
        },
        {
          name: 'qty_receive',
          title: 'Qty Receive',
        },
        {
          name: 'sn_collected',
          title: 'SN Collected',
        },
        ]
      }>
        <Table/>
        <TableHeaderRow/>
      </Grid>
      <Grid rows={rows} columns={columns}>
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        <IntegratedSorting/>
        <PagingState />
        <IntegratedPaging />
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange = {this.changeWidths}
        />
        <TableHeaderRow showSortingControls/>
        <PagingPanel />
      </Grid>
    </Paper>)
  }
}

export default ReportTable
