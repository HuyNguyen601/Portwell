import React from 'react'
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui'
import {Loading} from './loading.js'
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
const toStation = value => {
  const station = value === 0
    ? 'All'
    : value === 1
      ? 'Material R' //this because database only hold 10 varchar
      : value === 2
        ? 'Assembly'
        : value === 3
          ? 'Burn In'
          : 'Packing'
  return station
}


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
      columns: allColumns,
      getData: this.getBatch,
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
          this.setState({
            rows: data.rows,
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
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value || prevProps.id !== this.props.id) {
      const columns = this.props.value
        ? stationColumns
        : allColumns
      const station = toStation(this.props.value)
      if (this.props.value) {
        this.setState({
          getData: this.getUnitByStation
        })
      } else {
        this.setState({
          getData: this.getBatch
        })
      }
    }
  }

  render() {
    const {columns, rows, value, totalCount, getData} = this.state
    const {id} = this.props
    const params = {
      station: toStation(value),
      id: id
    }

    return (<MyTable columns={columns} rows={rows} getData={getData} params={params}/>)
  }
}
