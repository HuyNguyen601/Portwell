import React from 'react'

import Paper from '@material-ui/core/Paper'
import {SortingState, IntegratedSorting, PagingState, CustomPaging, SearchState, RowDetailState, SelectionState} from '@devexpress/dx-react-grid'
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
      expandedRowIds: [],
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
      || pageSize !== prevState.pageSize || this.props.params !== prevProps.params){
        this.props.getData(this.state, this.props.params).then(()=>{
          this.setState({loading: false})
        })
    }
    if(prevProps.rows !== this.props.rows){

    }
  }

  componentDidMount() {
    const {sorting, currentPage, pageSize,searchValue} = this.state
    this.setState({
      columns: this.props.columns
    })
    this.props.getData(this.state, this.props.params).then(()=>{
      this.setState({loading: false})
    })
  }

  render() {
    const {
      sorting,
      currentPage,
      pageSize,
      pageSizes,
      expandedRowIds,
      loading
    } = this.state
    const {
      rows,
      columns,
      totalCount,
    } = this.props
    return (<Paper style={{
        position: 'relative'
      }}>
      <Grid rows={rows} columns={columns}>
        <SelectionState
            selection={[]}
            onSelectionChange={this.props.onSelectionChange}
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
