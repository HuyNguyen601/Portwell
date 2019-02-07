import React from 'react'
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui'
import {Link} from 'gatsby'
import MyTable from './MyTable'

import axios from 'axios'
import qs from 'qs'
import {common_url, admin_url} from '../config/config'

const allColumns = [
  {
    name: 'status',
    title: 'Status'
  }, {
    name: 'batch_no',
    title: 'Batch Number'
  }, {
    name: 'qty',
    title: 'Qty'
  }, {
    name: 'start_date',
    title: 'Date Receive'
  }, {
    name: 'date_delivery',
    title: 'Date Deliver'
  }, {
    name: 'location',
    title: 'Location'
  }, {
    name: 'act_by',
    title: 'User'
  }
]
const stationColumns = [
  {
    name: 'apt_id',
    title: 'UID'
  }, {
    name: 'status',
    title: 'Status'
  }, {
    name: 'descript',
    title: 'Batch Number'
  }, {
    name: 'act_start',
    title: 'Date Start'
  }, {
    name: 'act_end',
    title: 'Date End'
  }, {
    name: 'act_start_reason',
    title: 'Open Reason'
  }, {
    name: 'act_end_reason',
    title: 'Exit Reason'
  }
]



//***********STATE IS HERE ******///////////////
export default class StationTable extends React.Component {
  constructor(props) {
    super(props)
    this.getBatch = async (state, props) => {
      try {
        const response = await axios.post(common_url, qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({"act": "searchBatchByOrderID"}),
          jsonData: JSON.stringify({"search_text": props.id, "search_form": "Material Receiving"})
        }))
        const data = response.data
        if(data.total > 0){
          this.setState({
            rows: data.rows,
            selection: [],
            totalCount: data.total
          })
        }
        else {
          this.setState({
            rows: [],
            totalCount: 0
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    this.state = {
      totalCount: 0,
      remotePaging: false,
      update: false,
      columns: allColumns,
      getData: this.getBatch,
      selection: [],
      rows: []
    }
    this.getUnitByStation = async (state,props) => {
      try {
        const response = await axios.post(common_url, qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({"act": "getUnitByStation"}),
          jsonData: JSON.stringify({
            search_text: props.id,
            search_form: props.station,
            rows: state.pageSize,
            page: state.currentPage+1,
            sidx: state.sorting[0].columnName,
            sord: state.sorting[0].direction
            })
        }))
        const data = response.data
        if(data.total > 0){
          const rows = data.rows
          rows.forEach(row=>{
            row.apt_id = <Link to='/unit' state={{uid: row.apt_id}}>{row.apt_id}</Link>
          })
          this.setState({
            rows: rows,
            totalCount: data.total
          })
        }
        else {
          this.setState({
            rows: [],
            totalCount: 0
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    this.changeSelection = selection =>{
      this.setState({selection})
      const ids = []
      selection.forEach(s=>{
        ids.push(this.state.rows[s].batch_id)
      })
      this.props.getDeleteIds(ids)
    }
  }



  componentDidUpdate(prevProps, prevState) {
    if (prevProps.station !== this.props.station
        || prevProps.id !== this.props.id) {

      const station = this.props.station
      const columns = station !== 'All'
        ? stationColumns
        : allColumns
      if (station !== 'All') {//seperate stations
        this.setState({
          columns: columns,
          selection: [],
          remotePaging: true,
          getData: this.getUnitByStation
        })
      } else { //all stations
        this.setState({
          columns: columns,
          selection: [],
          remotePaging: false,
          getData: this.getBatch
        })
      }
    }
  }

  render() {
    const {columns, rows, totalCount, getData, remotePaging, selection} = this.state
    const {id, station, onSelectionChange, update} = this.props
    return (<MyTable columns={columns} rows={rows} totalCount={totalCount}
              getData={getData} id={id} station={station}
              selection={selection}
              onSelectionChange={this.changeSelection}
              remotePaging={remotePaging}
              update={update}
            />)
  }
}
