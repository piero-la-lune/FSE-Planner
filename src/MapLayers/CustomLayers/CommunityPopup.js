import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const layerTypes = {
  all: "FSE Airports",
  unbuilt: "FBOs with unbuilt lots",
  forsale: "FBOs for sale",
  custom: "Owned FBOs or manual list",
  gps: "GPS coordinates"
};

const CommunityAccordion = React.memo(({e, expanded, handleExpand, handleImport}) => {
  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpand(e.id)}
      TransitionProps={{ unmountOnExit: true }}
      key={e.id}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ "& .MuiAccordionSummary-content": { flexDirection: 'column' }}}>
        <Typography>{e.info.display.name}</Typography>
        <Typography variant="body2" sx={{ color: '#aaa', textTransform: 'uppercase', fontSize: '0.7em' }}>{e.info.display.location}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2"><b>Type:</b> {layerTypes[e.info.type]}</Typography>
        <Typography variant="body2" sx={{ mt: 2}}><b>Size:</b> {e.info.type === 'gps' ? e.info.data.points.length + ' points' : e.info.data.icaos.length + ' airports'}</Typography>
        <Typography variant="body2" sx={{ mt: 2}}><b>Description:</b></Typography>
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{e.info.display.desc}</Typography>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            onClick={() => handleImport(e)}
            variant="contained"
          >
            Import layer
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}, (prevProps, {e, expanded}) => prevProps.e.id === e.id && prevProps.expanded === expanded)

function Community(props) {
  const [community, setCommunity] = React.useState(false);
  const [filteredCommunity, setFilteredCommunity] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [maxCommunity, setMaxCommunity] = React.useState(50);
  const contentRef = React.useRef(null);

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  React.useEffect(() => {
    setCommunity(true);
    fetch(process.env.REACT_APP_API_URL+'/layer').then(response => {
      if (response.ok) {
        response.json().then(arr => {
          setMaxCommunity(50);
          const a = arr.map(e => { return {...e, search: e.info.display.name.toLowerCase()+" "+(e.info.location || "").toLowerCase()} });
          setCommunity(a);
          setFilteredCommunity(a);
        });
      }
    });
  }, []);

  // Load more layers when at the bottom of the scroll
  const handleScroll = (evt) => {
    if (evt.target.scrollTop >= evt.target.scrollTopMax - 10 && maxCommunity < filteredCommunity.length) {
      setMaxCommunity(maxCommunity + 50);
    }
  }

  return (
    <Dialog open fullWidth maxWidth="md" PaperProps={{ sx: { minHeight: 'calc(100% - 64px);'}}} hideBackdrop>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            Browse community layers
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            type="search"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
            size="small"
            sx={{ width: 400 }}
            onChange={ evt => {
              const val = evt.target.value.toLowerCase();
              if (val) {
                setFilteredCommunity(community.filter(e => e.search.includes(val)));
              }
              else {
                setFilteredCommunity(community);
              }
              setMaxCommunity(50);
              contentRef.current.scrollTop = 0;
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{paddingTop: 3}}
        ref={contentRef}
        onScroll={handleScroll}
      >
        <Box>
          { community === true ?
            <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>
          :
            <Box>
              { filteredCommunity.slice(0, maxCommunity).map(e =>
                <CommunityAccordion
                  e={e}
                  expanded={e.id === expanded}
                  key={e.id}
                  handleExpand={handleExpand}
                  handleImport={props.handleImport}
                />
              )}
            </Box>
          }
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleCancel}
          color="secondary"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default Community;
