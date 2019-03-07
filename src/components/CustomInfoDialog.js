import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CustomTagsList from '../components/CustomTagsList'
import axios from 'axios'
import qs from 'qs'
import {image_upload_url, upload_url} from '../config/config'


class CustomInfoDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    const props = this.props
    return (<div>
      <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
      <CustomTagsList tags={props.tags} newTag={props.newTag} removeTag={props.removeTag} valueChange={props.valueChange} nameChange={props.nameChange}/>
      <TextField id="custom_description" value={props.description} onChange={props.changeDescription} label="Custom Description" margin="normal"
      variant='outlined' required style={{width: 500}}/>
      </DialogContent>
      <DialogActions>
      {props.children}
      <Button onClick={props.saveCustomInfo} variant="contained" color="primary">Save</Button>
      <Button onClick={props.handleClose} variant="contained" color="primary">
      Cancel
      </Button>
      {props.handleSubmit !== undefined && <Button onClick={props.handleSubmit} color="primary">
      Confirm
      </Button>}
      </DialogActions>
      </Dialog>
      </div>);
    }
  }

  export default CustomInfoDialog
