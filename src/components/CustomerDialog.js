import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {firestore} from '../firebase'

export default class CustomerDialog extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      row: {},
      address: []
    };
    this.handleChange = type=>e=>{
      const row = this.state.row
      row[type] = e.target.value
      this.setState({row})
    }
  }
  componentDidUpdate(prevProps,prevState){
    console.log(this.state.address)
    if(this.props.open && this.props.row !== undefined && prevState.row !== this.props.row){
      this.setState({
        row: this.props.row
      })
      firestore.getAddress(this.props.row.id).then(address=>this.setState({address: address}))
    }
  }
  render() {
    const {row,address} = this.state
    return (<div>
      <Dialog open={this.props.open} onClose={this.props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Customer Details</DialogTitle>
        <DialogContent>
          <TextField id="outlined-name" label="Name" value={row.name} onChange={this.handleChange('name')} margin="dense" variant='outlined' required style={{width: 500}}/>
          <TextField id="outlined-phone" label="Phone" value={row.phone} onChange={this.handleChange('phone')} margin="dense" variant='outlined' required style={{width: 500}}/>
          <TextField id="outlined-email" label="Email" type='email' value={row.email} onChange={this.handleChange('email')} margin="dense" variant='outlined' style={{width: 500}}/>
          {this.state.address.map(address=>
            (<TextField
              key= {address.id}
              label="Address"
              value={address.value}
            //  onChange={this.handleChange('address')}
              margin="dense"
              variant='outlined'
              required
              style={{width: 500}}
            />)
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.props.handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>);
  }
}
