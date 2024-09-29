import React from 'react';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import LI from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { downloadReport, uploadReport } from '../util/logger.js';


const styles = {
  popup: {
    height: '100vh'
  },
  content: {
    my: 4,
    p: 2
  },
  version: {
    mb: 1
  },
  level2: {
    pl: 4
  }
};


function IssueLink({id}) {
  return <Link href={"https://github.com/piero-la-lune/FSE-Planner/issues/"+id} target="_blank" sx={{display:'contents'}}>#{id}</Link>
}
function Code({children}) {
  return (
    <Box
      sx={{
        display: 'inline',
        '& code': {
          background: '#eee'
        }
      }}
    >
      <code>{children}</code>
    </Box>
  );
}
function ListItem({children}) {
  return <LI><ListItemText>{children}</ListItemText></LI>
}


function CreditsPopup(props) {

  const [expanded, setExpanded] = React.useState(0);
  const handleChange = (panel, newValue) => {
    if (newValue === 3) {
      handleClose();
      props.openTutorial();
    }
    else if (newValue < 3){
      setExpanded(newValue);
    }
  };

  const handleClose = () => {
    setExpanded(0);
    // Close popup
    props.handleClose();
  };

  return (
    <Dialog onClose={handleClose} open={props.open} fullWidth={true} maxWidth="md">
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
          <Tab label="Bug report" />
          <Tab label="Tutorial" />
          <Tab
            label="Donate"
            component="a"
            onClick={(event) => {
              event.stopPropagation();
            }}
            href="https://www.patreon.com/fse_planner"
            target="_blank"
          />
        </Tabs>
        <IconButton
          onClick={handleClose}
          size="large"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey[500]',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3, pt: 0 }}>
        <div hidden={expanded !== 0}>
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.19.1 (2024-09-29)</Typography>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated MSFS airports list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
            </List>
          </Paper>
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.19.0 (2024-07-07)</Typography>
            <Alert sx={{m:1}} severity="success">
              <Typography variant="body2">"FBOs with unbuilt lots" layer is back!</Typography>
            </Alert>
            <Typography variant="h6">Added</Typography>
              <List dense>
                <ListItem>"FBOs with unbuilt lots" layer is back!</ListItem>
                <ListItem>Add setting to keep the Update popup open after clicking an update button (new default behavior) (<IssueLink id={186} /> by machouinard)</ListItem>
                <ListItem>New option in Route Finder filters to exclude the given ICAO(s) from the results (#183)</ListItem>
                <ListItem>Display current number of loaded jobs/planes in the Update popup</ListItem>
              </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE aircraft list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fix pay numbers in Route Finder PDFs</ListItem>
            </List>
          </Paper>
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.18.2 (2024-05-11)</Typography>
            <Alert sx={{m:1}} severity="error">
              <Typography variant="body2">"FBOs with unbuilt lots" layers are no longer working due to a breaking change made by the FSE BoD. They have clearly stated that they do not want this feature to be available anymore in FSE Planner :(</Typography>
            </Alert>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE aircraft list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fix pay per leg sorting option in Route Finder (<IssueLink id={184} /> by jonaseberle)</ListItem>
            </List>
          </Paper>
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.18.1 (2024-02-16)</Typography>
            <Alert sx={{m:1}} severity="warning">
              <Typography variant="body2">In the previous update, FSE Planner behavior was changed: when adding assignments to your <i>My flight</i> page from FSE Planner, <b>these
                assignments are also added in the "My Assignments" queue in FSE Planner</b>.</Typography>
              <Typography variant="body2" sx={{mt: 1}}>Once you have flown those assignments, <b>you must clear the My Assignments queue in FSE Planner</b>,
                otherwise these jobs will still be shown on the map and in the Route Finder, giving you errors when trying to add/fly them a second time.</Typography>
              <Typography variant="body2" sx={{mt: 1}}>To clear the queue, you have two options:</Typography>
              <Typography variant="body2" sx={{ml: 2}}>1. Click the "Mark assignments as flown" icon in the Route Finder</Typography>
              <Typography variant="body2" sx={{ml: 2}}>2. Click the "Clear" button of the "My Assignments" section in the Load data popup.</Typography>
            </Alert>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE aircraft list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
            </List>
          </Paper>
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.18.0 (2023-12-10)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Assignments can now be marked as flown: this makes those assignments disappear entirely from FSE Planner without having to refresh the data. This feature is accessible in two places: in the Table view and in the Router Finder result view</ListItem>
              <ListItem>Added a counter to track the number of requests to FSE datafeeds (by @jsilva74)</ListItem>
              <ListItem>Added the "Return to starting airport" option to the global Route Finder settings (<IssueLink id={177} />)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Modified the Filters behavior so that it now also apply to My Assignments</ListItem>
              <ListItem>Added a note to specify that a read access key is stored on the user own computer, and is only used for data updates requested by the said user</ListItem>
              <ListItem>Updated MSFS data</ListItem>
              <ListItem>Updated FSE aircraft list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
              <ListItem>Modified the behavior when pasting data in the Route Finder ICAO filter, to allow for multiple ICAOs to be pasted at once (<IssueLink id={176} />)</ListItem>
            </List>
          </Paper>
          
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.17.0 (2023-07-31)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>New filter for custom layers: you can now filter by geographical area (useful to save preset regions as custom layers for loading jobs)</ListItem>
              <ListItem>Search for GPS coordinates in search bar (example: 48.8583N 2.2944E). URL can be shared with pinned location</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Geographical area selection can now be any polygon (not longer restricted to rectangle)</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug that prevented booking fees to be calculated with personal or group assignments</ListItem>
              <ListItem>Fixed bug that allowed All-In reserved airplanes to be considered as rentable by the Route Finder (<IssueLink id={172} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.16.0 (2023-07-23)</Typography>
            <Alert sx={{m:1}} severity="info">In memory of Heather: fly the <Link href="https://fse-planner.piero-la-lune.fr/?layer=572ec8a1-8ba1-44b3-b765-acad164f1ddf" target="_blank">Red Ball Express network</Link>!</Alert>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Context menu (right click on map): open location in Google Maps satellite view</ListItem>
              <ListItem>Job direction parameter directly in the Load Data popup</ListItem>
              <ListItem>More control on assignment types in Route Finder (passengers/cargo, black/green/VIP)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated MSFS data</ListItem>
              <ListItem>Updated FSE aircraft list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug when creating new custom layer with For Sale or Unbuilt Lots (no markers were shown on the map)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.15.0 (2023-06-04)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Customization of line thickness for custom layers</ListItem>
              <ListItem>Custom layer colors can now be entered with an hexadecimal color code (<IssueLink id={157} />)</ListItem>
              <ListItem>Share multiple layers with one unique URL (new <Code>layers</Code> URL query parameter). To share <Code>ID1</Code> and <Code>ID2</Code> layers at once (ids can be retrieved in the layer sharing URL), use this URL: <Code>https://fse-planner.piero-la-lune.fr/?layers=ID1,ID2</Code> (ids must be comma separated)</ListItem>
              <ListItem>New settings to save default job type filters (Trip/VIP/All In, Passengers/Cargo)</ListItem>
              <ListItem>New settings to allow non-compatible airports that have at least one alternative airport in the simulator to be included (when the option "Only display and use simulator compatible airports" is On) (<IssueLink id={159} />)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated MSFS data</ListItem>
              <ListItem>Updated FSE aircraft list</ListItem>
              <ListItem>Updated project dependencies</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed rounding bug in airport coordinates (<IssueLink id={162} />)</ListItem>
              <ListItem>Fixed "More" alternative airports button (<IssueLink id={160} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.14.1 (2022-12-28)</Typography>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Better autocomplete (ICAO search, FSE group/username search)</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug that prevented some usernames to appear in the "Owned & leased plane" autocomplete field</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.14.0 (2022-12-27)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Community layers: make public your layer so that other users can easily search for it and view it (no more need for a share link)</ListItem>
              <ListItem>Layers options: more colors and added description field</ListItem>
              <ListItem>New "Clear all filters" button to reset all filters at once (<IssueLink id={152} />)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Layer creation popup look & feel</ListItem>
              <ListItem>Clearer warning message when deleting a shared layer</ListItem>
              <ListItem>Updated FSE plane list</ListItem>
              <ListItem>Updated MSFS data</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug that could prevent future edit capability on custom layers</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.13.0 (2022-11-06)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Automatic import from FSE with Read Access Key when creating FBOs custom layers</ListItem>
              <ListItem>An aircraft bonus can now be manually set when using Route Finder in Free Search mode (<IssueLink id={144} />)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE plane list</ListItem>
              <ListItem>Updated MSFS data</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug with job custom area when changing the map center (<IssueLink id={149} />)</ListItem>
              <ListItem>Fixed wording in Route Finder results (<IssueLink id={145} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.12.0 (2022-06-18)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Support for the new "Maximum Cargo Weight" aircraft parameter in Route Finder</ListItem>
              <ListItem>You can now set a heading instead of a destination in Route Finder Free Search</ListItem>
              <ListItem>New sorting option in Route Finder: sort by shortest distance</ListItem>
              <ListItem>New search option in Route Finder: exclude all VIP jobs from search</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE plane list (added Honda HA-420 HondaJet)</ListItem>
              <ListItem>Updated MSFS data</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed FSE redirection after adding jobs to My Flight or renting a plane</ListItem>
              <ListItem>Fixed bug when setting the direction filter to 0</ListItem>
              <ListItem>Fixed bug when setting "Max number of bad legs" parameter to 0 in Route Finder</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.11.5 (2022-05-22)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug in Route Finder with result sorting</ListItem>
              <ListItem>Fixed bug with alternative map</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.11.4 (2022-05-20)</Typography>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE plane list (added Cessna 310R and Diamond DA-50RG)</ListItem>
              <ListItem>Reworked part of the Route Finder interface to improve user experience and make the parameters clearer</ListItem>
              <ListItem>Route Finder "Iterations" parameter changed to "Max number of legs" to enforce the maximum number of legs in resulting routes</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed bug in Route Finder when setting a destination that would give no result</ListItem>
              <ListItem>Fixed bug that would prevent to drag the custom area box (<IssueLink id={137} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.11.3 (2022-04-23)</Typography>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated FSE plane list (added Boeing 247D W42 and Rutan Long EZ RTW)</ListItem>
              <ListItem>Updated libraries/dependencies</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed X-Plane data (a lot of airports were missing)</ListItem>
              <ListItem>Fixed bug where clicking on an airport name in Route Finder results would do nothing or crash the app</ListItem>
              <ListItem>Fixed display bug with distance measuring tool</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.11.2 (2022-04-17)</Typography>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Updated MSFS data</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed "minimum number of passengers" filter bug with VIP jobs</ListItem>
              <ListItem>Fixed wrong "bad leg" count in Route Finder when using the Free Search option with a destination</ListItem>
              <ListItem>Fixed bug where closed MSFS airports would wrongly be displayed</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.11.1 (2022-03-17)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Infinite loading screen due to a bug in data migration from older FSE Planner versions</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.11.0 (2022-03-13)</Typography>
            <Alert sx={{m:1}} severity="warning">The "Custom markers" feature has been removed. Your custom markers have been automatically migrated to a new custom layer named "Custom markers".</Alert>
            <Typography variant="h6">New</Typography>
            <List dense>
              <ListItem>The search box can now be used to search for a leg (type the departing ICAO code, then a "&gt;" and finally the destination ICAO): the leg will be highlighted and focused on the Map view, the Table view will be filtered to keep only the corresponding jobs</ListItem>
              <ListItem>New settings to prevent loading jobs that will expire soon</ListItem>
              <ListItem>Right click on airport to open the Table view, right click on leg to open the Table view</ListItem>
              <ListItem>Right click on airport to add (or remove) ICAO to an existing custom layer</ListItem>
              <ListItem>New option to load jobs both FROM and TO the selected area/layer</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Passenger and package jobs can now be displayed at the same time on the map</ListItem>
              <ListItem>Removed Custom Markers feature</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed Route Finder that was finding jobs too heavy to add the necessary fuel for the leg</ListItem>
              <ListItem>Fixed application height bug in Safari mobile</ListItem>
              <ListItem>In Route Finder, disable Add to My Flight button when there is a VIP job in the list</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.10.2 (2022-03-07)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed leg tooltip showing wrong jobs in returning jobs</ListItem>
              <ListItem>Fixed "Local storage is full" error</ListItem>
              <ListItem>Fixed plane sorting in Assignments Table view</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.10.0 (2022-03-05)</Typography>
            <Typography variant="h6">New</Typography>
            <List dense>
              <ListItem>New Table view: display all available assignments and planes in a table instead of the map. Filters are shared between the Map view and the Table view</ListItem>
              <ListItem>Add assignments to My Flight or a group queue directly from within FSE Planner: works in Table view and in Route Finder</ListItem>
              <ListItem>Rent a plane directly from within FSE Planner: works in Table view and in Route Finder</ListItem>
              <ListItem>New job loading option: load data from the top 10 (by default) areas where a plane is available. This can also be used to query all All-In jobs for a given plane (set Strict mode in Settings for this to work as expected) (<IssueLink id={56} />)</ListItem>
              <ListItem>Measure a distance and a bearing between two points on the map (right click to set the origin) (<IssueLink id={110} />)</ListItem>
              <ListItem>Add a custom image to PDF generated by the Route Finder, in the colors of a group for instance (image can be set in the Settings popup)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>The application top bar has been revamped to be clearer for new users</ListItem>
              <ListItem>Pay filters are now available with the other filters (they can no longer be changed in the Settings popup)</ListItem>
              <ListItem>Min/max filters are now working as expected (fixed min for All-In & VIP jobs, and fixed max for Trip Only jobs), tooltip display has been improved when hovering a leg to display individual jobs</ListItem>
              <ListItem>Updated X-Plane data (11.55) & MSFS data</ListItem>
              <ListItem>Clearer error message when updating data to separate maintenance and key errors (<IssueLink id={101} />)</ListItem>
              <ListItem>A confirmation is now asked before deleting a custom layer (<IssueLink id={111} />)</ListItem>
              <ListItem>Tabulations can now be used in custom layers data import to allow direct copy & paste from Google Sheets (<IssueLink id={112} />)</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Fixed various bugs when using touch screen devices (long press to simulate right clicks)</ListItem>
              <ListItem>Fix bug preventing right clicks in the custom layer popup (<IssueLink id={112} />)</ListItem>
              <ListItem>Fix bug with incorrect map wrapping for some layers</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.9.0 (2022-02-17)</Typography>
            <Alert sx={{m:1}} severity="info">Because some of you asked, I have set up a <Link href="https://www.patreon.com/fse_planner" target="_blank">Patreon page</Link>. Any donation is welcome, however FSE Planner is (and will always remain) a FREE and OPEN SOURCE tool: I do not wish anyone to ever feel compelled to donate.</Alert>
            <Typography variant="h6">New</Typography>
            <List dense>
              <ListItem>Load jobs from custom layers (= you can now load jobs from a list of ICAOs instead of a geographical area) (<IssueLink id={95} />, <IssueLink id={100} />) </ListItem>
              <ListItem>Load group assignments (group read access key needed) (<IssueLink id={96} />)</ListItem>
              <ListItem>New filter to exclude military airbases (<IssueLink id={103} />)</ListItem>
              <ListItem>New settings to set job direction when loading jobs from FSE</ListItem>
              <ListItem>New action to update data of shared layers (to load the latest changes made by the layer author)</ListItem>
            </List>
            <Typography variant="h6">Changed</Typography>
            <List dense>
              <ListItem>Alternative basemap: new personalized map tiles (self hosted), so no more usage limit (unless it becomes too expensive to host...) (<IssueLink id={97} />)</ListItem>
              <ListItem>Airports with available planes for rent are now highlighted with the same (red by default) color, instead of just the "jobs and plane search" layer as before (<IssueLink id={98} />)</ListItem>
              <ListItem>Increased the map max zoom</ListItem>
              <ListItem>Updated plane list to include the new Challenger 650</ListItem>
              <ListItem>Technical upgrade: updated a lot of libraries and dependencies</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug with destination airport elevation on exported route (<IssueLink id={93} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.8.0 (2021-12-08)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.7.0 (2021-10-09)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.6.0 (2021-06-27)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.5.2 (2021-04-22)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug that would prevent the route PDF from showing</ListItem>
              <ListItem>Bug that would not display all planes on map when loading both rentable and user planes</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.5.1 (2021-04-22)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Bug that would prevent the Route Finder from displaying the results in some rare cases</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.5.0 (2021-04-21)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Many additions/improvements to the Route Finder:</ListItem>
              <List dense sx={styles.level2}>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.4.1 (2021-04-16)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.4.0 (2021-03-13)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Better and more advanced parameters for the route finder:</ListItem>
              <List dense sx={styles.level2}>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.3.2 (2021-03-05)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>You can now load owned planes (by any user or group) on top of / instead of publicly rentable planes</ListItem>
            </List>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Aircraft models list updated (<IssueLink id={36} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.3.1 (2021-01-07)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List dense>
              <ListItem>Wrong passenger count in Route Finder (<IssueLink id={31} />)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.3.0 (2021-01-05)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.2.0 (2020-12-11)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.1.1 (2020-12-07)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.1.0 (2020-12-01)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v1.0.0 (2020-11-06)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v0.5.0 (2020-10-20)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v0.4.1 (2020-10-17)</Typography>
            <Typography variant="h6">Fixed</Typography>
            <List>
              <ListItem>"From ICAO" and "To ICAO" filters now work as expected for jobs departing/arriving from/to the selected airport when a maximum angle is set</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v0.4.0 (2020-10-17)</Typography>
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

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v0.3.0 (2020-10-14)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>Display settings</ListItem>
              <ListItem>Advanced "From ICAO", "To ICAO" and "Distance" settings</ListItem>
              <ListItem>Settings are kept between sessions</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v0.2.0 (2020-10-12)</Typography>
            <Typography variant="h6">Added</Typography>
            <List dense>
              <ListItem>You can now select an area on a map to load jobs from, instead of selecting countries</ListItem>
              <ListItem>You get an error if the selected job area is too large</ListItem>
              <ListItem>"From ICAO" and "To ICAO" airports now appear with a green icon on the map</ListItem>
              <ListItem>New distance filter : set minimum and/or maximum job distance</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>v0.1.0 (2020-10-11)</Typography>
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
          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>Contributors</Typography>
            <List dense>
              <ListItem>piero-la-lune (author)</ListItem>
              <ListItem>icykoneko (contributor)</ListItem>
              <ListItem>Lily418 (contributor)</ListItem>
              <ListItem>John Bayly (contributor)</ListItem>
              <ListItem>jsjunior (contributor)</ListItem>
              <ListItem>jsilva74 (contributor)</ListItem>
              <ListItem>jonaseberle (contributor)</ListItem>
              <ListItem>machouinard (contributor)</ListItem>
            </List>
          </Paper>

          <Paper sx={styles.content}>
            <Typography variant="h5" sx={styles.version}>Map</Typography>
            <List dense>
              <ListItem><Link href="https://leafletjs.com/">Leaflet</Link></ListItem>
              <ListItem>&copy;&nbsp;<Link href="https://www.openstreetmap.org/copyright">OpenStreetMap</Link>&nbsp;contributors</ListItem>
            </List>
          </Paper>
        </div>
        <div hidden={expanded !== 2}>
          <Paper sx={styles.content}>
            <Typography variant="body1">To report a bug, open an <Link href="https://github.com/piero-la-lune/FSE-Planner/issues" target="_blank">issue in GitHub</Link>.</Typography>
            <Typography variant="body1">Please attach to your issue the debug file that can be downloaded just below.</Typography>
            <Box sx={{my: 1}}>
              <Button variant="contained" onClick={downloadReport}>
                Download debug file
              </Button>
            </Box>
            { process.env.REACT_APP_DEBUG === 'true' &&
              <Box sx={{mt: 2}}>
                <label htmlFor="jsonImport">
                  <input
                    accept="text/json"
                    id="jsonImport"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={uploadReport}
                  />
                  <Button variant="contained" component="span">
                    Import debug file
                  </Button>
                </label>
              </Box>
            }
          </Paper>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreditsPopup;
