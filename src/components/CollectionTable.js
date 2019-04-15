import React from 'react'

import Paper from '@material-ui/core/Paper'
import {SortingState, IntegratedSorting, PagingState, CustomPaging, SearchState,IntegratedSelection, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableColumnVisibility, PagingPanel, Toolbar, SearchPanel, TableSelection} from '@devexpress/dx-react-grid-material-ui'

import {Loading} from './Loading.js'

//paging, sorting, changePageSize always call the request.
// server side paging, sorting, searching

class CollectionTable extends React.Component {
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
          columnName: 'uid',
          direction: 'desc'
        }
      ]

    }
    this.changeSorting = sorting => this.setState({sorting, currentPage: 0, loading: true})
    this.changePageSize = pageSize =>this.setState({pageSize, currentPage: 0, loading: true})
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
    const {sorting, currentPage, pageSize, searchValue} = this.state
    if(sorting !== prevState.sorting
      || currentPage !== prevState.currentPage
      || searchValue !== prevState.searchValue
      || pageSize !== prevState.pageSize){
        this.props.getData(this.state, this.props).then(()=>{
          this.setState({loading: false})
        })
    }
    if(prevProps.update !== this.props.update){
        this.setState({
          loading: true
        })
        const state = this.state
        this.props.getData(state, this.props).then(()=>{
          this.setState({loading: false})
        })
      }
  }

  componentDidMount() {
    if(!!this.props.getData){
      this.props.getData(this.state, this.props).then(()=>{
        this.setState({loading: false})
      })
    } else {
      this.setState({loading: false})
    }
  }


  render() {
    const {
      sorting,
      currentPage,
      pageSize,
      pageSizes,
      searchValue,
      loading
    } = this.state
    const {
      rows,
      columns,
      totalCount,
      columnWidths,
      changeColumnWidths,
      selection
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
        <CustomPaging totalCount={totalCount} />

        <SearchState
            value = {searchValue}
            onValueChange={this.changeSearchValue}
        />
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>

        <IntegratedSorting/>
        <IntegratedSelection/>
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange={changeColumnWidths}
        />

        <TableHeaderRow showSortingControls/>

        <TableSelection
            //selectByRowClick
            highlightRow
            showSelectionColumn={false}
            //showSelectAll
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

export default CollectionTable
