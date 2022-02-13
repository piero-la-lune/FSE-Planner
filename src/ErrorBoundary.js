import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import { downloadReport } from './util/logger.js';


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
      return (
        <Box
          sx={{
            backgroundColor: 'primary.main',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: 12,
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="h2" sx={{ color: '#fff' }}>
            Something went wrong :(
          </Typography>
          <Box
            sx={{
              maxWidth: '100%',
              width: 800,
              borderRadius: 1,
              background: '#fff',
              padding: 3,
              marginTop: 3,
              boxSizing: 'border-box'
            }}
          >
            <Typography variant="body1" gutterBottom>Something unexpected happened and broke FSE Planner.</Typography>
            <Typography variant="body1" gutterBottom>Try reloading this page.</Typography>
            <Typography variant="body1" gutterBottom>If the error persists, please:</Typography>
            <Box component="ol" sx={{ m: 0 }}>
              <li><Typography variant="body1" gutterBottom>Download this <Link href="#" onClick={this.report}>bug report</Link></Typography></li>
              <li><Typography variant="body1" gutterBottom>Report the issue on <Link href="https://github.com/piero-la-lune/FSE-Planner/issues" target="_blank">GitHub</Link>, attaching the previously downloaded bug report</Typography></li>
              <li><Typography variant="body1" gutterBottom>Click the "Reset" button bellow to get FSE Planner working again</Typography></li>
            </Box>
            <Box
              sx={{
                marginTop: 3,
                textAlign: 'center'
              }}
            >
              <Button variant="contained" sx={{ m: 1 }} color="primary" onClick={this.refresh}>Reload</Button>
              <Button variant="contained" sx={{ m: 1 }} color="secondary" onClick={this.reset}>Reset</Button>
            </Box>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }

}

export default ErrorBoundary;
