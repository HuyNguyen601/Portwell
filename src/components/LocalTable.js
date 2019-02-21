import React from 'react'

import Paper from '@material-ui/core/Paper'
import {SortingState, IntegratedSorting, IntegratedPaging, PagingState, SearchState, RowDetailState,IntegratedSelection, SelectionState} from '@devexpress/dx-react-grid'
import {Grid, Table, TableColumnResizing, TableHeaderRow, TableColumnVisibility, PagingPanel, Toolbar, SearchPanel, TableRowDetail, TableSelection} from '@devexpress/dx-react-grid-material-ui'




class LocalTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
    this.changePageSize = pageSize =>this.setState({pageSize: pageSize, currentPage: 0})
    this.changeCurrentPage = this.changeCurrentPage.bind(this)
    this.changeSearchValue = this.changeSearchValue.bind(this)
  }


  changeCurrentPage(currentPage) {
    this.setState({
      currentPage
    });
  }
  changeSearchValue(searchValue) {
    this.setState({
      searchValue
    });
  }

  render() {
    const {
      sorting,
      currentPage,
      pageSize,
      pageSizes,
      searchValue
    } = this.state
    const {
      rows,
      columns,
      columnWidths,
      changeWidths,
      selection,
      rowDetail,
      subTable
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
        <IntegratedPaging/>

        <SearchState
            value = {searchValue}
            onValueChange={this.changeSearchValue}
        />
        <SortingState sorting={sorting} onSortingChange={this.changeSorting}/>
        {subTable && <RowDetailState />}

        <IntegratedSorting/>
        <IntegratedSelection/>
        <Table/>
        <TableColumnResizing
            columnWidths={columnWidths}
            onColumnWidthsChange = {changeWidths}
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
    </Paper>)
  }
}

export default LocalTable
