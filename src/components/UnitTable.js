import React from 'react'
import {Grid, Table, TableHeaderRow} from '@devexpress/dx-react-grid-material-ui'
import {Loading} from './loading.js'

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

const getBatch = async id => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "searchBatchByOrderID"}),
      jsonData: JSON.stringify({"search_text": id, "search_form": "Material Receiving"})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

const getUnitByStation = async (id, station) => {
  try {
    const response = await axios.post(common_url, qs.stringify({
      id: 'developer',
      jsonMeta: JSON.stringify({"act": "getUnitByStation"}),
      jsonData: JSON.stringify({"search_text": id, "search_form": station})
    }))
    return response
  } catch (error) {
    console.log(error)
  }
}

export default class StationTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: allColumns,
      rows: []
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      const columns = this.props.value
        ? stationColumns
        : allColumns
      const station = toStation(this.props.value)
      if (this.props.value) {
        getUnitByStation(this.props.id, station).then(response => {
          this.props.onLoaded()
          if (response.data.total > 0) {
            this.setState({columns: columns, rows: response.data.rows})
          } else {
            this.setState({columns: columns, rows: []})
          }
        })
      } else {
        getBatch(this.props.id).then(response => {
          if (response.data.total > 0) {
            this.setState({columns: columns, rows: response.data.rows})
          }
          this.props.onLoaded()
        })

      }
    }
  }
  componentDidMount() {
    //Mount state is all stations
    getBatch(this.props.id).then(response => {
      if (response.data.total > 0) {
        this.setState({rows: response.data.rows})
      }
      this.props.onLoaded()
    })

  }

  render() {
    const {columns, rows, value} = this.state

    return (<Grid columns={columns} rows={rows}>
      <Table/>
      <TableHeaderRow/> {this.props.loading && <Loading/>}
    </Grid>)
  }
}
