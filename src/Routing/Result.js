import React from 'react';
import Paper from '@mui/material/Paper';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FlightIcon from '@mui/icons-material/Flight';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

import PDFRoute from './PDFRoute.js';
import AddToFlight from '../Table/AddToFlight.js';
import { pdf } from '@react-pdf/renderer';

const styles = {
  focusAction: {
    margin: '16px 6px 0 6px'
  },
  tlGridText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    marginRight: 0.2
  }
};

function textTotalCargo(cargos, kgPax = true) {
  const text = [];
  let pax = 0;
  let kg = 0;
  for (const cargo of cargos) {
    pax += cargo.pax;
    if (!cargo.pax || kgPax) {
      kg += cargo.kg;
    }
  }
  if (pax) {
    if (pax > 1) {
      text.push(pax + ' passengers');
    }
    else {
      text.push('1 passenger');
    }
  }
  if (kg) {
    text.push(kg + ' kg');
  }
  return text.join(' • ');
}


function Result({focus, setFocus, options, ...props}) {
  const [copied, setCopied] = React.useState(false);
  const [defaultAddToGroup, setDefaultAddToGroup] = React.useState(null);

  const jobIds = React.useMemo(() => {
    const ids = new Set();
    for (const leg of focus.cargos) {
      for (const jobs of Object.values(leg)) {
        for (const job of jobs) {
          ids.add(job.id);
        }
      }
    }
    return [...ids];
  }, [focus]);
  const hasVIP = React.useMemo(() => focus.cargos.reduce((acc, leg) => acc || leg.VIP.length > 0, false), [focus]);

  return (

    <React.Fragment>
      <Box
        onClick={() => setFocus(null)}
        sx={{
          padding: 3,
          borderBottom: "1px solid #eee",
          cursor: "pointer",
          background: "#fff",
          display: "flex",
          "&:hover": {
            background: "#f9f9f9"
          }
        }}
      >
        <Typography
          variant="body1"
          sx={{
            verticalAlign: 'middle',
            display: 'inline-flex'
          }}
        >
          <ArrowBackIcon />&nbsp;Back to results
        </Typography>
      </Box>

      <Box sx={{
        overflowX: "hidden",
        overflowY: "auto",
        scrollbarWidth: "thin",
        background: "#fff"
      }}>
        <Box sx={{
          textAlign: 'center',
        }}>
          <Tooltip title={copied ? 'Copied!' : 'Copy route to clipboard'}>
            <IconButton
              sx={styles.focusAction}
              onClick={() => {
                navigator.clipboard.writeText(focus.icaos.join(' '));
                setTimeout(() => setCopied(false), 1000);
                setCopied(true);
              }}
              size="large">
              <AssignmentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export route to PDF document">
            <IconButton
              sx={styles.focusAction}
              onClick={() => {
                const blob = pdf(
                  <PDFRoute
                    route={focus}
                    icaodata={options.icaodata}
                    routeParams={{
                      idleTime: props.idleTime,
                      overheadLength: props.overheadLength,
                      approachLength: props.approachLength
                    }}
                    settings={options.settings}
                  />
                ).toBlob();
                blob.then((file) => {
                  var fileURL = URL.createObjectURL(file);
                  window.open(fileURL);
                });
              }}
              size="large">
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <AddToFlight
            style={{
              display: 'inline-flex',
              margin: '16px 6px 0 6px',
              verticalAlign: 'middle'
            }}
            ids={jobIds}
            variant="hidden"
            defaultGroup={defaultAddToGroup}
            onSubmit={(evt) => {
              for (const leg of focus.cargos) {
                for (const j of leg.TripOnly) {
                  props.actions.current.addToFlight(j.from, j.to, j.id);
                }
                for (const j of leg.VIP) {
                  props.actions.current.addToFlight(j.from, j.to, j.id);
                }
              }
            }}
          >
            <Tooltip title={defaultAddToGroup ? 'Add all assignments to '+defaultAddToGroup[0] : (hasVIP ? 'This route includes VIP jobs, you cannot add the whole route at once' : 'Add all assignments to My Flight')}>
              <span>
                <IconButton
                  size="large"
                  type="submit"
                  disabled={!defaultAddToGroup && hasVIP}
                >

                    <AddShoppingCartIcon />
                </IconButton>
              </span>
            </Tooltip>
          </AddToFlight>
          { focus.planeId &&
            <form
              action="https://server.fseconomy.net/userctl"
              method="post"
              target="fse"
              style={{
                display: 'inline-flex',
                margin: '16px 6px 0 6px',
                verticalAlign: 'middle'
              }}
            >
              <input type="hidden" name="event" value="Aircraft" />
              <input type="hidden" name="type" value="add" />
              <input type="hidden" name="rentalType" value={focus.rentalType} />
              <input type="hidden" name="id" value={focus.planeId} />
              <input type="hidden" name="returnpage" value="/myflight.jsp" />
              <Tooltip title="Rent plane">
                <IconButton
                  size="large"
                  type="submit"
                >
                  <FlightIcon />
                </IconButton>
              </Tooltip>
            </form>
          }
          <Tooltip title="Mark assignments as flown">
            <IconButton
              sx={styles.focusAction}
              onClick={() => {
                for (const leg of focus.cargos) {
                  for (const j of leg.TripOnly) {
                    props.actions.current.markAsFlown(j.from, j.to, j.id);
                  }
                  for (const j of leg.VIP) {
                    props.actions.current.markAsFlown(j.from, j.to, j.id);
                  }
                }
                setFocus(null);
              }}
              size="large">
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={4}>
            <Typography variant="body1" sx={styles.tlGridText}><AttachMoneyIcon sx={styles.icon} />{focus.pay}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1" sx={styles.tlGridText}><SettingsEthernetIcon sx={styles.icon} />{focus.distance} NM</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1" sx={styles.tlGridText}><AccessTimeIcon sx={styles.icon} />{focus.time}</Typography>
          </Grid>
        </Grid>
        <Timeline align="right">
          {focus.icaos.map((icao, i) => {
            const onboard = i < focus.icaos.length-1 ? focus.cargos[i].TripOnly.reduce((acc, elm) => elm.from === icao ? acc : [...acc, elm], []) : [];
            return (
              <TimelineItem key={i}>
                <TimelineOppositeContent
                  sx={{
                    minWidth: 50,
                    fontSize: '1.2em',
                    marginTop: '-4px'
                  }}
                >
                  <Link href="#" onClick={evt => {evt.preventDefault(); props.actions.current.goTo(icao) }}>{icao}</Link>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    color={
                      (
                          i < focus.icaos.length-1
                        &&
                          (
                              (
                                  focus.cargos[i].TripOnly.length
                                &&
                                  focus.cargos[i].TripOnly.reduce((acc, cargo) => acc && cargo.from !== icao, true)
                              )
                            ||
                              (
                                  !focus.cargos[i].TripOnly.length
                                &&
                                  !focus.cargos[i].VIP.length
                              )
                          )
                      ) ? 'grey' : 'primary'
                    }
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ flex: 10 }}>
                  { i === 0 &&
                    <React.Fragment>
                      { focus.reg ?
                          <React.Fragment>
                            <Typography variant="body2">Rent {focus.reg} {focus.rentalType} ({focus.plane.model})</Typography>
                            <Typography variant="body2">Flight total bonus : ${focus.b}</Typography>
                          </React.Fragment>
                        :
                          <React.Fragment>
                            <Typography variant="body2">Rent {focus.plane.model} ({focus.rentalType})</Typography>
                            <Typography variant="body2">Flight total bonus : ${focus.b}</Typography>
                          </React.Fragment>
                      }
                      <Typography variant="body2" paragraph>Fuel usage : {focus.fuel} gallons</Typography>
                    </React.Fragment>
                  }
                  {i < focus.icaos.length-1 && focus.cargos[i].TripOnly.length > 0 &&
                    <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
                      {focus.cargos[i].TripOnly.map((cargo, j) =>
                      cargo.from === icao
                        ? cargo.pax
                          ? <Typography variant="body2" key={j}>{cargo.pax} passenger{cargo.pax > 1 ? 's' : ''} to {cargo.to} (${cargo.pay})</Typography>
                          : <Typography variant="body2" key={j}>{cargo.kg} kg to {cargo.to} (${cargo.pay})</Typography>
                        : null
                      )}
                      { onboard.length > 0 && <Typography variant="body2"><i>{textTotalCargo(onboard, false)} already onboard</i></Typography> }
                      <Typography variant="body2" sx={{ mt: 1 }}><b>Total:</b> {textTotalCargo(focus.cargos[i].TripOnly)}</Typography>
                      <AddToFlight
                        style={{ marginTop: 8 }}
                        ids={Object.values(focus.cargos[i].TripOnly).map(job => job.id)}
                        variant="text"
                        size="small"
                        btnSx={{ lineHeight: 1, textAlign: 'left' }}
                        defaultGroup={defaultAddToGroup}
                        onGroupChange={g => setDefaultAddToGroup(g)}
                        onSubmit={(evt) => {
                          for (const j of focus.cargos[i].TripOnly) {
                            props.actions.current.addToFlight(j.from, j.to, j.id);
                          }
                        }}
                      />
                    </Paper>
                  }
                  {i < focus.icaos.length-1 && focus.cargos[i].VIP.length > 0 &&
                    <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
                      {focus.cargos[i].VIP.map((cargo, j) =>
                      cargo.pax ?
                          <Typography variant="body2" key={j}>{cargo.pax} VIP passenger{cargo.pax > 1 ? 's' : ''} to {cargo.to} (${cargo.pay})</Typography>
                        :
                          <Typography variant="body2" key={j}>{cargo.kg} kg VIP to {cargo.to} (${cargo.pay})</Typography>
                      )}
                      <Typography variant="body2" sx={{ mt: 1 }}><b>Total:</b> {textTotalCargo(focus.cargos[i].VIP)}</Typography>
                      <AddToFlight
                        style={{ marginTop: 8 }}
                        ids={Object.values(focus.cargos[i].VIP).map(job => job.id)}
                        variant="text"
                        size="small"
                        btnSx={{ lineHeight: 1, textAlign: 'left' }}
                        defaultGroup={defaultAddToGroup}
                        onGroupChange={g => setDefaultAddToGroup(g)}
                        onSubmit={(evt) => {
                          for (const j of focus.cargos[i].VIP) {
                            props.actions.current.addToFlight(j.from, j.to, j.id);
                          }
                        }}
                      />
                    </Paper>
                  }
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </Box>
    </React.Fragment>

  );
}

export default Result;
