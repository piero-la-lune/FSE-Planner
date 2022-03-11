import React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Link from '@mui/material/Link';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FlightIcon from '@mui/icons-material/Flight';
import LinearProgress from '@mui/material/LinearProgress';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';

import { getDistance, convertDistance, getBounds } from "geolib";
import { pdf } from '@react-pdf/renderer';

import RoutingWorker from './routing.worker.js';
import PDFRoute from './PDFRoute.js';
import AddToFlight from './Table/AddToFlight.js';
import { hideAirport, Plane } from "./util/utility.js";
import log from "./util/logger.js";

import aircrafts from "./data/aircraft.json";

const styles = {
  content: {
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarWidth: "thin",
    background: "#fff"
  },
  icon: {
    marginRight: 0.2
  },
  gridText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  formLabel: {
    marginBottom: 1.5,
    marginTop: 3
  },
  tlGridText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  filtersInput: {
    width: "100%",
    mb: 1
  },
  focusAction: {
    margin: '16px 6px 0 6px'
  },
  searchOption: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden'
  },
  searchInfos: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 2,
    overflow: 'hidden',
  },
  searchLocation: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#aaa'
  },
  searchName: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  searchIcao: {
    minWidth: 40,
    textAlign: 'center'
  }
};

const filter = createFilterOptions({limit: 5});
const PopperMy = function (props) {
  return (<Popper {...props} style={{ width: 400 }} placement='bottom-start' />)
}


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
  return text.join(' and ');
}

function filterText(sortBy, result) {
  switch(sortBy) {
    case 'payNM': return '$'+Math.round(result.payNM)+'/NM';
    case 'payLeg': return '$'+Math.round(result.payLeg)+'/leg';
    case 'payTime': return '$'+Math.round(result.payTime)+'/H';
    case 'pay': return '';
    default: return '$'+result.b+' bonus';
  }
}

const Results = React.memo(({results, showDetail, goTo, setRoute, nbDisplay, sortBy}) => {
  return (
    results.slice(0, nbDisplay).map(result =>
      <Box
        sx={{
          padding: 3,
          borderBottom: "1px solid #eee",
          cursor: "pointer",
          "&:hover": {
            background: "#f9f9f9"
          },
          position: "relative"
        }}
        key={result.id}
        onClick={() => showDetail(result)}
        onMouseEnter={() => setRoute(result)}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{
            '& .MuiBreadcrumbs-separator': {
              marginLeft: '1px',
              marginRight: '1px'
            }
          }}
          maxItems={5}
          itemsBeforeCollapse={3}
        >
          {result.icaos.map((icao, i) =>
            <Link
              href="#"
              onClick={evt => {
                evt.stopPropagation();
                evt.preventDefault();
                goTo(icao)
              }}
              key={i}
            >{icao}</Link>
          )}
        </Breadcrumbs>
        <Grid container spacing={1} sx={{ mt: 1, ml: -2 }}>
          <Grid item xs={4}>
            <Typography variant="body2" sx={styles.gridText}><AttachMoneyIcon sx={styles.icon} />{result.pay}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" sx={styles.gridText}><SettingsEthernetIcon sx={styles.icon} />{result.distance} NM</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" sx={styles.gridText}><AccessTimeIcon sx={styles.icon} />{result.time}</Typography>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#aaa",
            fontSize: "0.8em"
          }}
        >
          {filterText(sortBy, result)}
        </Typography>
      </Box>
    )
  );
});


