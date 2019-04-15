import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import {
  TextField,
  Button,
  Grid,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  Input,
  MenuItem,
  Typography,
  Switch,
  Tooltip,
} from '@material-ui/core'
import Layout from '../components/layout'
import SEO from '../components/seo'
import WorksheetTable from '../components/WorksheetTable'
import { MyDialog } from '../components/MyDialog'
import { Loading } from '../components/loading'
import { getUser } from '../services/auth'
import ConfirmTable from '../components/ConfirmTable'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { eve_url, common_url, admin_url, typeArray } from '../config/config'

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

const confirm_columns = [
  {
    name: 'item_type',
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
    name: 'qty',
    title: 'Qty',
  }
]



const getOrder = async order_no => {
  try {
    const response = await axios.post(
      eve_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'get_order_item' }),
        jsonData: JSON.stringify({ docnum: order_no }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const checkComponents = async (list, order_no) => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'checkComponents' }),
        jsonData: JSON.stringify({ list: list, order_no: order_no }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const setTemplate = async (order_no, rows) => {
  try {
    const response = await axios.post(
      admin_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'setOrderComponent' }),
        jsonData: JSON.stringify({ order_no: order_no, rows: rows }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

class Worksheet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      permission: !!getUser().user_id,
      loading: false,
      info: false, // for Dialog
      message: '', // message for Dialog
      order_no: !!this.props.location.state
        ? this.props.location.state.order_no
        : '',
      type: 'Other SN',
      associate: false,
      descript: '',
      itemno: '',
      model: '',
      rows: [],
      confirmRows: [],
      selection: [],
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
          name: 'qty',
          title: 'Qty',
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
          columnName: 'qty',
          width: 80,
        },
      ],
    }
    this.changeWidths = columnWidths => this.setState({ columnWidths })
    this.handleClose = type => e => this.setState({ [type]: false })
    this.handleChange = type => e => this.setState({ [type]: e.target.value })
    this.changeSelection = selection => this.setState({ selection })
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.handleSwitch = type => e => this.setState({ [type]: e.target.checked })
    this.getOrderItem = this.getOrderItem.bind(this)
    this.setOrderTemplate = this.setOrderTemplate.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.addComponent = this.addComponent.bind(this)
    this.handleType = index => e => {
      e.preventDefault()
      const rows = this.state.rows
      rows[index].item_type = e.target.value
      this.setState({ rows })
    }
  }

  setOrderTemplate = e => {
    const { order_no, rows, selection } = this.state
    const selected = []
    selection.forEach(index => {
      rows[index].item_type = rows[index].type.props.value
      delete rows[index].type
      selected.push(rows[index])
    })
    setTemplate(order_no, selected).then(response => {
      if (response.data.total > 0) {
        this.setState({
          message: 'Successfully add ' + response.data.total + ' SN lines!',
          info: true,
        })
        this.getOrderItem()
      } else {
        this.setState({
          message: 'Failed to create worksheet!',
          info: true,
        })
      }
    })
  }

  addComponent = e => {
    const { type, itemno, descript, model, selection, associate } = this.state
    const rows = this.state.rows.slice(0)
    if (rows.length > 0) {
      const row = {
        item_type: type,
        itemno: itemno,
        descript: descript,
        model: model,
      }
      if (associate) {
        row.parent = 0
        rows.forEach(r => {
          if (r.itemno === row.itemno) {
            row.qty = r.qty
          }
        })
      } else {
        row.parent = 1
        rows.forEach(r => {
          if (r.item_type.includes('KIT')) {
            row.qty = r.qty
          }
        })
      }
      const index = rows.push(row) - 1
      selection.push(index)

      this.setState({
        selection,
        rows,
        itemno: '',
        descript: '',
        model: '',
      })
    }
  }

  getOrderItem = () => {
    getOrder(this.state.order_no).then(response => {
      const data = response.data.return
      if (!!data.error) {
        this.setState({ loading: false, rows: [], confirmRows: [] })
      } else {
        const rows = []
        const selection = []
        const confirm = []
        const confirmRows = []
        const pn_list = data.map(row => row.itemno)
        checkComponents(pn_list, this.state.order_no).then(response => {
          if (!!response.data) {
            data.forEach(row => {
              const comps = response.data[row.itemno]
              if (!!comps) {
                // if the component is in the list
                comps.forEach(comp => {
                  //the result is an array
                  comp.qty = row.qty
                  comp.seq = row.seq
                  comp.item_type = comp.type
                  const index = rows.push(comp) - 1
                  if (comp.selected) selection.push(index)
                  if (!!comp.componentID) {
                    confirm.push(index)
                    confirmRows.push(comp)
                  }
                })
              } else {
                const temp = {
                  item_type: row.item_type.includes('KIT')
                    ? 'KIT/System SN'
                    : 'Other SN',
                  model: row.model,
                  descript: row.descript,
                  itemno: row.itemno,
                  qty: row.qty,
                  seq: row.seq,
                  parent: 1,
                }
                rows.push(temp)
              }
            }) // data forEach
            if (confirm.length > 0) {
              this.setState({ rows, selection: confirm, loading: false, confirmRows })
            } else {
              console.log(selection)
              this.setState({ rows, selection, loading: false, confirmRows })
            }
          } else {
            data.forEach(row => {
              row.parent = 1
              row.item_type = row.item_type.includes('KIT')
                ? 'KIT/System SN'
                : 'Other SN'
            })
            this.setState({ rows: data, loading: false })
          }
        }) //checkComponents
      } // else statement
    }) //getOrderItem
  }

  handleSubmit = e => {
    e.preventDefault()
    this.setState({ loading: true, selection: [], confirm: [] })
    this.getOrderItem()
  }

  componentDidMount(props) {
    if(this.state.order_no !== ''){
      this.setState({loading: true})
      this.getOrderItem()
    }
  }

  render() {
    const { classes } = this.props
    const {
      confirmRows,
      associate,
      loading,
      info,
      message,
      order_no,
      rows,
      columns,
      columnWidths,
      selection,
      type,
      descript,
      itemno,
      model,
      permission,
    } = this.state
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        row.type = (
          <Select
            value={row.item_type}
            onChange={this.handleType(index)}
            input={<Input id={'type' + index} />}
          >
            {typeArray.map((row, index) => (
              <MenuItem key={row + index} value={row}>
                {row}
              </MenuItem>
            ))}
          </Select>
        )
      })
    }
    return (
      <Layout title="Worksheet Preparation">
        <SEO title="Worksheet" keywords={[`gatsby`, `application`, `react`]} />

        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Worksheet Preparation
          </Typography>
          <form onSubmit={this.handleSubmit}>
            <TextField
              id="order_input"
              className={classes.textField}
              label="Enter Order No"
              value={order_no}
              onChange={this.handleInput('order_no')}
              margin="normal"
              variant="outlined"
              required
              style={{
                width: 500,
              }}
            />
          </form>
          <Typography component="div" className={classes.tableContainer}>
            <WorksheetTable
              columns={columns}
              rows={rows}
              columnWidths={columnWidths}
              changeWidths={this.changeWidths}
              selection={selection}
              onSelectionChange={this.changeSelection}
            />
            {loading && <Loading />}
            <Grid container spacing={24}>
              <Grid item xs={12}>
                <Tooltip
                  title={
                    permission
                      ? 'Confirm Worksheet'
                      : "You don't have permission to do this"
                  }
                >
                  <span>
                    <Button
                      className={classes.button}
                      variant="contained"
                      onClick={this.setOrderTemplate}
                      disabled={!permission}
                    >
                      Confirm
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={associate}
                      onChange={this.handleSwitch('associate')}
                      color="primary"
                    />
                  }
                  label="Associate?"
                />
              </Grid>
              <Grid item xs={2}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="type">Type</InputLabel>
                  <Select
                    value={type}
                    onChange={this.handleChange('type')}
                    input={<Input id="type" />}
                  >
                    {typeArray.map((row, index) => (
                      <MenuItem key={row + index} value={row}>
                        {row}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  id="description_input"
                  className={classes.textField}
                  label="Description"
                  value={descript}
                  onChange={this.handleInput('descript')}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={2}>
                {!associate && (
                  <TextField
                    id="pn_input"
                    className={classes.textField}
                    label="Part No"
                    value={itemno}
                    onChange={this.handleInput('itemno')}
                    margin="normal"
                    variant="outlined"
                    required
                  />
                )}
                {associate && (
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="itemno">Part No</InputLabel>
                    <Select
                      value={itemno}
                      onChange={this.handleChange('itemno')}
                      input={<Input id="itemno" />}
                      required
                    >
                      {rows.map((row, index) => (
                        <MenuItem key={row.itemno + index} value={row.itemno}>
                          {row.itemno}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="model_input"
                  className={classes.textField}
                  label="Model"
                  value={model}
                  onChange={this.handleInput('model')}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  style={{
                    marginTop: '20px',
                  }}
                  className={classes.button}
                  onClick={this.addComponent}
                  variant="contained"
                  color="primary"
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              Confirm Components
            </Typography>
            <ConfirmTable rows={confirmRows} columns={confirm_columns}/>
          </Typography>
          <MyDialog
            open={info}
            handleClose={this.handleClose('info')}
            title="Info Dialog"
          >
            {message}
          </MyDialog>
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(Worksheet)
