import React from 'react'

import Paper from '@material-ui/core/Paper'
import {
  SortingState,
  IntegratedSorting,
  IntegratedPaging,
  PagingState,
  CustomPaging,
  SearchState,
  SelectionState,
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableColumnResizing,
  TableHeaderRow,
  TableColumnVisibility,
  PagingPanel,
  Toolbar,
} from '@devexpress/dx-react-grid-material-ui'
import { Grid as Grid2 } from '@material-ui/core'
import axios from 'axios'
import qs from 'qs'
import { image_upload_url, upload_url } from '../config/config'
import { Link } from 'gatsby'
import { Loading } from './loading.js'
import { styles } from '../utils/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import CustomInfoDialog from '../components/CustomInfoDialog'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
class ImgTable extends React.Component {
  constructor(props) {
    super(props)
    this.customFormatter = props.customFormatter
    this.state = {
      customInfo: false,
      loading: props.loading,
      pageSize: 10,
      pageSizes: [10, 20, 30, 100],
      currentPage: 0,
      rows: [],
      totalCount: 0,
      searchValue: '',
      searchName: '',
      searchDesc: '',
      deleting: false,
      deleteId: '',
      searchTagName: '',
      searchTagValue: '',
      expandedRowIds: [],
      sorting: [
        {
          columnName: '_id',
          direction: 'desc',
        },
      ],
    }
    this.changeSorting = sorting => this.setState({ sorting })
    this.changePageSize = pageSize => this.setState({ pageSize })
    this.changeCurrentPage = this.changeCurrentPage.bind(this)
    this.changeSearchValue = this.changeSearchValue.bind(this)
    this.changeSearchName = this.changeSearchName.bind(this)
    this.changeSearchDesc = this.changeSearchDesc.bind(this)
    this.changeSearchTagName = this.changeSearchTagName.bind(this)
    this.changeSearchTagValue = this.changeSearchTagValue.bind(this)
    this.clearSearch = this.clearSearch.bind(this)
    this.getOrder = this.getOrder.bind(this)
    this.deleteHandler = this.deleteHandler.bind(this)
    this.editHandler = this.editHandler.bind(this)
    this.getCustomInfo = this.getCustomInfo.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.newTag = this.newTag.bind(this)
    this.removeTagHandler = this.removeTagHandler.bind(this)
    this.saveCustomInfo = this.saveCustomInfo.bind(this)
    this.deleteImg = this.deleteImg.bind(this)
  }
  getOrder = async state => {
    try {
      let searchTag = {}
      searchTag[this.state.searchTagName] = this.state.searchTagValue
      let data = {
        desc: this.state.searchDesc,
        name: this.state.searchName,
        tag: searchTag,
      }
      const response = await axios.post(
        image_upload_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchAlsFiles' }),
          jsonData: JSON.stringify(data),
          rows: state.pageSize,
          page: state.currentPage + 1,
          sidx: state.sorting[0].columnName,
          sord: state.sorting[0].direction,
        })
      )
      if (response.data.total > 0) {
        const rows = response.data.rows
        rows.forEach(row => {
          row._idh = (
            <div>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={
                  'http://192.168.0.96:8080/try/pages/sfc2/2.3/scripts/file_handler.php?id=' +
                  row._idh +
                  '&width=30&height=30'
                }
              >
                <img
                  alt={''}
                  style={{ marginBottom: '-0.42rem' }}
                  src={
                    'http://192.168.0.96:8080/try/pages/sfc2/2.3/scripts/file_handler_icon.php?id=' +
                    row._idh
                  }
                />
              </a>
              <Button onClick={this.editHandler.bind(this, row._idh)}>
                edit {row._idh}
              </Button>
              <Button onClick={this.deleteHandler.bind(this, row._idh)}>
                delete
              </Button>
            </div>
          )
          row.order_no = (
            <Link to="/orderDetail" state={{ id: row._id }}>
              {' '}
              {row.order_no}
            </Link>
          )
        })
        this.setState({
          rows: rows,
          totalCount: response.data.records,
        })
      } else {
        this.setState({
          totalCount: 0,
          rows: [],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  changeCurrentPage(currentPage) {
    this.setState({
      currentPage,
      loading: true,
    })
  }
  changeSearchValue(searchValue) {
    this.setState({
      searchValue,
      loading: true,
    })
  }
  changeSearchName(event) {
    this.setState({
      searchName: event.currentTarget.value,
      loading: true,
    })
  }
  changeSearchDesc(event) {
    this.setState({
      searchDesc: event.currentTarget.value,
      loading: true,
    })
  }
  changeSearchTagName(event) {
    this.setState({
      searchTagName: event.target.value,
      loading: true,
    })
  }
  changeSearchTagValue(event) {
    this.setState({
      searchTagValue: event.currentTarget.value,
      loading: true,
    })
  }
  clearSearch(event) {
    this.setState({
      searchName: '',
      searchDesc: '',
      searchTagName: '',
      searchTagValue: '',
      loading: true,
    })
  }
  //this function to close dialog, used for all types
  handleClose = type => e => {
    this.setState({
      [type]: false,
    })
  }
  async getCustomInfo(id) {
    try {
      return await axios.get(
        'http://192.168.0.96:8080/try/pages/sfc2/2.3/scripts/custom_handler_react.php?id=' +
          id
      )
    } catch (error) {
      console.error(error)
    }
  }

  retrieveCustomInfo = async id => {
    const customInfo = await this.getCustomInfo(id)
    if (customInfo.data) {
      return customInfo.data
    }
  }

  editHandler = (value, ...props) => {
    let customInfo = this.getCustomInfo(value)
    customInfo
      .then(response => {
        let description = response.data.description
        let tags = []
        for (var i in response.data.rows) {
          tags.push({
            name: response.data.rows[i].name,
            value: response.data.rows[i].value,
          })
        }
        this.setState((prevState, props) => {
          return { id: value, tags: tags, description: description }
        })
        this.setState((prevState, props) => {
          return { customInfo: !prevState.customInfo, editId: value }
        })

        if (response.data.message) {
          return response.data
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  deleteHandler = (value, ...props) => {
    this.setState((prevState, props) => {
      return { deleting: !prevState.deleting, deleteId: value }
    })
  }
  changeDescriptionHandler = event => {
    this.setState({
      description: event.currentTarget.value,
    })
  }

  removeTagHandler = index => {
    let tags = this.state.tags
    tags.splice(index, 1)
    this.setState({
      tags: tags,
    })
  }
  saveCustomInfo() {
    let self = this
    let id = this.state.id
    //remove file from dropzone and upload description and tag name & value
    try {
      let customVars = []
      for (var i in this.state.tags) {
        let tagHelper = this.state.tags[i]
        let customVar = {}
        customVar[tagHelper.name] = tagHelper.value
        customVars.push(customVar)
      }

      //let customVarsStr = qs.stringify(customVars)
      axios
        .post(
          upload_url + 'save_custom_handler_react.php?id=' + id,
          qs.stringify({
            jsonData: JSON.stringify({
              desc: this.state.description, //this.customInfoDialog.current.state.description,
              customVars: customVars,
            }),
          })
        )
        .then(response => {
          console.log(response.data)
          self.setState({ customInfo: false })
        })
        .catch(error => {
          console.error(error)
        })
    } catch (error) {}
    console.log(self)
  }
  deleteImg() {
    var self = this
    try {
      let metaObj = {}
      metaObj.act = 'deleteFile'
      let dataObj = {}
      dataObj.search_text = this.state.deleteId
      axios
        .post(
          upload_url + 'api_sfc_com.php',
          qs.stringify({
            jsonMeta: JSON.stringify(metaObj),
            jsonData: JSON.stringify(dataObj),
          })
        )
        .then(response => {
          console.log(response.data)
          self.setState({
            deleting: false,
          })
          //self.needLoadGrid = true;
          self.setState({ loading: true })
          /*self.setState({
              imgTableNeedsUpdate: true
            })*/
          //self.imgTable.current.forceUpdate()
          //self.imgTable.current.setState({loading: true})
          //self.imgTable.current.forceUpdateHelper()
        })
        .catch(error => {
          console.error(error)
        })
    } catch (error) {}
  }
  newTag = () => {
    this.setState({
      tags: [...this.state.tags, { name: '', value: '' }],
    })
  }

  handleNameChange(index, event) {
    let tags = this.state.tags
    if (!event.target) return false
    tags[index].name = event.target.value
    this.setState({
      tags: tags,
    })
  }

  handleValueChange(index, event) {
    let tags = this.state.tags
    if (!event.currentTarget) return false
    tags[index].value = event.currentTarget.value
    this.setState({
      tags: tags,
    })
  }
  componentDidUpdate(prevProps, prevState) {
    const { sorting, currentPage, pageSize, searchValue, loading } = this.state
    if (
      sorting !== prevState.sorting ||
      currentPage !== prevState.currentPage ||
      searchValue !== prevState.searchValue ||
      pageSize !== prevState.pageSize ||
      loading ||
      this.loading ||
      prevProps.loading !== this.props.loading
    ) {
      this.getOrder(this.state, this.props).then(() => {
        this.setState({ loading: false })
      })
      this.loading = false
    }
    if (prevProps.station !== this.props.station) {
      // both stations are not 'ALL' station
      if (prevProps.station !== 'All' && this.props.station !== 'All') {
        this.setState({
          loading: true,
        })
        const state = this.state
        state.currentPage = 0 //set to first page when move to another station
        this.getOrder(state, this.props).then(() => {
          this.setState({ loading: false })
        })
      }
    }
    if (
      this.props.id !== prevProps.id ||
      prevProps.update !== this.props.update
    ) {
      this.setState({
        loading: true,
      })
      const state = this.state
      state.currentPage = 0 //set to first page
      this.getOrder(state, this.props).then(() => {
        this.setState({ loading: false })
      })
    }
  }

  componentDidMount() {
    this.getOrder(this.state, this.props).then(() => {
      this.setState({ loading: false })
    })
  }

  render() {
    const { sorting, currentPage, pageSize, pageSizes, loading } = this.state
    const {
      classes,
      columns,
      columnWidths,
      selection,
      remotePaging,
    } = this.props

    return (
      <Paper
        style={{
          position: 'relative',
        }}
      >
        <Grid2 container spacing={24}>
          <Grid2 item xs={2}>
            <TextField
              id="search-name"
              variant="outlined"
              value={this.state.searchName}
              label="Name"
              style={{}}
              onChange={this.changeSearchName}
            />
          </Grid2>
          <Grid2 item xs={2}>
            <TextField
              id="search-desc"
              variant="outlined"
              value={this.state.searchDesc}
              label="Description"
              style={{}}
              onChange={this.changeSearchDesc}
            />
          </Grid2>
          <Grid2 item xs={2}>
            <FormControl className={classes.formControl} style={{}}>
              <InputLabel htmlFor="tag_name_sel_search" style={{}}>
                Tag Name
              </InputLabel>
              <Select
                value={this.state.searchTagName}
                inputProps={{
                  name: 'tagName-search',
                  id: 'tag_name_sel_search',
                }}
                onChange={this.changeSearchTagName}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="so">Sale Order</MenuItem>
                <MenuItem value="wo">Work Order</MenuItem>
                <MenuItem value="uid">UID</MenuItem>
                <MenuItem value="pn">Part Number</MenuItem>
                <MenuItem value="stx">SFC Station</MenuItem>
                <MenuItem value="trx">Traveler</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 item xs={2}>
            <TextField
              id="search-tag-value"
              variant="outlined"
              value={this.state.searchTagValue}
              label="Tag Value"
              style={{}}
              onChange={this.changeSearchTagValue}
            />
          </Grid2>
          <Grid2 item xs={2}>
            <Button style={{'margin-left':"20px",'margin-top': "20px"}} color="primary" onClick={this.clearSearch}>clear</Button>
          </Grid2>
        </Grid2>
        <Grid rows={this.state.rows} columns={columns}>
          <SelectionState
            selection={selection}
            onSelectionChange={this.props.onSelectionChange}
          />
          <PagingState
            currentPage={currentPage}
            onCurrentPageChange={this.changeCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={this.changePageSize}
          />
          {remotePaging && <CustomPaging totalCount={this.state.totalCount} />}
          {!remotePaging && <IntegratedPaging />}

          <SearchState onValueChange={this.changeSearchValue} />
          <SortingState
            sorting={sorting}
            onSortingChange={this.changeSorting}
          />
          <IntegratedSorting />
          <Table />
          <TableColumnResizing columnWidths={columnWidths} />

          <TableHeaderRow showSortingControls />
          <TableColumnVisibility
          //defaultHiddenColumnNames={['_id']}
          />

          <Toolbar />
          <PagingPanel pageSizes={pageSizes} />
        </Grid>
        {loading && <Loading />}
        <CustomInfoDialog
          title="Custom Info"
          open={this.state.customInfo}
          handleClose={this.handleClose('customInfo')}
          handleSubmit={this.handleSubmit}
          tags={this.state.tags}
          description={this.state.description}
          id={this.state.id}
          newTag={this.newTag}
          removeTag={this.removeTagHandler}
          saveCustomInfo={this.saveCustomInfo}
          valueChange={this.handleValueChange}
          nameChange={this.handleNameChange}
          changeDescription={this.changeDescriptionHandler}
        />
        <Dialog
          open={this.state.deleting}
          onClose={this.handleClose('deleting')}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Delete this</DialogTitle>
          <DialogContent>Delete IMG id, {this.state.deleteId}?</DialogContent>
          <DialogActions>
            <Button onClick={this.deleteImg}>Confirm</Button>
            <Button onClick={this.handleClose('deleting')} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    )
  }
}

export default withStyles(styles)(ImgTable)