const Routing = React.memo((props) => {
  const results = React.useRef(null);
  const resultsScroll = React.useRef(0);
  const resultsDiv = React.useRef(null);
  const [filteredResults, setFilteredResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [nbResults, setNbResults] = React.useState(0);
  const [moreSettings, setMoreSettings] = React.useState(false);
  const [maxPax, setMaxPax] = React.useState('');
  const [maxKg, setMaxKg] = React.useState('');
  const [speed, setSpeed] = React.useState(250);
  const [consumption, setConsumption] = React.useState(60);
  const [range, setRange] = React.useState(1800);
  const [fuelType, setFuelType] = React.useState(1);
  const [rentFee, setRentFee] = React.useState(0);
  const [rentType, setRentType] = React.useState('dry');
  const [fromIcao, setFromIcao] = React.useState(null);
  const [fromIcaoInput, setFromIcaoInput] = React.useState('');
  const [toIcao, setToIcao] = React.useState(null);
  const [toIcaoInput, setToIcaoInput] = React.useState('');
  const [maxHops, setMaxHops] = React.useState(props.options.settings.routeFinder.maxHops);
  const [maxStops, setMaxStops] = React.useState(props.options.settings.routeFinder.maxStops);
  const [idleTime, setIdleTime] = React.useState(props.options.settings.routeFinder.idleTime);
  const [fees, setFees] = React.useState(props.options.settings.routeFinder.fees.length ? props.options.settings.routeFinder.fees : ['No']);
  const [overheadLength, setOverheadLength] = React.useState(props.options.settings.routeFinder.overheadLength);
  const [approachLength, setApproachLength] = React.useState(props.options.settings.routeFinder.approachLength);
  const [memory, setMemory] = React.useState(props.options.settings.routeFinder.memory);
  const [vipOnly, setVipOnly] = React.useState(false);
  const [loop, setLoop] = React.useState(false);
  const [type, setType] = React.useState('rent');
  const [minLoad, setMinLoad] = React.useState(props.options.settings.routeFinder.minLoad);
  const [maxBadLegs, setMaxBadLegs] = React.useState(props.options.settings.routeFinder.maxBadLegs);
  const [maxEmptyLeg, setMaxEmptyLeg] = React.useState(props.options.settings.routeFinder.maxEmptyLeg);
  const [sortBy, setSortBy] = React.useState('payTime');
  const [focus, setFocus] = React.useState(null);
  const [filterMenu, setFilterMenu] = React.useState(null);
  const [minDist, setMinDist] = React.useState('');
  const [maxDist, setMaxDist] = React.useState('');
  const [minPay, setMinPay] = React.useState('');
  const [maxPay, setMaxPay] = React.useState('');
  const [minTime, setMinTime] = React.useState('');
  const [maxTime, setMaxTime] = React.useState('');
  const [filterIcaos, setFilterIcaos] = React.useState([]);
  const [filterIcaosInput, setFilterIcaosInput] = React.useState('');
  const [nbDisplay, setNbDisplay] = React.useState(20);
  const [progress, setProgress] = React.useState(0);
  const [cancel, setCancel] = React.useState(null);
  const [availableModels, setAvailableModels] = React.useState([]);
  const [aircraftModels, setAircraftModels] = React.useState([]);
  const [aircraftSpecsModel, setAircraftSpecsModel] = React.useState(null);
  const [editSpecs, setEditSpecs] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [defaultAddToGroup, setDefaultAddToGroup] = React.useState(null);
  const icaodataArr = React.useMemo(() => Object.values(props.options.icaodata), [props.options.icaodata]);

  const sortFunctions = {
    payNM: (a, b) => b.payNM - a.payNM,
    payLeg: (a, b) => b.payLeg - a.payLeg,
    payTime: (a, b) => b.payTime - a.payTime,
    pay: (a, b) => b.pay - a.pay,
    bonus: (a, b) => b.b - a.b,
  }

  const changeSortBy = (evt) => {
    setSortBy(evt.target.value);
    if (results.current !== null) {
      filteredResults.sort(sortFunctions[evt.target.value]);
      setFilteredResults([...filteredResults]);
    }
  }
  const filterResults = () => {
    if (results.current !== null) {
      let minTimeNb = null;
      let maxTimeNb = null;
      if (minTime) {
        const t = minTime.split(':');
        if (t.length === 2) {
          minTimeNb = parseInt(t[0]) + parseInt(t[1])/60;
        }
        else {
          setMinTime('');
        }
      }
      if (maxTime) {
        const t = maxTime.split(':');
        if (t.length === 2) {
          maxTimeNb = parseInt(t[0]) + parseInt(t[1])/60;
        }
        else {
          setMaxTime('');
        }
      }

      const r = results.current.filter(elm => {
        return !(
             (minDist && elm.distance < minDist)
          || (maxDist && elm.distance > maxDist)
          || (minPay && elm.pay < minPay)
          || (maxPay && elm.pay > maxPay)
          || (minTimeNb && elm.timeNb < minTimeNb)
          || (maxTimeNb && elm.timeNb > maxTimeNb)
          || (filterIcaos.length && !filterIcaos.every(x => elm.icaos.includes(x.icao)))
        );
      })
      r.sort(sortFunctions[sortBy]);
      setFilteredResults(r);
      setFilterMenu(null);
    }
  }

  const setRoute = props.setRoute;
  const showDetail = React.useCallback((result) => {
    resultsScroll.current = resultsDiv.current.scrollTop;
    setFocus(result);
    setRoute(result);
    // Center map on route
    const b = getBounds(result.icaos.map(elm => props.options.icaodata[elm]));
    props.mapRef.current.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]]);
  }, [props.options.icaodata, props.mapRef, setRoute]);

  // Scroll back to previous position when returning to results list
  React.useEffect(() => {
    if (focus === null && resultsDiv.current) {
      resultsDiv.current.scrollTo(0, resultsScroll.current);
    }
  }, [focus]);

  // Scroll to top when filtering / changing sortby of results
  React.useEffect(() => {
    if (resultsDiv.current) {
      resultsDiv.current.scrollTo(0 ,0);
      setNbDisplay(20);
    }
  }, [filteredResults]);

  // Update list of available aircraft models
  React.useEffect(() => {
    // Build a list of all available aircraft models
    const set = new Set();
    for (const icao of Object.keys(props.options.planes)) {
      for (const p of props.options.planes[icao]) {
        set.add(p.model);
      }
    }
    setAvailableModels([...set].sort());
    setAircraftModels((oldAircraftModels) => oldAircraftModels.filter(elm => set.has(elm)));
  }, [props.options.planes]);

  const prepResults = (allResults, planesSpecs) => {
    const approachSpeedRatio = 0.4;
    for (var i = 0; i < allResults.length; i++) {
      const plane = planesSpecs[allResults[i].model];
      const totalDistance =
          allResults[i].distance
        + allResults[i].distance * overheadLength / 100
        + approachLength*(allResults[i].icaos.length-1);
      let time =
          allResults[i].distance/plane.speed
        + allResults[i].distance * overheadLength / 100 / plane.speed
        + approachLength*(allResults[i].icaos.length-1)/(plane.speed*approachSpeedRatio);
      // Compute fuel usage
      let fuelUsage = time * plane.GPH;
      let fuelCost = fuelUsage * (plane.fuelType === 1 ? 4.19 : 4.55);
      // Idle time at airport, added later because does not count for fuel usage
      time += (idleTime / 60)*(allResults[i].icaos.length-1);
      const h = Math.floor(time);
      const min = Math.floor((time-h)*60);
      const grossPay = allResults[i].pay;
      let pay = allResults[i].pay;

      // Compute ground fees: 10% for each assignment
      // (could be 0 or 5% if there is no FBO at the originating or destination airport,
      // but there is no way of knowing if that is the case, so 10% is always applied)
      const feeGround = pay*0.1;
      if (fees.includes('Ground')) {
        pay -= feeGround;
      }

      // Compute booking fees : X%, where X is the number of PT assignments loaded in the
      // plane (0 if less than 5 assignments)
      let feeBooking = 0;
      // Used to store previous fees, because we apply the highest fee of all hops
      // that the assignment has traveled
      const feeHistory = {};
      for (var j = 0; j < allResults[i].icaos.length-1; j++) {
        if (!allResults[i].cargos[j].TripOnly.length) { continue; }
        // Compute the number of PT assignments in aircraft
        let nbPT = allResults[i].cargos[j].TripOnly.reduce((acc, c) => acc + (c.PT ? 1 : 0), 0);
        // No fee if less than 5 assignments
        if (nbPT <= 5) { nbPT = 0; }
        for (const c of allResults[i].cargos[j].TripOnly) {
          if (c.PT) {
            const key = c.from+'-'+c.to;
            if (!feeHistory[key]) { feeHistory[key] = 0; }
            feeHistory[key] = Math.max(feeHistory[key], nbPT);
            // The assignment has reached is destination, get the highest fee and apply it
            if (c.to === allResults[i].icaos[j+1]) {
              feeBooking += c.pay * feeHistory[key] / 100;
            }
          }
        }
        // Ensure to clean fee history for the current destination
        for (const key of Object.keys(feeHistory)) {
          if (key.endsWith(allResults[i].icaos[j+1])) {
            delete feeHistory[key];
          }
        }
      }
      if (fees.includes('Booking')) {
        pay -= feeBooking;
      }

      // Get plane reg, and compute rental cost and bonus
      let planeReg = null;
      let planeId = null;
      let rentalType = 'dry';
      let rentalCost = 0;
      let bonus = 0;
      if (type === 'rent') {
        let lowestCost = null;
        const startIcao = allResults[i].icaos[0];
        const endIcao = allResults[i].icaos[allResults[i].icaos.length-1];
        for (const p of props.options.planes[allResults[i].icaos[0]]) {
          if (p.model !== plane.model) { continue; }
          let cost = null;
          let t = null;
          let b = 0;
          if (p.dry) {
            cost = p.dry * time + fuelCost;
            t = 'dry';
          }
          if (p.wet && (!cost || p.wet * time < cost)) {
            cost = p.wet * time;
            t = 'wet';
          }
          // Wet and dry price set to 0 = owned plane => we use this
          if (!cost) {
            cost = 0;
            t = 'dry';
          }
          else {
            // Compute bonus
            b = Math.round(
              (
                  convertDistance(getDistance(props.options.icaodata[endIcao], props.options.icaodata[p.home]), 'sm')
                -
                  convertDistance(getDistance(props.options.icaodata[startIcao], props.options.icaodata[p.home]), 'sm')
              )
              * p.bonus / 100);
            cost += b;
          }
          if (!lowestCost || cost < lowestCost) {
            planeReg = p.reg;
            planeId = p.id;
            lowestCost = cost;
            rentalCost = p[t] * time;
            rentalType = t;
            bonus = -b;
          }
        }
      }
      else {
        rentalType = rentType;
        rentalCost = rentFee * time;
      }
      // Subtract rental cost and bonus to total pay
      if (fees.includes('Rental')) {
        pay -= rentalCost - bonus;
      }
      // Subtract fuel usage to total pay
      if (fees.includes('Fuel') && rentalType !== 'wet') {
        pay -= fuelCost;
      }

      // If rental is wet, no fuel cost
      if (rentalType === 'wet') {
        fuelCost = 0;
      }

      allResults[i].payNM = pay/totalDistance;
      allResults[i].payLeg = pay/allResults[i].icaos.length;
      allResults[i].payTime = pay/time;
      allResults[i].time = h+'H'+(min > 9 ? min : "0"+min);
      allResults[i].timeNb = time;
      allResults[i].pay = Math.round(pay);
      allResults[i].distance = Math.round(totalDistance);
      allResults[i].id = i;
      allResults[i].fuel = Math.ceil(fuelUsage);
      allResults[i].reg = planeReg;
      allResults[i].planeId = planeId;
      allResults[i].rentalType = rentalType;
      allResults[i].b = Math.round(bonus);
      allResults[i].grossPay = grossPay;
      allResults[i].feeGround = Math.ceil(feeGround);
      allResults[i].feeBooking = Math.ceil(feeBooking);
      allResults[i].rentalCost = Math.ceil(rentalCost);
      allResults[i].fuelCost = Math.ceil(fuelCost);
      allResults[i].plane = plane;
    }
    allResults.sort(sortFunctions[sortBy]);

    results.current = allResults;
    filterResults();
    setLoading(false);
    setCancel(null);
  }

  const startSearch = () => {
    setProgress(0);
    setLoading(true);
    setNbResults(0);
    results.current = null;

    // Check ICAO if free mode
    if (type === 'free') {
      if (!props.options.icaodata[fromIcao]) {
        alert('Invalid departing ICAO');
        setLoading(false);
        return false;
      }
      if (toIcao && !props.options.icaodata[toIcao]) {
        alert('Invalid destination ICAO');
        setLoading(false);
        return false;
      }
    }

    // Job src
    const src = {};
    const addIcao = function(icao) {
      if (!src[icao]) {
        src[icao] = {
          c: [props.options.icaodata[icao].lon, props.options.icaodata[icao].lat],
          r: []
        }
      }
    }

    // Compute aircraft specifications
    let planeMaxKg = maxKg;
    let planeMaxPax = maxPax;
    let planesSpecs = {};
    if (type === "rent") {
      planeMaxKg = 0;
      planeMaxPax = 0;
      // Go through every available planes, to build an objetc
      // with the specifications of all plane models available
      for (const model of aircraftModels.length ? aircraftModels : availableModels) {
        planesSpecs[model] = new Plane(model);
        planeMaxKg = Math.max(planeMaxKg, planesSpecs[model].maxKg);
        planeMaxPax = Math.max(planeMaxPax, planesSpecs[model].maxPax);
      }
    }
    else {
      planesSpecs['free'] = new Plane(aircraftSpecsModel, {
        maxPax: maxPax,
        maxKg: maxKg,
        speed: speed,
        GPH: consumption,
        fuelType: fuelType,
        range: range
      });
    }

    // List of start points
    const icaos = [];
    if (type === "rent") {
      for (const icao of Object.keys(props.options.planes)) {
        if (hideAirport(icao, props.options.settings.airport, props.options.settings.display.sim)) { continue; }
        for (const p of props.options.planes[icao]) {
          if (!aircraftModels.length || aircraftModels.includes(p.model)) {
            icaos.push(icao);
            addIcao(icao);
            break;
          }
        }
      }
    }
    else {
      icaos.push(fromIcao);
      addIcao(fromIcao);
    }
    const total = icaos.length;

    // Compute jobs matching airplane specs
    for (const k of [...new Set([...Object.keys(props.options.jobs), ...Object.keys(props.options.flight)])]) {
      const [fr, to] = k.split('-');
      if (hideAirport(fr, props.options.settings.airport, props.options.settings.display.sim)) { continue; }
      if (hideAirport(to, props.options.settings.airport, props.options.settings.display.sim)) { continue; }
      const obj = {
        cargos: {
          TripOnly: [],
          VIP: []
        },
        distance: props.options.jobs[k] ? props.options.jobs[k].distance : props.options.flight[k].distance,
        direction: props.options.jobs[k] ? props.options.jobs[k].direction : props.options.flight[k].direction,
      }
      const append = (v, obj) => {
        if (v['Trip-Only'] && !vipOnly) {
          for (const c of v['Trip-Only']) {
            if (c.kg > planeMaxKg || c.pax > planeMaxPax) { continue; }
            obj.cargos.TripOnly.push({from: fr, to: to, ...c});
          }
        }
        if (v['VIP']) {
          for (const c of v['VIP']) {
            if (c.kg > planeMaxKg || c.pax > planeMaxPax) { continue; }
            obj.cargos.VIP.push({from: fr, to: to, ...c});
          }
        }
      }
      if (props.options.jobs[k]) {
        append(props.options.jobs[k], obj);
      }
      if (props.options.flight[k]) {
        append(props.options.flight[k], obj);
      }
      if (obj.cargos.TripOnly || obj.cargos.VIP) {
        // Add jobs departing from ICAO
        addIcao(fr);
        if (!src[fr].j) { src[fr].j = new Map(); }
        src[fr].j.set(to, obj);
        // Set reverse leg
        addIcao(to);
        src[to].r.push(fr);
      }
    }

    let maxWorkers = navigator.hardwareConcurrency || 4;
    if (memory === 'vlow') { maxWorkers = Math.min(maxWorkers, 2); }
    if (memory === 'low') { maxWorkers = Math.min(maxWorkers, 4); }
    let done = 0;
    let allResults = [];
    let resultLimit = 0;
    switch (memory) {
      case 'vlow':
        resultLimit = 500;
        break;
      case 'low':
        resultLimit = 5000;
        break;
      case 'normal':
        resultLimit = 50000;
        break;
      case 'high':
        resultLimit = 500000;
        break;
      default:
        break;
    }
    if (resultLimit) {
      resultLimit = Math.round(resultLimit/Math.min(total, maxWorkers));
    }

    const execute = (worker, icao) => {
      let model = 'free';
      // If renting a plane, consider the plane with the largest capacity in Kg available
      if (type === 'rent') {
        for (const p of props.options.planes[icao]) {
          if (!planesSpecs[p.model]) { continue; }
          if (model === 'free' || planesSpecs[p.model].maxKg > planesSpecs[model].maxKg) {
            model = p.model;
          }
        }
      }
      worker.postMessage({
        fromIcao: icao,
        toIcao: type === 'rent' ? (loop ? icao : null) : (toIcao ? toIcao : null),
        src: src,
        options: {
          maxKg: planesSpecs[model].maxKg,
          maxPax: planesSpecs[model].maxPax,
          minPaxLoad: planesSpecs[model].maxPax*minLoad/100,
          minKgLoad: planesSpecs[model].maxKg*minLoad/100,
          range: planesSpecs[model].range,
          maxStops: maxStops,
          maxEmptyLeg: maxEmptyLeg,
          model: model,
          resultLimit: resultLimit
        },
        maxHops: maxHops,
        maxBadLegs: maxBadLegs
      });
    };
    const onmessage = ({data}, worker) => {
      if (data.status === 'finished') {
        allResults = allResults.concat(data.results);
        setNbResults(allResults.length);
        done += 1;
        const icao = icaos.pop();
        if (icao) {
          execute(worker, icao);
        }
        else {
          worker.terminate();
          if (done >= total) {
            prepResults(allResults, planesSpecs);
          }
        }
      }
      else if (data.status === 'progress') {
        setProgress(prev => prev + (data.progress/total));
      }
      else {
        console.log(data);
      }
    };
    log.info("Executing Route Finder", {
      type: type,
      loop: loop,
      fromIcao: fromIcao,
      toIcao: toIcao,
      src: src,
      planesSpecs: planesSpecs,
      maxStops: maxStops,
      maxEmptyLeg: maxEmptyLeg,
      maxHops: maxHops,
      maxBadLegs: maxBadLegs
    });
    const workers = [];
    for (var i = 0; i < maxWorkers; i++) {
      const worker = new RoutingWorker();
      worker.onmessage = (evt) => onmessage(evt, worker);
      let icao = icaos.pop();
      if (!icao) { break; }
      execute(worker, icao);
      workers.push(worker);
    }
    setCancel(workers);

  };

  const cancelWorkers = () => {
    for (const worker of cancel) {
      worker.terminate();
    }
    setLoading(false);
    setCancel(null);
  }

  if (props.hidden) { return null; }

  return (
    <Box
      sx={{
        width: 400,
        background: "#eee",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          my: 3,
          mx: 2,
          fontWeight: 300,
          position: "relative"
        }}
      >
        Route finder
        <IconButton
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            color: 'grey[500]',
          }}
          onClick={props.close}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </Typography>

      {filteredResults ?

        focus ?

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

            <Box sx={styles.content}>
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
                          icaodata={props.options.icaodata}
                          routeParams={{
                            idleTime: idleTime,
                            overheadLength: overheadLength,
                            approachLength: approachLength
                          }}
                          settings={props.options.settings}
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
                  ids={(() => {
                    const ids = new Set();
                    for (const leg of focus.cargos) {
                      for (const jobs of Object.values(leg)) {
                        for (const job of jobs) {
                          ids.add(job.id);
                        }
                      }
                    }
                    return [...ids];
                  })()}
                  variant="hidden"
                  defaultGroup={defaultAddToGroup}
                >
                  <Tooltip title={'Add all assignments to ' + (defaultAddToGroup ? defaultAddToGroup[0] : 'My Flight')}>
                    <IconButton
                      size="large"
                      type="submit"
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
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
                    <input type="hidden" name="returnpage" value="/myflight_v2.jsp" />
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
                            { focus.reg &&
                              <React.Fragment>
                                <Typography variant="body2">Rent {focus.reg} {focus.rentalType} ({focus.plane.model})</Typography>
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

        :

          <React.Fragment>
            <Box
              sx={{
                background: "#fff",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Box
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  "&:hover": {
                    background: "#f9f9f9"
                  }
                }}
                onClick={() => {
                  setFilteredResults(null);
                  props.setRoute(null);
                  results.current = null;
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 0.8,
                    textAlign: "center",
                    py: 2,
                    px: 1.5
                  }}
                >
                  <ArrowBackIcon /><br />New search
                </Typography>
              </Box>
              <Box sx={{ py: 2, px: 1 }}>
                <Button
                  variant="contained"
                  onClick={(evt) => setFilterMenu(evt.currentTarget)}
                  startIcon={<FilterListIcon />}
                >
                  Filters
                </Button>
                <Popover
                  anchorEl={filterMenu}
                  keepMounted
                  open={Boolean(filterMenu)}
                  onClose={() => setFilterMenu(null)}
                  sx={{
                    '& .MuiPaper-root': {
                      maxWidth: 300,
                      py: 1,
                      px: 2
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 2 }}>Route filters:</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min distance"
                        variant="outlined"
                        value={minDist}
                        onChange={(evt) => setMinDist(evt.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        size="small"
                        sx={styles.filtersInput}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max distance"
                        variant="outlined"
                        value={maxDist}
                        onChange={(evt) => setMaxDist(evt.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        size="small"
                        sx={styles.filtersInput}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Min duration"
                        variant="outlined"
                        value={minTime}
                        placeholder="1:30"
                        onChange={(evt) => {
                          const val = evt.target.value;
                          if (val.match(/^[0-9:]*$/g)) {
                            setMinTime(val);
                          }
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        size="small"
                        sx={styles.filtersInput}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max duration"
                        variant="outlined"
                        value={maxTime}
                        placeholder="6:30"
                        onChange={(evt) => {
                          const val = evt.target.value;
                          if (val.match(/^[0-9:]*$/g)) {
                            setMaxTime(val);
                          }
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        size="small"
                        sx={styles.filtersInput}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Min pay"
                        variant="outlined"
                        value={minPay}
                        onChange={(evt) => setMinPay(evt.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        size="small"
                        sx={styles.filtersInput}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max pay"
                        variant="outlined"
                        value={maxPay}
                        onChange={(evt) => setMaxPay(evt.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        size="small"
                        sx={styles.filtersInput}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        options={icaodataArr}
                        getOptionLabel={(a) => a.icao ? a.icao : ''}
                        renderOption={(props, a) =>
                          <li {...props}>
                            <Box component="span" sx={styles.searchOption}>
                              <Box component="b" sx={styles.searchIcao}>{a.icao}</Box>
                              <Box component="span" sx={styles.searchInfos}>
                                <Box component="span" sx={styles.searchName}>{a.name}</Box>
                                <Typography variant="caption" sx={styles.searchLocation}>{a.city}, {a.state ? a.state+', ' : ''}{a.country}</Typography>
                              </Box>
                            </Box>
                          </li>
                        }
                        filterOptions={(options, params) => {
                          // Search for ICAO
                          let filtered = filter(options, { inputValue: filterIcaosInput, getOptionLabel: (a) => a.icao });
                          // If not enough results, search for city name
                          if (filtered.length < 5) {
                            const add = filter(options, { inputValue: filterIcaosInput, getOptionLabel: (a) => a.name });
                            filtered = filtered.concat(add.slice(0, 5-filtered.length));
                          }
                          return filtered;
                        }}
                        renderInput={(params) =>
                          <TextField
                            {...params}
                            label="Include ICAO(s)"
                            variant="outlined"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            size="small"
                            sx={styles.filtersInput}
                          />
                        }
                        PopperComponent={PopperMy}
                        onChange={(evt, value) => {
                          setFilterIcaos(value);
                        }}
                        value={filterIcaos}
                        inputValue={filterIcaosInput}
                        onInputChange={(evt, value) => setFilterIcaosInput(value)}
                        autoHighlight={true}
                        selectOnFocus={false}
                        multiple
                      />
                    </Grid>
                  </Grid>
                  <Button variant="contained" color="primary" onClick={filterResults} sx={{ mt: 1 }}>Apply</Button>
                </Popover>
              </Box>
              <Box sx={{ py: 2, px: 1 }}>
                <TextField
                  value={sortBy}
                  onChange={changeSortBy}
                  label="Sort by"
                  variant="outlined"
                  size="small"
                  select
                  sx={{
                    width: 150,
                    fontSize: "0.8em"
                  }}
                  InputProps={{style:{fontSize:"1em"}}}
                  InputLabelProps={{style:{fontSize:"1em"}}}
                >
                  <MenuItem value="payNM">Pay per NM</MenuItem>
                  <MenuItem value="payLeg">Pay per leg</MenuItem>
                  <MenuItem value="payTime">Pay per flight time</MenuItem>
                  <MenuItem value="pay">Total pay</MenuItem>
                  {type === "rent" && <MenuItem value="bonus">Plane bonus</MenuItem>}
                </TextField>
              </Box>
            </Box>
            <Box
              sx={{
                background: "#fff",
                borderBottom: "1px solid #eee",
                padding: 1
              }}
            >
              {
                filteredResults.length > 0 ?
                  <Typography variant="body2">{filteredResults.length} routes found.</Typography>
                :
                  <Typography variant="body2">No route found.</Typography>
              }
            </Box>
            <Box
              ref={resultsDiv}
              sx={styles.content}
              onScroll={() => {
                if (resultsDiv.current.scrollHeight - resultsDiv.current.scrollTop - resultsDiv.current.clientHeight < 400 && nbDisplay < filteredResults.length) {
                  setNbDisplay(nbDisplay + 20);
                }
              }}
            >
              <Results
                results={filteredResults}
                showDetail={showDetail}
                goTo={props.actions.current.goTo}
                setRoute={props.setRoute}
                nbDisplay={nbDisplay}
                sortBy={sortBy}
              />
            </Box>
          </React.Fragment>

      :

        <Box sx={{ ...styles.content, ...{ p: 2 }}}>

          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(evt, newType) => {
              if (newType !== null) {
                setType(newType);
                if (newType !== 'rent' && sortBy === 'bonus') {
                  setSortBy('payTime');
                }
              }
            }}
            sx={{
              marginBottom: 1,
              marginTop: 2,
              width: '100%'
            }}
          >
            <ToggleButton value="rent" style={{flexGrow:1}}>Available planes</ToggleButton>
            <ToggleButton value="free" style={{flexGrow:1}}>Free search</ToggleButton>
          </ToggleButtonGroup>

          { type === "rent" ?
            <React.Fragment>
              {availableModels.length ?
                <Autocomplete
                  multiple
                  options={availableModels}
                  onChange={(evt, value) => setAircraftModels(value)}
                  limitTags={2}
                  value={aircraftModels}
                  renderInput={(params) =>
                    <TextField
                      {...params}
                      label='Aircraft model(s)'
                      variant='outlined'
                      helperText='Leave empty for all available models'
                      sx={styles.formLabel}
                    />
                  }
                />
              :
                <Alert severity="error" sx={styles.formLabel}>You first need to load planes.</Alert>
              }
              <FormControlLabel
                control={<Switch checked={loop} onChange={(evt) => setLoop(evt.target.checked)} />}
                label="Return plane to starting airport"
                sx={styles.formLabel}
              />
            </React.Fragment>
          :
            <React.Fragment>
              <Typography variant="body1" sx={styles.formLabel}>Restrict search to specific route:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Autocomplete
                    options={icaodataArr}
                    getOptionLabel={(a) => a.icao ? a.icao : ''}
                    renderOption={(props, a) =>
                      <li {...props}>
                        <Box component="span" sx={styles.searchOption}>
                          <Box component="b" sx={styles.searchIcao}>{a.icao}</Box>
                          <Box component="span" sx={styles.searchInfos}>
                            <Box component="span" sx={styles.searchName}>{a.name}</Box>
                            <Typography variant="caption" sx={styles.searchLocation}>{a.city}, {a.state ? a.state+', ' : ''}{a.country}</Typography>
                          </Box>
                        </Box>
                      </li>
                    }
                    filterOptions={(options, params) => {
                      // Search for ICAO
                      let filtered = filter(options, { inputValue: fromIcaoInput, getOptionLabel: (a) => a.icao });
                      // If not enough results, search for city name
                      if (filtered.length < 5) {
                        const add = filter(options, { inputValue: fromIcaoInput, getOptionLabel: (a) => a.name });
                        filtered = filtered.concat(add.slice(0, 5-filtered.length));
                      }
                      return filtered;
                    }}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="From"
                        variant="outlined"
                        placeholder="ICAO"
                        required
                      />
                    }
                    PopperComponent={PopperMy}
                    onChange={(evt, value) => {
                      if (value) {
                        setFromIcao(value.icao);
                      }
                      else {
                        setFromIcao(null);
                      }
                    }}
                    value={fromIcao ? props.options.icaodata[fromIcao] : null}
                    inputValue={fromIcaoInput}
                    onInputChange={(evt, value) => setFromIcaoInput(value)}
                    autoHighlight={true}
                    autoSelect={true}
                    selectOnFocus={false}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    options={icaodataArr}
                    getOptionLabel={(a) => a.icao ? a.icao : ''}
                    renderOption={(props, a) =>
                      <li {...props}>
                        <Box component="span" sx={styles.searchOption}>
                          <Box component="b" sx={styles.searchIcao}>{a.icao}</Box>
                          <Box component="span" sx={styles.searchInfos}>
                            <Box component="span" sx={styles.searchName}>{a.name}</Box>
                            <Typography variant="caption" sx={styles.searchLocation}>{a.city}, {a.state ? a.state+', ' : ''}{a.country}</Typography>
                          </Box>
                        </Box>
                      </li>
                    }
                    filterOptions={(options, params) => {
                      // Search for ICAO
                      let filtered = filter(options, { inputValue: toIcaoInput, getOptionLabel: (a) => a.icao });
                      // If not enough results, search for city name
                      if (filtered.length < 5) {
                        const add = filter(options, { inputValue: toIcaoInput, getOptionLabel: (a) => a.name });
                        filtered = filtered.concat(add.slice(0, 5-filtered.length));
                      }
                      return filtered;
                    }}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="To"
                        variant="outlined"
                        placeholder="ICAO"
                      />
                    }
                    PopperComponent={PopperMy}
                    onChange={(evt, value) => {
                      if (value) {
                        setToIcao(value.icao);
                      }
                      else {
                        setToIcao(null);
                      }
                    }}
                    value={toIcao ? props.options.icaodata[toIcao] : null}
                    inputValue={toIcaoInput}
                    onInputChange={(evt, value) => setToIcaoInput(value)}
                    autoHighlight={true}
                    autoSelect={true}
                    selectOnFocus={false}
                  />
                </Grid>
              </Grid>

              { toIcao &&
                <Alert severity="info" sx={styles.formLabel}>
                  Recommended algorithm parameters when setting a destination:
                  <ul>
                    <li><i>Iterations</i>: 10 or more</li>
                    <li><i>Min plane load</i>: 20% or less</li>
                    <li><i>Max empty legs</i>: 50NM or more</li>
                  </ul>
                </Alert>
              }

              <Typography variant="body1" sx={styles.formLabel}>Aircraft specifications:</Typography>
              <Autocomplete
                options={Object.keys(aircrafts)}
                onChange={(evt, model) => {
                  if (!model || !aircrafts[model]) { return; }
                  const p = new Plane(model);
                  setMaxKg(p.maxKg);
                  setMaxPax(p.maxPax);
                  setRange(p.range);
                  setSpeed(p.speed);
                  setConsumption(p.GPH);
                  setFuelType(p.fuelType);
                  setAircraftSpecsModel(model);
                }}
                value={aircraftSpecsModel}
                renderInput={(params) =>
                  <TextField
                    {...params}
                    label='Aircraft model'
                    variant='outlined'
                    required
                  />
                }
              />

              {editSpecs ?
                <React.Fragment>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <TextField
                        label="Max passengers"
                        placeholder="10"
                        variant="outlined"
                        required
                        value={maxPax}
                        onChange={(evt) => setMaxPax(evt.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max weight"
                        variant="outlined"
                        placeholder="2000"
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                        }}
                        value={maxKg}
                        onChange={(evt) => setMaxKg(evt.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <Tooltip title="Used to compute an estimated flight duration.">
                        <TextField
                          label="Cruise speed"
                          placeholder="250"
                          variant="outlined"
                          value={speed}
                          onChange={(evt) => setSpeed(evt.target.value.replace(/[^0-9]/g, ''))}
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">kts</InputAdornment>,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Used to prevent legs longer than this distance.">
                        <TextField
                          label="Max range"
                          placeholder="1800"
                          variant="outlined"
                          value={range}
                          onChange={(evt) => setRange(evt.target.value.replace(/[^0-9]/g, ''))}
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <Tooltip title="Used to compute an estimated fuel consumption cost.">
                        <TextField
                          label="Fuel consumption"
                          placeholder="60"
                          variant="outlined"
                          value={consumption}
                          onChange={(evt) => setConsumption(evt.target.value.replace(/[^0-9]/g, ''))}
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">Gallons/Hour</InputAdornment>,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Fuel type"
                        variant="outlined"
                        value={fuelType}
                        onChange={(evt) => setFuelType(parseInt(evt.target.value))}
                        select
                        fullWidth
                      >
                        <MenuItem value="0">100LL</MenuItem>
                        <MenuItem value="1">Jet-A</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <Tooltip title="Leave it to 0 if using your own plane.">
                        <TextField
                          label="Rental price"
                          placeholder="0"
                          variant="outlined"
                          value={rentFee}
                          onChange={(evt) => setRentFee(evt.target.value.replace(/[^0-9]/g, ''))}
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">$/Hour</InputAdornment>,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Rent type"
                        variant="outlined"
                        value={rentType}
                        onChange={(evt) => setRentType(evt.target.value)}
                        select
                        fullWidth
                      >
                        <MenuItem value="dry">Dry</MenuItem>
                        <MenuItem value="wet">Wet</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </React.Fragment>
              :
                <Link href="#" onClick={(e) => { e.preventDefault(); setEditSpecs(true)}}>Edit aircraft specifications</Link>
              }
            </React.Fragment>
          }

          {!moreSettings &&
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                marginTop: 2
              }}
            >
              <Box
                component="span"
                sx={{
                  color: "#666",
                  cursor: "pointer",
                  "&:hover": {
                    color: "#000"
                  }
                }}
                onClick={() => setMoreSettings(true)}
              >
                More options...
              </Box>
            </Typography>
          }

          {moreSettings &&
            <div>

              <Typography variant="body1" sx={styles.formLabel}>Advanced algorithm parameters:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Tooltip title="Maximum algorithm iterations. The total route legs may be more than this, due to deadhead legs and on-route stops.">
                    <TextField
                      label="Iterations"
                      placeholder="5"
                      variant="outlined"
                      value={maxHops}
                      onChange={(evt) => setMaxHops(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Number of possible stops along a leg to drop passengers/cargo, in order to better fill the plane part of the leg.">
                    <TextField
                      label="Max stops"
                      variant="outlined"
                      placeholder="1"
                      value={maxStops}
                      onChange={(evt) => setMaxStops(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid container spacing={1} style={{marginTop:12}}>
                <Grid item xs={6}>
                  <Tooltip title="Try to always keep the plane at least this full.">
                    <TextField
                      label="Min plane load"
                      placeholder="80"
                      variant="outlined"
                      value={minLoad}
                      onChange={(evt) => setMinLoad(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Number of possible legs bellow the minimum plane load.">
                    <TextField
                      label="Max bad legs"
                      variant="outlined"
                      placeholder="2"
                      value={maxBadLegs}
                      onChange={(evt) => setMaxBadLegs(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid container spacing={1} style={{marginTop:12}}>
                <Grid item xs={6}>
                  <Tooltip title="Maximum length of entirely empty legs (no cargo/pax at all). Do not set this too high, it quickly becomes very computer intensive.">
                    <TextField
                      label="Max empty legs"
                      variant="outlined"
                      placeholder="2"
                      value={maxEmptyLeg}
                      onChange={(evt) => setMaxEmptyLeg(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                      }}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Adjust this setting if Route Finder is crashing">
                    <TextField
                      label="Memory usage"
                      variant="outlined"
                      value={memory}
                      onChange={(evt) => setMemory(evt.target.value)}
                      select
                      fullWidth
                    >
                      <MenuItem value="vlow">Very low</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="unlimited">No limit</MenuItem>
                    </TextField>
                  </Tooltip>
                </Grid>
              </Grid>

              <Typography variant="body1" sx={styles.formLabel}>Route parameters:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Tooltip title="Time spent on ground at each stop (flight checks, taxi, etc.)">
                    <TextField
                      label="Idle and taxi time"
                      placeholder="2"
                      variant="outlined"
                      value={idleTime}
                      onChange={(evt) => setIdleTime(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">min</InputAdornment>,
                      }}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title="Added to the leg straight distance, to account for not straight routes.">
                    <TextField
                      label="Distance overhead"
                      placeholder="0"
                      variant="outlined"
                      value={overheadLength}
                      onChange={(evt) => setOverheadLength(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid container spacing={1} style={{marginTop:12}}>
                <Grid item xs={6}>
                  <Tooltip title="Added to the leg straight distance, to account for approach circuits.">
                    <TextField
                      label="Approach distance"
                      placeholder="10"
                      variant="outlined"
                      value={approachLength}
                      onChange={(evt) => setApproachLength(evt.target.value.replace(/[^0-9]/g, ''))}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">NM</InputAdornment>,
                      }}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Net earnings"
                    variant="outlined"
                    placeholder="No"
                    value={fees}
                    onChange={(evt) => {
                      const arr = evt.target.value;
                      if (arr.length === 0) {
                        arr.push('No');
                      }
                      else {
                        const i = arr.indexOf('No');
                        if (i > -1 && arr.length > 1) {
                          arr.splice(i, 1);
                        }
                      }
                      setFees(arr);
                    }}
                    select
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => selected.join(', '),
                      MenuProps: {
                        getContentAnchorEl: null,
                      }
                    }}
                  >
                    <MenuItem value="No" style={{display:'none'}}>
                      <Checkbox checked={fees.indexOf("No") > -1} />
                      <ListItemText primary="No" />
                    </MenuItem>
                    <MenuItem value="Ground">
                      <Checkbox checked={fees.indexOf("Ground") > -1} />
                      <ListItemText primary="Ground crew fees" />
                    </MenuItem>
                    <MenuItem value="Booking">
                      <Checkbox checked={fees.indexOf("Booking") > -1} />
                      <ListItemText primary="Booking fees" />
                    </MenuItem>
                    <MenuItem value="Rental">
                      <Checkbox checked={fees.indexOf("Rental") > -1} />
                      <ListItemText primary="Rental cost & bonus" />
                    </MenuItem>
                    <MenuItem value="Fuel">
                      <Checkbox checked={fees.indexOf("Fuel") > -1} />
                      <ListItemText primary="Fuel cost" />
                    </MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Switch checked={vipOnly} onChange={(evt) => setVipOnly(evt.target.checked)} />}
                label="VIP jobs only"
                sx={styles.formLabel}
              />

            </div>
          }

          <Box
            sx={{
              marginTop: 4,
              marginBottom: 2,
              textAlign: "center"
            }}
          >
            {!loading &&
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={startSearch}
                disabled={
                  !maxHops || maxStops === '' || minLoad === '' || maxBadLegs === '' || idleTime === ''
                           || overheadLength === '' || approachLength === '' || maxEmptyLeg === ''
                           || (type === "free" && (!fromIcao || !maxPax || !maxKg || !speed || !consumption || !range || !aircraftSpecsModel))
                           || (type === "rent" && (!availableModels.length))
                }
              >
                Find best routes
              </Button>
            }
            {loading && <LinearProgress variant="determinate" value={progress} sx={{ my: 2 }} />}
            {cancel !== null &&
              <div>
                <Typography variant="body2" gutterBottom>{nbResults} routes found</Typography>
                <Button color="secondary" onClick={cancelWorkers}>
                  Cancel
                </Button>
              </div>
            }
          </Box>
        </Box>
      }
    </Box>
  );

});

export default Routing;
