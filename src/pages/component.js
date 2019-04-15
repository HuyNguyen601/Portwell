import React from 'react'

import Layout from '../components/layout'
import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Fab, Tooltip } from '@material-ui/core'
import SEO from '../components/seo'
import ComponentTable from '../components/ComponentTable.js'
import { getUser } from '../services/auth'
import DeleteIcon from '@material-ui/icons/Delete'
import { MyDialog } from '../components/MyDialog'

//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { common_url } from '../config/config'

const styles = theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
  },
  title: {
    flexGrow: 1,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%',
  },
  tableContainer: {
    height: 320,
  },
  button: {
    margin: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
})

const searchComponentList = async state => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'searchComponentList' }),
        jsonData: JSON.stringify({
          search_text: state.searchValue,
        }),
        rows: state.pageSize,
        page: state.currentPage + 1,
        sidx: state.sorting[0].columnName,
        sord: state.sorting[0].direction,
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const switchComponent = async (id, selected, parent) => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'switchComponent' }),
        jsonData: JSON.stringify({
          id: id,
          selected: selected,
          parent: parent,
          userid: getUser().user_id,
          location: getUser().location,
        }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

class ComponentList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      permission: !!getUser().user_id,
      deleteDialog: false,
      infoDialog: false,
      message: '',
      totalCount: 0,
      update: false,
      rows: [],
      selection: [],
      columns: [
        {
          name: 'statusButton',
          title: 'Status',
        },
        {
          name: 'type',
          title: 'Type',
        },
        {
          name: 'descript',
          title: 'Description',
        },
        {
          name: 'itemno',
          title: 'Part No',
        },
        {
          name: 'model',
          title: 'Model',
        },
      ],
      columnWidths: [
        {
          columnName: 'type',
          width: 200,
        },
        {
          columnName: 'descript',
          width: 300,
        },
        {
          columnName: 'itemno',
          width: 200,
        },
        {
          columnName: 'model',
          width: 300,
        },
        {
          columnName: 'statusButton',
          width: 120,
        },
      ],
    }
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.changeColumnWidths = columnWidths => this.setState({ columnWidths })
    this.changeSelection = selection => this.setState({ selection })
    this.handleClose = type => e => this.setState({ [type]: false })
    this.handleDelete = this.handleDelete.bind(this)
    this.getComponent = this.getComponent.bind(this)
    this.toggleStatus = this.toggleStatus.bind(this)
  }

  toggleStatus = index => e => {
    const { rows } = this.state
    const selected = rows[index].status === 'Enabled' ? 0 : 1
    const parent = rows[index].parent
    //if parent, then disable all childs.
    const id = parent ? rows[index].itemno : rows[index]._id
    switchComponent(id, selected, parent).then(response => {
      if (response.data.list > 0) {
        this.setState({ update: !this.state.update })
      }
    })
  }
  handleDelete = async e => {
    this.setState({ deleteDialog: false })
    const { rows, selection } = this.state
    const deletingComponents = []
    selection.forEach(index => {
      const row = rows[index]
      const deletingComponent =
        row.parent === 1
          ? {
              id: row.itemno,
              parent: 1,
            }
          : {
              id: row._id,
              parent: 0,
            }
      deletingComponents.push(deletingComponent)
    })
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'deleteComponents' }),
          jsonData: JSON.stringify({
            components: deletingComponents,
          }),
        })
      )
      if (response.data.total > 0) {
        let message = 'Deleted ' + response.data.total + ' components: \n'
        response.data.rows.forEach(row => {
          message += 'Deleted component ' + row.type + ' ' + row.descript + '\n'
        })
        this.setState({
          update: !this.state.update,
          message,
          infoDialog: true,
          selection: [],
        })
      } else {
        this.setState({
          message: 'Failed to delete these components',
          infoDialog: true,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  getComponent = async state => {
    const response = await searchComponentList(state)
    if (response.data.total > 0) {
      this.setState({
        rows: response.data.rows,
        totalCount: response.data.records,
      })
    } else {
      this.setState({
        rows: [],
        totalCount: 0,
      })
    }
  }

  render() {
    const {
      rows,
      columns,
      columnWidths,
      update,
      totalCount,
      selection,
      deleteDialog,
      message,
      infoDialog,
      permission,
    } = this.state
    const { classes } = this.props
    rows.forEach((row, index) => {
      row.statusButton = (
        <Tooltip
          title={
            permission
              ? 'Switch Status'
              : "You don't have permission to do this"
          }
        >
          <span>
            <Button
              color={row.status === 'Enabled' ? 'primary' : 'secondary'}
              onClick={this.toggleStatus(index)}
              disabled={!permission}
            >
              {row.status}
            </Button>
          </span>
        </Tooltip>
      )
    })
    return (
      <Layout title="Component List">
        <SEO
          title="Component List"
          keywords={[`gatsby`, `application`, `react`]}
        />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Component List
          </Typography>
          <Typography component="div" className={classes.tableContainer}>
            <Tooltip
              title={
                permission
                  ? 'Delete Components'
                  : "You don't have permission to do this"
              }
            >
              <span>
                <Fab
                  color="secondary"
                  aria-label="Delete"
                  onClick={e => this.setState({ deleteDialog: true })}
                  className={classes.fab}
                  disabled={selection.length === 0 || !permission}
                >
                  <DeleteIcon />
                </Fab>
              </span>
            </Tooltip>
            <br />
            <ComponentTable
              columns={columns}
              rows={rows}
              columnWidths={columnWidths}
              changeColumnWidths={this.changeColumnWidths}
              totalCount={totalCount}
              getData={this.getComponent}
              update={update}
              selection={selection}
              onSelectionChange={this.changeSelection}
            />
          </Typography>
          <MyDialog
            title="Confirm Delete"
            open={deleteDialog}
            handleClose={this.handleClose('deleteDialog')}
            handleSubmit={this.handleDelete}
          >
            Are you sure you want to delete these component(s)?
          </MyDialog>
          <MyDialog
            title="Info Dialog"
            open={infoDialog}
            handleClose={this.handleClose('infoDialog')}
          >
            {message.split('\n').map((m, key) => (
              <div key={key}>{m}</div>
            ))}
          </MyDialog>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(ComponentList)
