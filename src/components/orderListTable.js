import React from 'react'

import Paper from '@material-ui/core/Paper'
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  CustomPaging,
  SearchState,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  TableColumnVisibility,
  PagingPanel,
  Toolbar,
  SearchPanel,
} from '@devexpress/dx-react-grid-material-ui'

import { Loading } from './Loading.js'
import moment from 'moment'
import { Link } from 'gatsby'
import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'

//paging, sorting, changePageSize always call the request.
// server side paging, sorting, searching

class orderListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: [],
      totalCount: 0,
      columns: [
        {
          name: '_id',
          title: 'ID',
        },
        {
          name: 'status',
          title: 'Status',
        },
        {
          name: 'order_no',
          title: 'Order Number',
        },
        {
          name: 'cust_name',
          title: 'Customer',
        },
        {
          name: 'qty_order',
          title: 'Qty',
        },
        {
          name: 'date_order',
          title: 'Order Date',
        },
        {
          name: 'date_delivery',
          title: 'Delivery Date',
        },
        {
          name: 'dmethod',
          title: 'Delivery Method',
        },
        {
          name: 'sn_lines',
          title: 'SN',
        },
        {
          name: 'percent_completed',
          title: 'Completion %',
        },
      ],
      columnWidths: [
        {
          columnName: '_id',
          width: 100,
        },
        {
          columnName: 'status',
          width: 100,
        },
        {
          columnName: 'order_no',
          width: 100,
        },
        {
          columnName: 'cust_name',
          width: 300,
        },
        {
          columnName: 'qty_order',
          width: 100,
        },
        {
          columnName: 'date_order',
          width: 160,
        },
        {
          columnName: 'date_delivery',
          width: 160,
        },
        {
          columnName: 'dmethod',
          width: 160,
        },
        {
          columnName: 'sn_lines',
          width: 80,
        },
        {
          columnName: 'percent_completed',
          width: 150,
        },
      ],
      loading: true,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      searchValue: '',
      sorting: [
        {
          columnName: '_id',
          direction: 'desc',
        },
      ],
    }
    this.changeSorting = sorting =>{
      if(sorting[0].columnName!=='percent_completed'){
        this.setState({ sorting, currentPage: 0, loading: true })
      }
    }
    this.changePageSize = pageSize =>
      this.setState({ pageSize, currentPage: 0, loading: true })
    this.getOrder = this.getOrder.bind(this)
    this.changeCurrentPage = this.changeCurrentPage.bind(this)
    this.changeSearchValue = this.changeSearchValue.bind(this)
  }
  getOrder = async () => {
    const { pageSize, currentPage, sorting, searchValue } = this.state
    const { date_type, from, to } = this.props
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchOrderListByOrderNo' }),
          jsonData: JSON.stringify({
            search_text: searchValue,
            date_type: date_type,
            from: !!from ? from.format('MM/DD/YYYY') : '',
            to: !!to ? to.format('MM/DD/YYYY') : ''
          }),
          rows: pageSize,
          page: currentPage + 1,
          sidx: sorting[0].columnName,
          sord: sorting[0].direction,
        })
      )
      if (response.data.total > 0) {
        const rows = response.data.rows
        rows.forEach(row => {
          const order_no = row.order_no
          row.order_no = (
            <Link
              to="/orderDetail"
              state={{
                id: row._id,
                search: row.order_no,
              }}
            >
              {' '}
              {order_no}
            </Link>
          )
          row.sn_lines = <Link
            to="/worksheet"
            state={{
              order_no: order_no,
            }}
          >
            {' '}
            {row.sn_lines}
          </Link>
          row.date_delivery = !!row.date_delivery
            ? moment(row.date_delivery.date).format('MM/DD/YYYY')
            : ''
          row.date_order = !!row.date_order
            ? moment(row.date_order.date).format('MM/DD/YYYY')
            : ''
          row.percent_completed = row.qty_order !== 0 ? ((row.qty_completed / row.qty_order)*100).toString().slice(0,4)+'%' : '100%'
        })
        this.setState({
          rows: rows,
          totalCount: response.data.total,
          loading: false,
        })
      } else {
        this.setState({ totalCount: 0, rows: [], loading: false })
      }
    } catch (error) {
      console.log(error)
    }
  }

  changeCurrentPage(currentPage) {
    this.setState({ currentPage, loading: true })
  }
  changeSearchValue(searchValue) {
    this.setState({ searchValue, loading: true })
  }

  componentDidUpdate(prevProps, prevState) {
    const { sorting, currentPage, pageSize, searchValue } = this.state
    const { from, to, date_type, update } = this.props
    if (
      sorting !== prevState.sorting ||
      currentPage !== prevState.currentPage ||
      searchValue !== prevState.searchValue ||
      pageSize !== prevState.pageSize
    ) {
      this.getOrder()
    }
    if (
      from !== prevProps.from ||
      to !== prevProps.to ||
      date_type !== prevProps.date_type ||
      update !== prevProps.update
    ) {
      this.getOrder()
    }
  }

  componentDidMount() {
    this.getOrder()
  }

  render() {
    const {
      sorting,
      currentPage,
      pageSize,
      pageSizes,
      searchValue,
      loading,
      rows,
      totalCount,
      columns,
      columnWidths,
    } = this.state
    return (
      <Paper
        style={{
          position: 'relative',
        }}
      >
        <Grid rows={rows} columns={columns}>
          <PagingState
            currentPage={currentPage}
            onCurrentPageChange={this.changeCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={this.changePageSize}
          />
          <CustomPaging totalCount={totalCount} />

          <SearchState
            value={searchValue}
            onValueChange={this.changeSearchValue}
          />
          <SortingState
            sorting={sorting}
            onSortingChange={this.changeSorting}
          />

          <IntegratedSorting />
          <Table />
          <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange={this.changeColumnWidths}
          />

          <TableHeaderRow showSortingControls/>
          <TableColumnVisibility defaultHiddenColumnNames={['_id']} />
          <Toolbar />
          <SearchPanel />
          <PagingPanel pageSizes={pageSizes} />
        </Grid>
        {loading && <Loading />}
      </Paper>
    )
  }
}

export default orderListTable
