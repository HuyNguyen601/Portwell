import React from 'react'
import {Link} from 'gatsby'
import LocalTable from './LocalTable'
import SubTable from './SubTable'

import axios from 'axios'
import qs from 'qs'
import {common_url} from '../config/config'

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

const allWidths = [{ columnName: '_id', width: 100 },
{ columnName: 'status', width: 100 },
{ columnName: 'batch_no', width: 150 },
{ columnName: 'qty', width: 100 },
{ columnName: 'start_date', width: 200 },
{ columnName: 'date_delivery', width: 200 },
{ columnName: 'location', width: 100 },
{ columnName: 'act_by', width: 100 }]
const stationWidths = [{ columnName: 'apt_id', width: 200 },
{ columnName: 'status', width: 100 },
{ columnName: 'batch_no', width: 100 },
{ columnName: 'date_start', width: 200 },
{ columnName: 'date_end', width: 200 },
{ columnName: 'open_reason', width: 160 },
{ columnName: 'exit_reason', width: 160 }]
const stationColumns = [
  {
    name: 'apt_id',
    title: 'UID'
  }, {
    name: 'status',
    title: 'Status'
  }, {
    name: 'batch_no',
    title: 'Batch Number'
  }, {
    name: 'date_start',
    title: 'Date Start'
  }, {
    name: 'date_end',
    title: 'Date End'
  }, {
    name: 'open_reason',
    title: 'Open Reason'
  }, {
    name: 'exit_reason',
    title: 'Exit Reason'
  }
]

const subColumns = [{
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
}]
const getBatch = async (order_id) => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "searchBatchByOrderID"}),
      jsonData: JSON.stringify({"search_text": order_id, "search_form": "Material Receiving"})
    }))
    const data = response.data
    return data
  } catch (error) {
    console.log(error)
  }
}

const getUnitByStation = async (uid,station) => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "searchActionByAPTID"}),
      jsonData: JSON.stringify({
        search_text: uid,
        search_form: station
        })
    }))
    const data = response.data
    return data
  } catch (error) {
    console.log(error)
  }
}


//***********STATE IS HERE ******///////////////
export default class StationTable extends React.Component {
  constructor(props) {
    super(props)



    this.changeWidths = columnWidths=>{
      this.setState({
        columnWidths
      })
    }

    this.state = {
      columnWidths: this.props.station === 'Material R' ? allWidths : stationWidths,
      columns: this.props.station ==='Material R' ? allColumns : stationColumns,
      selection: [],
      subRows: [],
      subTable: this.props.station === 'Material R',
      rows: []
    }



    this.changeSelection = selection =>{
      this.setState({selection})
      const ids = []
      selection.forEach(s=>{
        ids.push(this.state.rows[s].batch_id)
      })
      if(this.props.station === 'Material R') this.props.getDeleteIds(ids)
    }
  }



  componentDidUpdate(prevProps, prevState) {
    if (prevProps.station !== this.props.station
        || prevProps.id !== this.props.id || this.props.update !== prevProps.update) {

      const station = this.props.station
      const columns = station !== 'Material R'
        ? stationColumns
        : allColumns
      const columnWidths = station !== 'Material R'
        ? stationWidths
        : allWidths
      if (station !== 'Material R') {//seperate stations
        getUnitByStation(this.props.uid).then(data=>{
          if(data.total>0){
            this.setState({
              columns: columns,
              columnWidths: columnWidths,
              selection: [],
              rows: data.rows,
              subTable: false
            })
          }
          else {
            this.setState({
              columns: columns,
              columnWidths: columnWidths,
              selection: [],
              rows: [],
              subTable: false
            })
          }
        })

      } else { //Material Receiving stations
        getBatch(this.props.id).then(data=>{
          if(data.total>0){
            this.setState({
              columns: columns,
              columnWidths: columnWidths,
              selection: [],
              rows: data.rows,
              subTable: true
            })
          }
          else {
            this.setState({
              columns: columns,
              columnWidths: columnWidths,
              selection: [],
              rows: [],
              subTable: true
            })
          }
        })
      }
    }
  }

  componentDidMount(props){
    if(this.props.station ==='Material R'){
      getBatch(this.props.id).then(data=>{
        if(data.total>0){
          this.setState({
            selection: [],
            rows: data.rows,
            subTable: true
          })
        }
        else {
          this.setState({
            selection: [],
            rows: [],
            subTable: true
          })
        }
      })

    }
  }

  render() {
    const {columns, rows, totalCount, getData, remotePaging, selection, subTable, columnWidths} = this.state
    const {id, station, update, uid} = this.props
    return (<LocalTable columns={columns} rows={rows}
              columnWidths = {columnWidths} changeWidths = {this.changeWidths}
              getData={getData} id={id} station={station} uid={uid}
              selection={selection}
              onSelectionChange={this.changeSelection}
              rowDetail = {({row}) => (
                <SubTable
                  columns={subColumns}
                  id={row.batch_id}
                />)}
              subTable = {subTable}
            />)
  }
}
