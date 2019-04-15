import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import { Tooltip, Button } from '@material-ui/core'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { styles } from '../utils/styles'
import OrderInfo from '../components/OrderInfo'
import StationDisplay from '../components/StationDisplay'
import { MyDialog } from '../components/MyDialog'
import { Loading } from '../components/loading'
import { getUser } from '../services/auth'

//for Print Labels
//for xhr
import axios from 'axios'
import qs from 'qs'
import { common_url, sync_url } from '../config/config'

/*

  */
const getOrderId = async order_no => {
  try {
    const response = await axios.post(
      common_url,
      qs.stringify({
        id: 'developer',
        jsonMeta: JSON.stringify({ act: 'searchOrderByOrder' }),
        jsonData: JSON.stringify({
          search_text: order_no,
          search_form: 'Material Receiving',
        }),
      })
    )
    return response
  } catch (error) {
    console.log(error)
  }
}

const toValue = station => {
  if (!!station) {
    switch (station.trim()) {
      case 'Material R':
        return 1
      case 'Assembly':
        return 2
      case 'Burn In':
        return 3
      case 'Packing':
        return 4
      default:
        return 0
    }
  } else return 0
}

class OrderDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      permission: !!getUser().user_id,
      loading: false,
      infoDialog: false,
      message: '',
      id: !!this.props.location.state
          ? !!this.props.location.state.id
            ? this.props.location.state.id
            : ''
          : '',
      search: !!this.props.location.state
        ? this.props.location.state.search
        : '',
      batch_no: '',
      order_no: '', // this for order info
      qty_remain: 0,
      qty_mr: 0,
      qty_order: 0,
      cust_code: '',
      item_no: '',
      value: 0,
      updateQty: false, //toggle to update Qty info, when generate or delete batch
    }
    this.handleChange = type => e => {
      this.setState({
        [type]: e.target.value,
      })
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.syncOrder = this.syncOrder.bind(this)
    this.getOrderInfo = this.getOrderInfo.bind(this)
    this.searchBatchByAPTID = this.searchBatchByAPTID.bind(this)
    this.handleClose = type => e => this.setState({ [type]: false })
    this.handleOrderId = order_id =>
      this.setState({
        id: order_id,
        updateAction: !this.state.updateAction,
      })
    this.handleUpdate = () =>
      this.setState({ updateQty: !this.state.updateQty })
  }

  handleSubmit = e => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault()
      const { search } = this.state
      if (!!search && search !== '') {
        const firstChar = search.charAt(0)
        switch (firstChar) {
          case 'B':
            this.setState({ batch_no: search })
            break
          case 'U':
            this.searchBatchByAPTID(search)
            break
          default:
            getOrderId(search).then(response => {
              if (response.data.total > 0) {
                this.setState({
                  id: response.data.rows[0].order_id,
                  order_no: search,
                })
              } else {
                this.setState({
                  infoDialog: true,
                  message: 'Cannot find any orders',
                  id: '',
                  order_no: '',
                })
              }
            })
        }
      } else {
        this.setState({ batch_no: '', id: '' })
      }
    }
  }

  searchBatchByAPTID = async uid => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchBatchByAPTID' }),
          jsonData: JSON.stringify({
            search_text: uid,
            search_form: 'Material Receiving',
          }),
        })
      )
      if (response.data.total > 0) {
        const batch_no = response.data.rows[0].batch_no
        const order_id = response.data.rows[0].order_id
        this.getOrderInfo(order_id)
        this.setState({ batch_no })
      } else {
        this.setState({
          infoDialog: true,
          message: 'Cannot find any records with this UID',
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  syncOrder = async () => {
    this.setState({ loading: true })
    try {
      const response = await axios.post(
        sync_url,
        qs.stringify({
          id: 'production',
          jsonMeta: JSON.stringify({ act: 'sync_eve_sfc2' }),
          jsonData: JSON.stringify({ docnum: this.state.order_no }),
        })
      )
      console.log(response)
      const data = JSON.parse(response.data.return[0])
      const message = data.result
      this.setState({
        infoDialog: true,
        loading: false,
        message,
      })
    } catch (error) {
      console.log(error)
    }
  }

  getOrderInfo = async id => {
    try {
      const response = await axios.post(
        common_url,
        qs.stringify({
          id: 'developer',
          jsonMeta: JSON.stringify({ act: 'searchOrderByID' }),
          jsonData: JSON.stringify({
            search_text: id,
            search_form: 'Material Receiving',
          }),
        })
      )
      if (response.data.total > 0) {
        const state = response.data.rows[0]
        state.qty_mr = state.qty_mr === null ? 0 : state.qty_mr
        state.qty_remain = state.qty_order - state.qty_mr
        this.setState(state)
      } else {
        this.setState({
          order_no: '',
          item_no: '',
          cust_code: '',
          qty_order: 0,
          qty_mr: 0,
          qty_remain: 0,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { id, updateQty } = this.state
    if (prevState.id !== id || prevState.updateQty !== updateQty) {
      this.getOrderInfo(id)
    }
  }

  componentDidMount() {
    const { id } = this.state
    if (id !== '') {
      this.getOrderInfo(id)
    }
  }

  render() {
    const { classes } = this.props
    const {
      id,
      batch_no,
      order_no,
      value,
      search,
      qty_remain,
      qty_mr,
      qty_order,
      cust_code,
      item_no,
      updateQty,
      updateAction,
      infoDialog,
      message,
      loading,
      permission,
    } = this.state
    const row = {
      order_no: order_no,
      item_no: item_no,
      cust_code: cust_code,
      qty_order: qty_order,
      qty_mr: qty_mr,
      qty_remain: qty_remain,
    }

    return (
      <Layout title="Order Detail">
        <SEO
          title="Order Detail"
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
            Order Detail
          </Typography>
          <Paper>
            <TextField
              id="search_input"
              className={classes.textField}
              label="Search..."
              value={search}
              onChange={this.handleChange('search')}
              onKeyPress={this.handleSubmit}
              margin="normal"
              variant="outlined"
              autoComplete="off"
              required
              style={{ width: '70%' }}
            />
            <Tooltip
              title={
                permission
                  ? 'Sync this order'
                  : "You don't have permission to do this"
              }
            >
              <span>
                <Button
                  style={{ marginTop: '20px' }}
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  disabled={!permission || order_no === ''}
                  onClick={this.syncOrder}
                >
                  Sync
                </Button>
              </span>
            </Tooltip>
          </Paper>
          <OrderInfo row={row} />
          <StationDisplay
            id={id}
            batch_no={batch_no}
            value={value}
            qtyRemain={qty_remain}
            handleOrderId={this.handleOrderId}
            updateQty={updateQty}
            handleUpdate={this.handleUpdate}
            updateAction={updateAction}
            updateOrderInfo={this.getOrderInfo}
          />
          <MyDialog
            title="Info Dialog"
            open={infoDialog}
            handleClose={this.handleClose('infoDialog')}
          >
            {message.split('\n').map((m, key) => (
              <div key={key}>{m}</div>
            ))}
          </MyDialog>
          {loading && <Loading />}
        </main>
      </Layout>
    )
  }
}

export default withStyles(styles)(OrderDetail)
