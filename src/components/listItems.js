import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import {Layers} from '@material-ui/icons'
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import AssignmentIcon from '@material-ui/icons/Assignment';
import {Link} from 'gatsby'

export const mainListItems = (<div>
  <Link to='./' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon/>
      </ListItemIcon>
      <ListItemText primary="Dashboard"/>
    </ListItem>
  </Link>
  <Link to='./orderList' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <ShoppingCartIcon/>
      </ListItemIcon>
      <ListItemText primary="Order List"/>
    </ListItem>
  </Link>
  <Link to='./orderDetail' style={{textDecoration: 'none'}}>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon/>
      </ListItemIcon>
      <ListItemText primary="Order Detail"/>
    </ListItem>
  </Link>
  <Link to='./unit' style={{textDecoration: 'none'}}>
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
  <ListSubheader inset>Saved reports</ListSubheader>
  <ListItem button>
    <ListItemIcon>
      <AssignmentIcon/>
    </ListItemIcon>
    <ListItemText primary="Current month"/>
  </ListItem>
  <ListItem button>
    <ListItemIcon>
      <AssignmentIcon/>
    </ListItemIcon>
    <ListItemText primary="Last quarter"/>
  </ListItem>
  <ListItem button>
    <ListItemIcon>
      <AssignmentIcon/>
    </ListItemIcon>
    <ListItemText primary="Year-end sale"/>
  </ListItem>
</div>);
