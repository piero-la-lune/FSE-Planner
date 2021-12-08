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
import { downloadReport } from '../util/logger.js';


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
  },
  level2: {
    paddingLeft: theme.spacing(4)
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
    else if (newValue === 3) {
      downloadReport();
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
          <Tab label="Debug" />
        </Tabs>
        <IconButton className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className={classes.dialog}>
        <div hidden={expanded !== 0}>
          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.8.0 (2021-12-08)</Typography>
            <Typography variant="h6">New</Typography>
            <List dense>
              <ListItem>Save layers between sessions</ListItem>
              <ListItem>New layer type: import CSV data (FSE airports or GPS coordinates) to build a custom layer</ListItem>
              <ListItem>Share layers to other people (right click on layer to access the feature)</ListItem>
              <ListItem>Export layer to CSV file (right click on layer to access the feature)</ListItem>
              <ListItem>Layer context menu (right click on layer)</ListItem>
              <ListItem>Direct link to SkyVector and ChartFox in airport context menu (<IssueLink id={81} />) [by John Bayly]</ListItem>
              <ListItem>Highlight all jobs from/to when mouse hovering an airport (<IssueLink id={53} />) [by John Bayly]</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated MSFS data (added new seaplane bases, updated ILS and runway length & surface information, etc.)</ListItem>
              <ListItem>Updated FSE data (plane list)</ListItem>
              <ListItem>"Unbuilt" and "For Sale" layer data is now updated every 6 hours</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Duration display bug in Route Finder (<IssueLink id={86} />)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.7.0 (2021-10-09)</Typography>
            <Typography variant="h6">New</Typography>
            <List dense>
              <ListItem>New custom layers: add custom layers to the map with your own filters and display settings</ListItem>
              <ListItem>New basemap with English location names</ListItem>
              <ListItem>New ILS filter: only display and use airports that have an ILS approach (MSFS). Thanks to Lily418 for the help</ListItem>
              <ListItem>New setting in Route Finder to set a custom airplane rental price (<IssueLink id={65} />)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Optimized Route Finder memory usage: this should prevent crashes with Chrome, even when searching large areas</ListItem>
              <ListItem>Improved Route Finder when setting a destination: no more route going in the wrong overall direction</ListItem>
              <ListItem>Optimized application memory usage and loading time</ListItem>
              <ListItem>Updated runway data (length and surface)</ListItem>
              <ListItem>Updated plane list to include newly added FSE planes</ListItem>
              <ListItem>Updated MSFS data</ListItem>
              <ListItem>Changed display in Route Finder PDF to separate cargo weight from the total weight (cargo and passengers) (<IssueLink id={66} />)</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug when loading data from airports with an ICAO resembling a number, such as 0E0 (<IssueLink id={79} />)</ListItem>
              <ListItem>Rounded airplane specs in Route Finder for a better display</ListItem>
              <ListItem>Bug when resetting settings multiple times</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.6.0 (2021-06-27)</Typography>
            <Typography variant="h6">New</Typography>
            <List dense>
              <ListItem>New airport filter: only display airports that sell building materials</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>FSE Planner URL (now&nbsp;<Link href="https://fse-planner.piero-la-lune.fr">https://fse-planner.piero-la-lune.fr</Link>) with better performances (new hosting)</ListItem>
              <ListItem>Whenever a bug occurs, display an error message instead of a white screen</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug that would cause a white screen when loading an in-flight plane (<IssueLink id={64} />)</ListItem>
              <ListItem>Bug that would not load all planes when entering two or more users/groups (<IssueLink id={69} />)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.5.2 (2021-04-22)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug that would prevent the route PDF from showing</ListItem>
              <ListItem>Bug that would not display all planes on map when loading both rentable and user planes</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.5.1 (2021-04-22)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug that would prevent the Route Finder from displaying the results in some rare cases</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.5.0 (2021-04-21)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Many additions/improvements to the Route Finder:</ListItem>
              <List dense className={classes.level2}>
                <ListItem>You can now export a route to a PDF document!</ListItem>
                <ListItem>You can now copy a route to clipboard, to paste it in external tools</ListItem>
                <ListItem>You can now change the default routing parameters (in the app settings), so that you do not need to change them each time you run the Route Finder</ListItem>
                <ListItem>Available planes: you can now choose a specific model(s) for the search, instead off all loaded models</ListItem>
                <ListItem>Free search: you can now select a plane model, instead of manually entering aircraft specifications</ListItem>
                <ListItem>Free search: the ICAO inputs now offer suggestions and search capabilities</ListItem>
                <ListItem>Route filter: you can now filter the results to only show routes stopping at a given ICAO (thanks icykoneko)</ListItem>
                <ListItem>The Route Finder now includes "My flight" jobs in its search</ListItem>
              </List>
              <ListItem>FSX and X-Plane airport information is now included (show missing/renamed airports, display all airports on map, etc.). You can switch between simulators in the app settings</ListItem>
              <ListItem>Elevation info: show elevation in airport popup</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Improved "Update" buttons in the "Load data from FSE" popup to make their behavior clearer</ListItem>
              <ListItem>Planes rented by yourself are now loaded and displayed on the map (you need to enter your FSE username for it to works)</ListItem>
              <ListItem>Min/max filter values are now kept when switching between pax and cargo</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug in Route Finder, that would suggest routes with pax/cargo heavier than what the plane could carry (<IssueLink id={47} />&nbsp;&&nbsp;<IssueLink id={51} />)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.4.1 (2021-04-16)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Debug button: allow any user to easily export debug information, to help investigating bugs. The new button is accessible via the changelog & credits popup</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Behind the scenes: removed proxy, thanks to a welcomed change on FSE side regarding CORS headers</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug in "From ICAO" and "To ICAO" filters, that would wrongly hide some jobs</ListItem>
              <ListItem>Bug in Route Finder, that would prevent the search from finishing</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.4.0 (2021-03-13)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Better and more advanced parameters for the route finder:</ListItem>
              <List dense className={classes.level2}>
                <ListItem>Net earnings: the ground handling fees, booking fees, rental cost & bonus and fuel cost can be deduced from the total pay</ListItem>
                <ListItem>When using the 'Available planes' option, no need to set the aircraft specifications anymore (like 'max pax'), it is automatically deduced from the aircraft model</ListItem>
                <ListItem>New idle/taxi time parameter, to better take into account time spent on the ground</ListItem>
                <ListItem>New distance overhead parameter, to take into account airways and routes that are not straight between two airports</ListItem>
                <ListItem>Legs now cannot exceed the aircraft maximum range</ListItem>
                <ListItem>New parameter to only search for VIP assignments</ListItem>
              </List>
              <ListItem><span>Route finder considers on-route stops to better fill the plane along the way to a destination (was only considering loading more cargo to drop by along the way, but was not considering picking up cargo on the route) (<IssueLink id={33} />)</span></ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Aircrafts reserved for All-in assignments are now correctly displayed on the map (<IssueLink id={40} />)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.3.2 (2021-03-05)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>You can now load owned planes (by any user or group) on top of / instead of publicly rentable planes</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Aircraft models list updated (<IssueLink id={36} />)</ListItem>
            </List>
          </Paper>

          <Paper className={classes.content}>
            <Typography variant="h5" className={classes.version}>v1.3.1 (2021-01-07)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Wrong passenger count in Route Finder (<IssueLink id={31} />)</ListItem>
            </List>
          </Paper>

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
              <ListItem>Wrong passenger weight in Route Finder (<IssueLink id={21} />)</ListItem>
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
              <ListItem>icykoneko (contributor)</ListItem>
              <ListItem>Lily418 (contributor)</ListItem>
              <ListItem>John Bayly (contributor)</ListItem>
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