import React from 'react'

import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core'
const columns = [
  {
    name: 'order_no',
    title: 'Order No'
  }, {
    name: 'item_no',
    title: 'Item Code'
  }, {
    name: 'cust_code',
    title: 'Customer'
  }, {
    name: 'qty_order',
    title: 'Qty'
  }, {
    name: 'qty_mr',
    title: 'Receive'
  }, {
    name: 'qty_remain',
    title: 'Remain'
  }
]

export default(props) => (<Table>
  <TableHead>
    <TableRow>
      {
        columns.map(column => (<TableCell align="right" key={column.name}>
          {column.title}</TableCell>))
      }
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
        {
          columns.map(column => (<TableCell align="right" key={props.row.order_no + '_' + column.name}>
            {props.row[column.name]}</TableCell>))
        }
    </TableRow>
  </TableBody>
</Table>)
