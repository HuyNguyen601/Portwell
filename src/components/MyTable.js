import React from 'react'

import Paper from '@material-ui/core/Paper'
import {SortingState, IntegratedSorting, PagingState, CustomPaging, SearchState, RowDetailState, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableColumnVisibility, PagingPanel, Toolbar, SearchPanel, TableRowDetail, TableSelection} from '@devexpress/dx-react-grid-material-ui'

//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import {common_url} from '../config/config'


import {Loading} from './loading.js'
import {navigate} from 'gatsby'

//content of RowDetail
//table of Addresses for this customer
//Using rowid to retrieve exact customer document, then get all from Address Collection
axios.defaults.baseURL = common_url;

const getOrder = async state =>{
  try{
    const response = await axios.post(common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({"act":"searchOrderListByOrderNo"}),
        jsonData: JSON.stringify({"search_text": state.searchValue}),
        rows: state.pageSize,
        page: state.currentPage+1,
        sidx: state.sorting[0].columnName,
        sord: state.sorting[0].direction
      }))
    return response
  } catch (error){
    console.log(error)
  }
}

class MyTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [],
      rows: [],
      totalCount: 0,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      searchValue: '',
      expandedRowIds: [],
      open: false, //to open the dialog
      loading: false,
      sorting: [
        {
          columnName: '_id',
          direction: 'desc'
        }
      ]

    }
    this.changeSorting = sorting => this.setState({sorting})
    this.changePageSize = pageSize =>this.setState({pageSize})
    this.changeSelection = this.changeSelection.bind(this)
    this.changeCurrentPage = this.changeCurrentPage.bind(this)
    this.changeSearchValue = this.changeSearchValue.bind(this)
  }

  changeSelection(selection){
    const lastSelection = selection.slice(-1)
    const id =this.state.rows[lastSelection]['_id']

    navigate('/orderDetail',{state: {id: id}})

  }
  changeCurrentPage(currentPage) {
    this.setState({
      loading: true,
      currentPage,
    });
  }
  changeSearchValue(searchValue) {
    this.setState({
      loading: true,
      searchValue,
    });
  }

  componentDidUpdate(prevProps,prevState) {
    const {sorting, currentPage, pageSize, searchValue ,rows} = this.state
    if(sorting !== prevState.sorting
      || currentPage !== prevState.currentPage
      || searchValue !== prevState.searchValue
      || pageSize !== prevState.pageSize){
        console.log('Updated')
        getOrder(this.state).then(response=>{
          this.setState({
            rows: response.data.rows,
            totalCount: response.data.total,
            loading: false
          })
        })
    }
  }

  componentDidMount() {
    const {sorting, currentPage, pageSize,searchValue} = this.state
    console.log('Mounted')
    this.setState({
      columns: this.props.columns
    })
    getOrder(this.state).then(response=>{
      this.setState({
        rows: response.data.rows,
        totalCount: response.data.total
      })
    })
  }

  render() {
    const {
      columns,
      open,
      rows,
      sorting,
      currentPage,
      totalCount,
      pageSize,
      pageSizes,
      expandedRowIds,
      loading
    } = this.state
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={rows} columns={columns}>
        <SelectionState
            selection={[]}
            onSelectionChange={this.changeSelection}
          />
        <PagingState currentPage={currentPage}
          onCurrentPageChange={this.changeCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={this.changePageSize}/>
        <CustomPaging totalCount={totalCount}/>
        <SearchState
            onValueChange={this.changeSearchValue}
        />
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        <IntegratedSorting/>
        <Table/>
        <TableColumnResizing
            columnWidths={this.props.columnWidths}
        />
        <TableHeaderRow showSortingControls/>

        <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn={false}
          />
        <TableColumnVisibility
            defaultHiddenColumnNames={['_id']}
          />
        <Toolbar />
        <SearchPanel />
        <PagingPanel pageSizes = {pageSizes} />
      </Grid>
      {loading && <Loading />}
    </Paper>)
  }
}

export default MyTable
