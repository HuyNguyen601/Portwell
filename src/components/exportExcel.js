import React from "react";
import {Button} from '@material-ui/core'
import {CSVLink, CSVDownload} from 'react-csv'

class exportExcel extends React.Component {
    constructor(props){
      super(props)
      this.exportSNByOrderNo = e=>{
        if(this.props.data.length ===0){
          return false
        }
      }
    }

    render() {
      const {data, headers, order_no} = this.props
        return (
            <CSVLink
              data={data}
              headers={headers}
              filename={order_no+'.csv'}
              onClick={this.exportSNByOrderNo}> Export To CSV </CSVLink>
        );
    }
}

export default exportExcel
