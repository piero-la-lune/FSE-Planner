import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';

import { downloadReport } from './util/logger.js';

const styles = theme => ({
  root: {
    background: theme.palette.primary.main,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 12,
    boxSizing: 'border-box'
  },
  inner: {
    maxWidth: '100%',
    width: 800,
    borderRadius: 4,
    background: '#fff',
    padding: 24,
    marginTop: 24,
    boxSizing: 'border-box'
  },
  title: {
    color: '#fff'
  },
  list: {
    margin: 0
  },
  buttons: {
    marginTop: 24,
    textAlign: 'center'
  },
  btn: {
    margin: 8
  }
});

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
  }

  refresh() {
    window.location.reload(true);
  }

  reset() {
    if (window.confirm('All custom settings and data will be lost. Are you sure?')) {
      localStorage.clear();
      window.location.reload(true);
    }
  }

  report() {
    downloadReport();
  }

  render() {
    if (this.state.hasError) {
      const { classes } = this.props;
      return (
        <div className={classes.root}>
        <Typography variant="h2" className={classes.title}>Something went wrong :(</Typography>
          <div className={classes.inner}>
            <Typography variant="body1" gutterBottom>Something unexpected happened and broke FSE Planner.</Typography>
            <Typography variant="body1" gutterBottom>Try reloading this page.</Typography>
            <Typography variant="body1" gutterBottom>If the error persists, please:</Typography>
            <ol className={classes.list}>
              <li><Typography variant="body1" gutterBottom>Download this <Link href="#" onClick={this.report}>bug report</Link></Typography></li>
              <li><Typography variant="body1" gutterBottom>Report the issue on <Link href="https://github.com/piero-la-lune/FSE-Planner/issues" target="_blank">GitHub</Link>, attaching the previously downloaded bug report</Typography></li>
              <li><Typography variant="body1" gutterBottom>Click the "Reset" button bellow to get FSE Planner working again</Typography></li>
            </ol>
            <div className={classes.buttons}>
              <Button variant="contained" className={classes.btn} color="primary" onClick={this.refresh}>Reload</Button>
              <Button variant="contained" className={classes.btn} color="secondary" onClick={this.reset}>Reset</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }

}

export default withStyles(styles)(ErrorBoundary);