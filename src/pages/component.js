import React from 'react'

import Layout from '../components/layout'
import { withStyles } from '@material-ui/core/styles'
import { TextField, Typography } from '@material-ui/core'
import SEO from '../components/seo'
import RemoteTable from '../components/RemoteTable'
import { getUser } from '../services/auth'

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
          search_text: state.searchValue
        }),
        rows: state.pageSize,
        page: state.currentPage+1,
        sidx: state.sorting[0].columnName,
        sord: state.sorting[0].direction
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const switchComponent = async (id, selected) => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'switchComponent' }),
        jsonData: JSON.stringify({
          id: id,
          selected: selected,
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
      totalCount: 0,
      update: false,
      rows: [],
      columns: [
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
        {
          name: 'status',
          title: 'Status',
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
          columnName: 'status',
          width: 180,
        },
      ],
      selection: [],
    }
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.getComponent = this.getComponent.bind(this)
    this.changeSelection = this.changeSelection.bind(this)
  }

  changeSelection(selection) {
    const { rows } = this.state
    const index = selection.pop()
    const selected = rows[index].status === 'Enabled' ? 0 : 1
    const id = rows[index]._id
    switchComponent(id, selected).then(response => {
      if (response.data.list > 0) {
        this.setState({update: !this.state.update})
      }
    })
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
      selection,
      totalCount,
    } = this.state
    console.log(totalCount)
    const { classes } = this.props
    return (
      <Layout title='Component List'>
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
            <RemoteTable
              columns={columns}
              rows={rows}
              columnWidths={columnWidths}
              totalCount={totalCount}
              getData={this.getComponent}
              update={update}
              selection={selection}
              onSelectionChange={this.changeSelection}
            />
          </Typography>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(ComponentList)
