import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Layout from '../components/layout'
import { Grid, Input } from '@material-ui/core'
import SEO from '../components/seo'
import ImgTable from '../components/ImgTable'
import { styles } from '../utils/styles'
//axios to handle xmlhttp request
import {MyDialog} from '../components/MyDialog'
import axios from 'axios'
import qs from 'qs'
import { upload_url } from '../config/config'
import '../../node_modules/react-dropzone-component/styles/filepicker.css'
import '../../node_modules/dropzone/dist/min/dropzone.min.css'
import DropzoneComponent from 'react-dropzone-component'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

var componentConfig = {
  iconFiletypes: ['.jpg', '.png', '.gif'],
  showFiletypeIcon: true,
  autoProcessQueue: false,
}
class ImageUpload extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      info: false,
      message: '',
      duplicateName: false,
      reqValidation: false,
      description: '',
      tagName: '',
      tagValue: '',
      editId: '',
      docNum: '',
      imgTableNeedsUpdate: false,
      columns: [
        {
          name: '_idh',
          title: '',
        },
        {
          name: 'name',
          title: 'name',
        },
        {
          name: 'description',
          title: 'Description',
        },
        {
          name: 'type',
          title: 'type',
        },
        {
          name: 'size',
          title: 'size',
        },
      ],
      columnWidths: [
        { columnName: '_idh', width: 300 },
        { columnName: 'name', width: 200 },
        { columnName: 'description', width: 300 },
        { columnName: 'type', width: 100 },
        { columnName: 'size', width: 100 },
      ],
      uploadSuccess: false,
    }
    this.changeSelection = this.changeSelection.bind(this)
    this.djsConfig = {
      addRemoveLinks: true,
      acceptedFiles: 'image/jpeg,image/png,image/gif',
      autoProcessQueue: false,
    }

    // If you want to attach multiple callbacks, simply
    // create an array filled with all your callbacks.
    this.callbackArray = [() => console.log('Hi!'), () => console.log('Ho!')]

    // Simple callbacks work too, of course
    this.callback = () => console.log('Hello!')
    this.accept = this.accept.bind(this)
    this.error = this.error.bind(this)
    this.success = this.success.bind(this)
    this.removedfile = file => console.log('removing...', file)
    this.dropzone = null
    this.handleClose = this.handleClose.bind(this)
    this.clickHandler = this.clickHandler.bind(this)
    this.handleChangeDescription = this.handleChangeDescription.bind(this)
    this.handleChangeTagName = this.handleChangeTagName.bind(this)
    this.handleChangeTagValue = this.handleChangeTagValue.bind(this)
  }
  changeSelection(selection) {
    this.setState({ selection })
  }

  handleChangeDescription(event) {
    this.setState({
      description: event.currentTarget.value,
    })
  }

  handleChangeTagName(event) {
    this.setState({
      tagName: event.target.value,
    })
  }

  handleChangeTagValue(event) {
    this.setState({
      tagValue: event.currentTarget.value,
    })
  }

  componentDidMount() {}

  clickHandler() {
    if (
      this.state.description === '' ||
      this.state.tagName === '' ||
      this.state.tagValue === ''
    ) {
      this.setState({ reqValidation: true })
      return false
    }
    const acceptedFiles = this.dropzone.getAcceptedFiles()
    for (let i = 0; i < acceptedFiles.length; i++) {
      //setTimeout(function () {
      this.dropzone.processFile(acceptedFiles[i])
    }
    this.dropzone.processQueue()
  }
  //this function to close dialog, used for all types
  handleClose = type => e => {
    //if (type == 'uploadSuccess')
    //window.location.href = window.location.href
    this.setState({
      [type]: false,
    })
  }
  accept(accepted, rejected) {
    //validating name of file
    let self = this
    try {
      axios
        .post(
          upload_url + 'file_validator_react.php',
          qs.stringify({
            als_file_name: accepted.name,
          })
        )
        .then(function(response) {
          console.log(typeof response.data)
          //let parsedResponse = JSON.parse(response.data)
          if (typeof response.data.result === 'undefined') {
            // instanceof Array) {//} || typeof parsedResponse.result === 'undefined' || parsedResponse.result != "valid") {
            self.setState({
              duplicateName: true,
              duplicateNameValue: accepted.name,
            })
            self.dropzone.removeFile(accepted)
          }
        })
        .catch(function(error) {
          console.error(error)
        })
    } catch (error) {
      console.error(error)
    }
  }

  success(file, res) {
    //let fileValidateResp = this.fileValidate(file)
    const data = JSON.parse(res)
    console.log(data.id)
    var self = this
    //remove file from dropzone and upload description and tag name & value
    try {
      let customVars = []
      let customVar = {}
      customVar[this.state.tagName] = this.state.tagValue
      customVars.push(customVar)
      //let customVarsStr = qs.stringify(customVars)
      axios
        .post(
          upload_url + 'save_custom_handler_react.php?id=' + data.id,
          qs.stringify({
            jsonData: JSON.stringify({
              desc: this.state.description, //this.customInfoDialog.current.state.description,
              customVars: customVars,
            }),
          })
        )
        .then(response => {
          self.needLoadGrid = true
          self.setState({
            imgTableNeedsUpdate: true,
            uploadSuccess: true,
          })
          //self.imgTable.current.loading = true//setState({loading: true})
          //self.imgTable.current.setState({loading: true})
          //self.imgTable.current.setState({loading: true})
          //self.getOrder(self.imgTable.current.state)
        })
        .catch(error => {
          console.error(error)
        })
      this.dropzone.removeFile(file)
    } catch (error) {}
  }
  error = (file, reason)=>{
    this.setState({info: true, message: reason})
  }

  render() {
    const djsConfig = this.djsConfig
    const {info, message} = this.state
    // For a list of all possible events (there are many), see README.md!
    const eventHandlers = {
      init: dz => (this.dropzone = dz),
      drop: this.callbackArray,
      addedfile: this.accept,
      error: this.error,
      success: this.success,
      onDrop: this.accept,
      removedfile: this.removedfile,
    }
    const { classes } = this.props
    return (
      <Layout title="Image Upload">
        <SEO
          title="Image Upload"
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
            <div style={{ float: 'left', width: '50%' }}>
              Upload Image
              <DropzoneComponent
                config={componentConfig}
                eventHandlers={eventHandlers}
                djsConfig={djsConfig}
                action={upload_url + 'upload.php'}
              />
            </div>
            <div
              style={{
                float: 'left',
                width: '40%',
                marginTop: '40px',
                marginLeft: '20px',
              }}
            >
            <Grid container spacing={24}>
            <Grid item xs={4}>
              <TextField
                variant="outlined"
                value={this.state.description}
                label="Description"
                onChange={this.handleChangeDescription}
                style={{}}
              />
              </Grid>
              </Grid>
              <Grid container spacing={24}>
              <Grid item xs={4}>
              <FormControl
                className={classes.formControl}
                style={{}}
              >
                <InputLabel
                  htmlFor="tag_name_sel"
                  style={{}}
                >
                  Tag Name
                </InputLabel>
                <Select
                  value={this.state.tagName}
                  style={{}}
                  onChange={this.handleChangeTagName}
                  input={
                    <Input
                      name="tagName"
                      id="tag_name_sel"
                    />
                  }
                >
                  <MenuItem value="so">Sale Order</MenuItem>
                  <MenuItem value="wo">Work Order</MenuItem>
                  <MenuItem value="uid">UID</MenuItem>
                  <MenuItem value="pn">Part Number</MenuItem>
                  <MenuItem value="stx">SFC Station</MenuItem>
                  <MenuItem value="trx">Traveler</MenuItem>
                </Select>
              </FormControl>
              </Grid>
              </Grid>
              <Grid container spacing={24}>
              <Grid item xs={4}>
              <TextField
                variant="outlined"
                label="Tag Value"
                value={this.state.tagValue}
                onChange={this.handleChangeTagValue}
                style={{}}
              />
              </Grid>
              </Grid>
              <Button
                variant="contained"
                onClick={this.clickHandler}
                color="primary"
                className={classes.button}
              >
                Upload
              </Button>
            </div>
          </Typography>
          <Typography component="div" className={classes.tableContainer}>
            <ImgTable
              columns={this.state.columns}
              rows={this.state.rows}
              totalCount={this.state.totalCount}
              columnWidths={this.state.columnWidths}
              onSelectionChange={this.changeSelection}
              parent={this}
              remotePaging
              loading={this.state.imgTableNeedsUpdate}
            />
            <Dialog
              open={this.state.duplicateName}
              onClose={this.handleClose('duplicateName')}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">Validation error</DialogTitle>
              <DialogContent>
                File with name {this.state.duplicateNameValue} already exists,
                please re-name and try again
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleClose('duplicateName')}
                  color="primary"
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={this.state.reqValidation}
              onClose={this.handleClose('reqValidation')}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">Validation error</DialogTitle>
              <DialogContent>
                Please enter description, key and value of images!
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleClose('reqValidation')}
                  color="primary"
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={this.state.uploadSuccess}
              onClose={this.handleClose('uploadSuccess')}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">
                Image Upload message
              </DialogTitle>
              <DialogContent>Successfully uploaded image</DialogContent>
              <DialogActions>
                <Button
                  onClick={this.handleClose('uploadSuccess')}
                  color="primary"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
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

export default withStyles(styles)(ImageUpload)
