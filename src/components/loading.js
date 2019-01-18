import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import loadingStyles from '../styles/loading.module.css';

export const Loading = () => (
  <div className={loadingStyles.shading}>
    <CircularProgress className={loadingStyles.icon} />
  </div>
);
