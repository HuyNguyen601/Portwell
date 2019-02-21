import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import {Layers, Input} from '@material-ui/icons'
import BarChartIcon from '@material-ui/icons/BarChart';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {Link} from 'gatsby'

export const mainListItems = (<div>
  <Link to='/' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon/>
      </ListItemIcon>
      <ListItemText primary="Dashboard"/>
    </ListItem>
  </Link>
  <Link to='/orderList' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <ShoppingCartIcon/>
      </ListItemIcon>
      <ListItemText primary="Order List"/>
    </ListItem>
  </Link>
  <Link to='/orderDetail' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon/>
      </ListItemIcon>
      <ListItemText primary="Order Detail"/>
    </ListItem>
  </Link>
  <Link to='/unit' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <Layers/>
      </ListItemIcon>
      <ListItemText primary="Unit History"/>
    </ListItem>
  </Link>
  <Link to='/report' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <BarChartIcon/>
      </ListItemIcon>
      <ListItemText primary="Reports"/>
    </ListItem>
  </Link>
</div>);

export const secondaryListItems = (<div>
  <ListSubheader inset>SN Collections</ListSubheader>
  <Link to='/worksheet' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon/>
      </ListItemIcon>
      <ListItemText primary="Worksheet"/>
    </ListItem>
  </Link>
  <Link to='/sn' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <Input/>
      </ListItemIcon>
      <ListItemText primary="SN Scan"/>
    </ListItem>
  </Link>
  <Link to='/component' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <Layers/>
      </ListItemIcon>
      <ListItemText primary="Components"/>
    </ListItem>
  </Link>
  <Link to='/collection' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon/>
      </ListItemIcon>
      <ListItemText primary="SN Collections"/>
    </ListItem>
  </Link>

</div>);
