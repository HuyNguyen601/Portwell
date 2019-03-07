import React from "react";

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    width: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

class CustomTagsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
}

render() {
  const { classes } = this.props
  //<div className="email-list">
  if (this.props.tags.length === 0) {
    return (
      <React.Fragment>
      <p>No tags</p>
      <Button onClick={this.props.newTag.bind(this)}>New</Button>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
      <h4>Custom Info Tags</h4>
      <Button onClick={this.props.newTag.bind(this)}>New</Button><br/>
      {this.props.tags.map((email, index) => (
        <React.Fragment>
        <FormControl className={classes.formControl}>
        <Select
        onChange={this.props.nameChange.bind(this, index)}
        value={email.name}
        inputProps={{
          name: 'tagName',
          id: 'tag_name_sel',
        }}
        >
        <MenuItem value="">
        None
        </MenuItem>
        <MenuItem value="so">
        Sale Order
        </MenuItem>
        <MenuItem value="wo">Work Order</MenuItem>
        <MenuItem value="uid">UID</MenuItem>
        <MenuItem value="pn">Part Number</MenuItem>
        <MenuItem value="stx">SFC Station</MenuItem>
        <MenuItem value="trx">Traveler</MenuItem>
        </Select>
        </FormControl>&nbsp;&nbsp;
        <FormControl className={classes.formControl}>
        <TextField key={index} onChange={this.props.valueChange.bind(this, index)} value={email.value} />
        </FormControl>&nbsp;&nbsp;
        <Button onClick={this.props.removeTag.bind(this, index)}>Remove</Button><br/>
        </React.Fragment>
      ))}
      </React.Fragment>
    );
  }
}
}

export default withStyles(styles)(CustomTagsList);
