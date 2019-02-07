import React from 'react'

import Paper from '@material-ui/core/Paper'
import {SortingState, IntegratedSorting, IntegratedPaging, PagingState, CustomPaging, SearchState, RowDetailState,IntegratedSelection, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableColumnVisibility, PagingPanel, Toolbar, SearchPanel, TableRowDetail, TableSelection} from '@devexpress/dx-react-grid-material-ui'

import {Loading} from './loading.js'
import {navigate} from 'gatsby'



class MyTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      searchValue: '',
      sorting: [
        {
          columnName: '_id',
          direction: 'desc'
        }
      ]

    }
    this.changeSorting = sorting => this.setState({sorting})
    this.changePageSize = pageSize =>this.setState({pageSize})
    this.changeCurrentPage = this.changeCurrentPage.bind(this)
    this.changeSearchValue = this.changeSearchValue.bind(this)
  }


  changeCurrentPage(currentPage) {
    this.setState({
      currentPage,
      loading: true
    });
  }
  changeSearchValue(searchValue) {
    this.setState({
      searchValue,
      loading: true
    });
  }

  componentDidUpdate(prevProps,prevState) {
    const {sorting, currentPage, pageSize, searchValue ,rows} = this.state
    if(sorting !== prevState.sorting
      || currentPage !== prevState.currentPage
      || searchValue !== prevState.searchValue
      || pageSize !== prevState.pageSize){
        this.props.getData(this.state, this.props).then(()=>{
          this.setState({loading: false})
        })
    }
    if(prevProps.station !== this.props.station){
      // both stations are not 'ALL' station
      if(prevProps.station !== 'All' && this.props.station!== 'All'){
        this.setState({
          loading: true
        })
        const state = this.state
        state.currentPage = 0 //set to first page when move to another station
        this.props.getData(state, this.props).then(()=>{
          this.setState({loading: false})
        })
      }
    }
    if(this.props.id !== prevProps.id
      || prevProps.getData !== this.props.getData
      || prevProps.update !== this.props.update){
        this.setState({
          loading: true
        })
        const state = this.state
        state.currentPage = 0 //set to first page
        this.props.getData(state, this.props).then(()=>{
          this.setState({loading: false})
        })
      }

  }

  componentDidMount() {
    const {sorting, currentPage, pageSize,searchValue} = this.state
    if(!!this.props.getData){
      this.props.getData(this.state, this.props).then(()=>{
        this.setState({loading: false})
      })
    }
  }

  render() {
    const {
      sorting,
      currentPage,
      pageSize,
      pageSizes,
      loading
    } = this.state
    const {
      rows,
      columns,
      totalCount,
      columnWidths,
      selection,
      remotePaging,
      subTable,
      rowDetail,
    } = this.props
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={rows} columns={columns}>
        <SelectionState
            selection={selection}
            onSelectionChange={this.props.onSelectionChange}
          />
        <PagingState currentPage={currentPage}
          onCurrentPageChange={this.changeCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={this.changePageSize}/>
        {remotePaging && <CustomPaging totalCount={totalCount}/>}
        {!remotePaging && <IntegratedPaging/>}

        <SearchState
            onValueChange={this.changeSearchValue}
        />
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        {subTable && <RowDetailState />}

        <IntegratedSorting/>
        <IntegratedSelection/>
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
        />

        <TableHeaderRow showSortingControls/>

        <TableSelection
            selectByRowClick
            highlightRow
            showSelectionColumn
            showSelectAll
          />
        <TableColumnVisibility
            defaultHiddenColumnNames={['_id']}
          />
        <Toolbar />
        <SearchPanel />
        {subTable &&<TableRowDetail
            contentComponent={rowDetail}
        />}
        <PagingPanel pageSizes = {pageSizes} />
      </Grid>
      {loading && <Loading />}
    </Paper>)
  }
}

export default MyTable
