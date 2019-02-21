import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import {
  TextField,
  Button,
  Grid,
  Select,
  FormControl,
  InputLabel,
  Input,
  MenuItem,
} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
//import Layout from '../components/layout'
import SEO from '../components/seo'
import WorksheetTable from '../components/WorksheetTable'
//axios to handle xmlhttp request
import axios from 'axios'
import qs from 'qs'
import { eve_url, common_url } from '../config/config'

import { Link } from 'gatsby'

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
    name: 'type',
    title: 'Type',
  },
  {
    name: 'description',
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
  {
    name: 'seq',
    title: 'Seq',
  },
]
const confirmWidths = [
  {
    columnName: 'type',
    width: 100,
  },
  {
    columnName: 'description',
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
  {
    columnName: 'seq',
    width: 80,
  },
]

const getOrderItem = async order_no => {
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

const getTemplate = async order_no => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'getTemplate' }),
        jsonData: JSON.stringify({ order_no: order_no }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const checkComponent = async itemno => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'checkComponentList' }),
        jsonData: JSON.stringify({ itemno: itemno }),
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
      order_no: '',
      type: 'Misc',
      descript: '',
      itemno: '',
      model: '',
      type_array: [],
      rows: [],
      confirm_rows: [],
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
        {
          name: 'seq',
          title: 'Seq',
        },
      ],
      columnWidths: [
        {
          columnName: 'type',
          width: 100,
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
        {
          columnName: 'seq',
          width: 80,
        },
      ],
    }
    this.handleChange = type => e => this.setState({ [type]: e.target.value })
    this.changeSelection = selection => this.setState({ selection })
    this.handleInput = type => e => this.setState({ [type]: e.target.value })
    this.handleSubmit = this.handleSubmit.bind(this)
    this.addComponent = this.addComponent.bind(this)
    this.handleType = index => e => {
      e.preventDefault()
      const type_array = this.state.type_array
      type_array[index] = e.target.value
      this.setState({ type_array })
    }
  }

  addComponent = e => {
    const { type, itemno, descript, model, type_array, selection } = this.state
    const rows = this.state.rows.slice(0)
    if (rows.length > 0) {
      const row = {
        item_type: type,
        itemno: itemno,
        descript: descript,
        model: model,
      }
      let seq = 0
      rows.forEach(r => {
        if (r.item_type === 'KIT') {
          row.qty = r.qty
        }
        // find max seq
        seq = seq > r.seq ? seq : r.seq
      })
      row.seq = seq + 1
      const index = rows.push(row) - 1
      selection.push(index)
      type_array.push(type)
      this.setState({
        selection,
        rows,
        itemno: '',
        descript: '',
        model: '',
        type_array,
      })
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    getOrderItem(this.state.order_no).then(response => {
      const data = response.data.return
      if (!!data.error) {
        this.setState({ rows: [] })
      } else {
        const type_array = []
        const selection = []
        data.forEach((row, index) => {
          checkComponent(row.itemno).then(response => {
            if (!!response.data && response.data.selected) {
              //1, component is selected
              selection.push(index)
            }
            row.item_type = !!response.data ? response.data.type : row.item_type
            type_array[index] = row.item_type
            this.setState({ selection, type_array }) // do it here async
          })
        })
        data.map(row => {
          return {
            item_type: row.item_type,
            itemno: row.itemno,
            descript: row.descript,
            model: row.model,
            qty: row.qty,
            seq: row.seq,
          }
        })
        this.setState({ rows: data })
      }
    })
    getTemplate(this.state.order_no).then(response => {
      if (response.data.total > 0) {
        this.setState({ confirm_rows: response.data.rows })
      } else {
        this.setState({ confirm_rows: [] })
      }
    })
  }

  componentDidUpdate() {}

  render() {
    const { classes } = this.props
    const {
      order_no,
      rows,
      columns,
      columnWidths,
      selection,
      type,
      type_array,
      descript,
      itemno,
      model,
      confirm_rows,
    } = this.state
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        row.type = !!type_array[index] ? (
          <Select
            value={type_array[index]}
            onChange={this.handleType(index)}
            input={<Input id={'type' + index} />}
            disabled={type_array[index] === 'KIT'}
          >
            <MenuItem value="Misc">Misc</MenuItem>
            <MenuItem value="Memory">Memory</MenuItem>
            <MenuItem value="CPU">CPU</MenuItem>
            <MenuItem value="SSD">SSD</MenuItem>
            <MenuItem value="HDD">HDD</MenuItem>
            <MenuItem value="ITM">ITM</MenuItem>
            <MenuItem value="KIT">KIT</MenuItem>
          </Select>
        ) : (
          ''
        )
      })
    }
    return (
      <div>
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
              selection={selection}
              onSelectionChange={this.changeSelection}
            />
            <Grid container spacing={24}>
              <Grid item xs={1}>
                <Button className={classes.button} variant="contained">
                  Confirm
                </Button>
              </Grid>
              <Grid item xs={10} />

              <Grid item xs={2}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="type">Type</InputLabel>
                  <Select
                    value={type}
                    onChange={this.handleChange('type')}
                    input={<Input id="type" />}
                  >
                    <MenuItem value="Misc">Misc</MenuItem>
                    <MenuItem value="Memory">Memory</MenuItem>
                    <MenuItem value="CPU">CPU</MenuItem>
                    <MenuItem value="SSD">SSD</MenuItem>
                    <MenuItem value="HDD">HDD</MenuItem>
                    <MenuItem value="ITM">ITM</MenuItem>
                    <MenuItem value="KIT">KIT</MenuItem>
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
              Confirmed Worksheet
            </Typography>
            <WorksheetTable
              columns={confirm_columns}
              rows={confirm_rows}
              columnWidths={confirmWidths}
            />
          </Typography>
        </main>
      </div>
    )
  }
}

export default withStyles(styles)(Worksheet)
