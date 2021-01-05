import React from 'react';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  popup: {
    height: '100vh'
  },
  dialog: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: 0
  },
  content: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2)
  },
  version: {
    marginBottom: theme.spacing(1)
  }
}));


function IssueLink({id}) {
  return <Link href={"https://github.com/piero-la-lune/FSE-Planner/issues/"+id} target="_blank">#{id}</Link>
}


function CreditsPopup(props) {

  const [expanded, setExpanded] = React.useState(0);
  const handleChange = (panel, newValue) => {
    if (newValue === 2) {
      handleClose();
      props.openTutorial();
    }
    else {
      setExpanded(newValue);
    }
  };
  const classes = useStyles();

  const handleClose = () => {
    setExpanded(0);
    // Close popup
    props.handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={props.open} fullWidth={true} maxWidth="md" classes={{paper: classes.popup}}>
      <DialogTitle>
        <Tabs
          value={expanded}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Changelog" />
          <Tab label="Credits" />
          <Tab label="Tutorial" />
        </Tabs>
        <IconButton className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.dialog}>
        <div hidden={expanded !== 0}>
          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.3.0 (2021-01-05)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>New airport surface and airport runway length filter (<IssueLink id={20} />)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Airport popup now show runway length and surface</ListItem>
              <ListItem>Airplane model list updated to include the new CJ4 and 2 other new models (<IssueLink id={19} />)</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Wrong latitude and longitude in context menu (<IssueLink id={25} />)</ListItem>
              <ListItem>Missing MN24 airport (<IssueLink id={14} />)</ListItem>
              <ListItem>Wrong passenger weight in Route Planner (<IssueLink id={21} />)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.2.0 (2020-12-11)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>New map overlay with unbuilt lots (updated daily)</ListItem>
              <ListItem>Airport filter settings: only show/consider aiports in MSFS or in the given size range (also works with Route Finder)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Display sort by value in Route Finder results</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Planes showing as rentable but cannot be rented</ListItem>
              <ListItem>Tutorial skip button issue</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.1.1 (2020-12-07)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Cancel button in Route Finder</ListItem>
              <ListItem>ICAOs in leg tooltips</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>MSFS airports updated</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Overlapping buttons in airport popups</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.1.0 (2020-12-01)</Typography>
            <Alert style={{margin:20}} severity="warning">User settings have been reset</Alert>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Route Finder: find the best paying multi-hop multi-assignment routes</ListItem>
              <ListItem>Huge performance improvement when displaying lot of objects on map</ListItem>
              <ListItem>Right click context menu on map, with various actions (open in FSE, set FROM or TO filter, etc.)</ListItem>
              <ListItem>Display custom markers on map (right click on airport to add/remove, or bulk management in the Data popup)</ListItem>
              <ListItem>Rentable planes: link to the FSE plane page</ListItem>
              <ListItem>Rentable planes: link to pan the map to a plane homeNew map layer with all FSE airports</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Default settings for FROM and TO filters</ListItem>
              <ListItem>Include searched ICAO in URL</ListItem>
              <ListItem>Default colors</ListItem>
              <ListItem>Variable airport icon size and path weight, depending on map zoom</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Broken tooltips in airports popups</ListItem>
              <ListItem>Alternative airport list display, when list was exceeding one line (#6)</ListItem>
              <ListItem>Broken zoom on search result (#7)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.0.0 (2020-11-06)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>New map layer with all FSE airports</ListItem>
              <ListItem>New map layer with all MSFS airports</ListItem>
              <ListItem>New map layer with all FSE airport landing areas</ListItem>
              <ListItem>Show/hide layers on map</ListItem>
              <ListItem>Tutorial for first time users</ListItem>
              <ListItem>FSE airport popup now indicates if the airport exists in MSFS, if the ICAO is different, and other potential MSFS landing spots within the FSE airport landing area</ListItem>
              <ListItem>No more restriction on the size of the zone for loading jobs from FSE</ListItem>
              <ListItem>You can now select multiple plane models when loading rentable planes from FSE</ListItem>
              <ListItem>New changelog and credits popup (changelog opens automatically when a new version is released)</ListItem>
              <ListItem>3 different airport icons depending on airport size</ListItem>
              <ListItem>New pay filter : minimum job pay, minimum leg pay, and top X% job pay per NM</ListItem>
              <ListItem>Loading screen and app icon</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Load Data popup now opens automatically for first time users</ListItem>
              <ListItem>Airports popup remodeled</ListItem>
              <ListItem>Improved performance</ListItem>
              <ListItem>Better proxy for FSE requests</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Search history is now correctly ordered</ListItem>
              <ListItem>Leg tooltips now show correct information when only My Flight is displayed on map</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v0.5.0 (2020-10-20)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Auto center/zoom map to jobs on loading</ListItem>
              <ListItem>New setting to change map middle</ListItem>
              <ListItem>Show My Flight (FSE selected jobs) on map</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Update popup improved</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>From/To ICAO bug with max angle</ListItem>
              <ListItem>Naval airport icon</ListItem>
              <ListItem>Map issue at around longitude -180</ListItem>
              <ListItem>Typo</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v0.4.1 (2020-10-17)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List>
              <ListItem>"From ICAO" and "To ICAO" filters now work as expected for jobs departing/arriving from/to the selected airport when a maximum angle is set</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v0.4.0 (2020-10-17)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Highlight leg on mouse over</ListItem>
              <ListItem>Search airport by ICAO or name, and display its location on map</ListItem>
              <ListItem>Search history is saved between sessions, and shown in drop-down list</ListItem>
              <ListItem>Display home information for rentable planes (arrow + details in tooltip)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Both way legs are now merged into one line on map</ListItem>
              <ListItem>Better design for map tooltips and popups</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>App header now adapt to window width</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v0.3.0 (2020-10-14)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Display settings</ListItem>
              <ListItem>Advanced "From ICAO", "To ICAO" and "Distance" settings</ListItem>
              <ListItem>Settings are kept between sessions</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v0.2.0 (2020-10-12)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>You can now select an area on a map to load jobs from, instead of selecting countries</ListItem>
              <ListItem>You get an error if the selected job area is too large</ListItem>
              <ListItem>"From ICAO" and "To ICAO" airports now appear with a green icon on the map</ListItem>
              <ListItem>New distance filter : set minimum and/or maximum job distance</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v0.1.0 (2020-10-11)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Show available jobs on map</ListItem>
              <ListItem>Show rentable plane on map</ListItem>
              <ListItem>Choose countries to load jobs from</ListItem>
              <ListItem>Choose airplane model to load rentable planes</ListItem>
              <ListItem>Filters are available to filter out unwanted jobs on map</ListItem>
            </List>
          </Paper>
        </div>
        <div hidden={expanded !== 1}>
          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>Contributors</Typography>
            <List dense>
              <ListItem>piero-la-lune (author)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>Map</Typography>
            <List dense>
              <ListItem><Link href="https://leafletjs.com/">Leaflet</Link></ListItem>
              <ListItem>&copy;&nbsp;<Link href="https://www.openstreetmap.org/copyright">OpenStreetMap</Link>&nbsp;contributors</ListItem>
            </List>
          </Paper>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreditsPopup;