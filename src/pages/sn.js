import React from 'react'
import Layout from '../components/layout'
import { withStyles } from '@material-ui/core/styles'
import SEO from '../components/seo'
import { getUser } from '../services/auth'
import {TextField, Typography, Button, Paper} from '@material-ui/core'
import {Table, TableHeaderRow, Grid, TableColumnResizing} from '@devexpress/dx-react-Grid-material-ui'
import ColumnGrid from '@material-ui/core/Grid'
import {MyDialog} from '../components/MyDialog'

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

const columns = [{
    name: 'type',
    title: 'Type'
  }, {
    name: 'descript',
    title: 'Description'
  }, {
    name: 'itemno',
    title: 'Part No'
  }, {
    name: 'model',
    title: 'Model'
  }, {
    name: 'qty',
    title: 'Qty'
  }, {
    name: 'seq',
    title: 'Seq'
  }, {
    name: 'sn_input',
    title: 'Serial Number'
  }
]

const getTemplate = async uid => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'getTemplateByUID' }),
        jsonData: JSON.stringify({ search_text: uid }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const saveSNCollection = async(uid,array)=>{
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'saveSNCollection', user: getUser().user_id, location: getUser().location }),
        jsonData: JSON.stringify({ search_text: uid, search_array: array }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}
const resetAllSN = async uid=>{
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'resetSN', user: getUser().user_id, location: getUser().location }),
        jsonData: JSON.stringify({ uid: uid }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}


class SnScan extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      //for dialogs
      info: false,
      reset: false,
      message: '',
      //end of dialogs
      columnWidths: [
        {
          columnName: 'type',
          width: 100,
        },
        {
          columnName: 'descript',
          width: 250,
        },
        {
          columnName: 'itemno',
          width: 180,
        },
        {
          columnName: 'model',
          width: 250,
        },
        {
          columnName: 'qty',
          width: 80,
        },
        {
          columnName: 'seq',
          width: 80,
        },
        {
          columnName: 'sn_input',
          width: 250,
        },
      ],
      uid: !!this.props.location.state ? this.props.location.state.uid : '',
      rows: [],
    }
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClose = type => e => this.setState({[type]: false})
    this.handleSN = index=>e=>{
      const rows = this.state.rows
      rows[index].sn = e.target.value
      this.setState({rows})
    }
    this.saveSN = this.saveSN.bind(this)
    this.resetSN = this.resetSN.bind(this)
    this.handleReset = this.handleReset.bind(this)
  }
  saveSN = ()=>{
    const rows = this.state.rows
    rows.forEach(row=>{delete row.sn_input})
    saveSNCollection(this.state.uid, rows).then(response=>{
      const total = response.data.insert ? response.data.insert : response.data.update
      const message = 'Successfully ' + (response.data.insert ? 'insert ' : 'update ') + total + ' serial numbers!'
      this.setState({info: true, message})
    })
  }
  resetSN = ()=>{
    const message = 'Are you sure to reset all serial numbers for this UID?'
    this.setState({reset: true, message})
  }
  handleReset = e=>{
    this.setState({reset: false})
    resetAllSN(this.state.uid).then(response=>{
      if(response.data.insert || response.data.delete){
        this.handleSubmit(e)
      }
    })

  }

  handleSubmit = e=>{
    e.preventDefault()
    getTemplate(this.state.uid).then(response=>{
      if(response.data.total>0){
          const rows = response.data.rows
          this.setState({rows})
      } else { //show dialog
        this.setState({rows: []})
      }
    })
  }
  componentDidMount(props){
    getTemplate(this.state.uid).then(response=>{
      if(response.data.total>0){
          const rows = response.data.rows
          this.setState({rows})
      } else { //show dialog
        this.setState({rows: []})
      }
    })
  }

  render() {
    const {
      uid,
      info,
      message,
      reset,
      rows,
      columnWidths,
    } = this.state
    const { classes } = this.props
    rows.forEach((row,index)=>{
      row.sn_input = <TextField value={row.sn} key={row.itemno+index} onChange={this.handleSN(index)} />
    })

    return (
      <Layout title='SN Scan'>
        <SEO
          title="SN Scan"
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
            Serian Number Scan
          </Typography>
          <form onSubmit={this.handleSubmit}>
            <TextField
              id="uid_input"
              className={classes.textField}
              label="Enter UID"
              value={uid}
              onChange={this.handleInput('uid')}
              margin="normal"
              variant="outlined"
              required
              style={{
                width: 500,
              }}
            />
          </form>
          <Typography component="div" className={classes.tableContainer}>
            <Paper>
              <Grid columns={columns} rows={rows}>
                <Table/>
                <TableColumnResizing
                    columnWidths={columnWidths}
                />
                <TableHeaderRow/>
              </Grid>
            </Paper>
            <ColumnGrid container spacing={24}>
              <ColumnGrid item xs={10}>
                <Button
                  className={classes.button}
                  variant="contained"
                  onClick={this.resetSN}
                  color='secondary'
                  disabled = {rows.length===0}
                >
                  Reset All
                </Button>
              </ColumnGrid>
              <ColumnGrid item xs={2}>
                <Button
                  className={classes.button}
                  variant="contained"
                  onClick={this.saveSN}
                  color='primary'
                >
                  Save SN
                </Button>
              </ColumnGrid>
            </ColumnGrid>
          </Typography>
          <MyDialog
            open={info}
            handleClose={this.handleClose('info')}
            title="Info Dialog"
          >
            {message}
          </MyDialog>
          <MyDialog
            open={reset}
            handleClose={this.handleClose('reset')}
            title="Reset Serial Numbers"
            handleSubmit={this.handleReset}
          >
            {message}
          </MyDialog>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(SnScan)
