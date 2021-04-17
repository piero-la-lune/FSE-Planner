import React from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import FilterListIcon from '@material-ui/icons/FilterList';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import TimerIcon from '@material-ui/icons/Timer';
import Link from '@material-ui/core/Link';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LinearProgress from '@material-ui/core/LinearProgress';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';

import { getDistance, convertDistance, getBounds } from "geolib";

import RoutingWorker from './routing.worker.js';
import { hideAirport } from "./utility.js";
import log from "./util/logger.js";

import aircrafts from "./data/aircraft.json";

const useStyles = makeStyles(theme => ({
  routing: {
    width: 400,
    background: "#eee",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column"
  },
  title: {
    textAlign: "center",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    fontWeight: 300,
    position: "relative"
  },
  pMore: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  more: {
    color: "#666",
    cursor: "pointer",
    "&:hover": {
      color: "#000"
    }
  },
  pButtons: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    textAlign: "center"
  },
  content: {
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarWidth: "thin",
    background: "#fff"
  },
  result: {
    padding: theme.spacing(3),
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    "&:hover": {
      background: "#f9f9f9"
    },
    position: "relative"
  },
  separator: {
    marginLeft: 1,
    marginRight: 1
  },
  icon: {
    marginRight: theme.spacing(0.2)
  },
  grid: {
    marginTop: theme.spacing(1),
    marginLeft: -theme.spacing(2)
  },
  gridText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  sortByValue: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: "#aaa",
    fontSize: "0.8em"
  },
  form: {
    padding: theme.spacing(2),
  },
  formLabel: {
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(3)
  },
  typeButtons: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  tlOp: {
    flex: 10
  },
  tlCt: {
    minWidth: 50,
    fontSize: '1.2em',
    marginTop: '-4px'
  },
  tlPaper: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  tlGrid: {
    marginTop: theme.spacing(3)
  },
  tlGridText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  tlTotal: {
    marginTop: theme.spacing(1)
  },
  back: {
    padding: theme.spacing(3),
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    background: "#fff",
    display: "flex",
    "&:hover": {
      background: "#f9f9f9"
    }
  },
  backText: {
    verticalAlign: 'middle',
    display: 'inline-flex'
  },
  topResults: {
    background: "#fff",
    display: "flex",
    alignItems: "center"
  },
  nbResults: {
    background: "#fff",
    borderBottom: "1px solid #eee",
    padding: theme.spacing(1)
  },
  backSearch: {
    cursor: "pointer",
    height: "100%",
    "&:hover": {
      background: "#f9f9f9"
    }
  },
  backSearchText: {
    lineHeight: 0.8,
    textAlign: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5)
  },
  topResultsDiv: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  filterBtn: {
    width: 150,
    fontSize: "0.8em"
  },
  filters: {
    maxWidth: 300,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  filtersInput: {
    width: "100%"
  },
  filtersApply: {
    marginTop: theme.spacing(1)
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    color: theme.palette.grey[500],
  },
  progressBar: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));



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
    text.push(kg + 'kg');
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

const Results = React.memo(({results, classes, showDetail, goTo, setRoute, nbDisplay, sortBy}) => {
  return (
    results.slice(0, nbDisplay).map(result =>
      <div
        className={classes.result}
        key={result.id}
        onClick={() => showDetail(result)}
        onMouseEnter={() => setRoute(result)}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          classes={{separator:classes.separator}}
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
        <Grid container spacing={1} className={classes.grid}>
          <Grid item xs={4}>
            <Typography variant="body2" className={classes.gridText}><MonetizationOnIcon className={classes.icon} />{result.pay}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" className={classes.gridText}><SettingsEthernetIcon className={classes.icon} />{result.distance} NM</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" className={classes.gridText}><TimerIcon className={classes.icon} />{result.time}</Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" className={classes.sortByValue}>{filterText(sortBy, result)}</Typography>
      </div>
    )
  );
});


const Routing = React.memo((props) => {
  const results = React.useRef(null);
  const resultsScroll = React.useRef(0);
  const resultsDiv = React.useRef(null);
  const [filteredResults, setFilteredResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [moreSettings, setMoreSettings] = React.useState(false);
  const [maxPax, setMaxPax] = React.useState('');
  const [maxKg, setMaxKg] = React.useState('');
  const [speed, setSpeed] = React.useState(250);
  const [consumption, setConsumption] = React.useState(60);
  const [range, setRange] = React.useState(1800);
  const [fromIcao, setFromIcao] = React.useState('');
  const [toIcao, setToIcao] = React.useState('');
  const [maxHops, setMaxHops] = React.useState(4);
  const [maxStops, setMaxStops] = React.useState(1);
  const [idleTime, setIdleTime] = React.useState(2);
  const [fees, setFees] = React.useState(['Ground', 'Booking', 'Rental', 'Fuel']);
  const [overheadLength, setOverheadLength] = React.useState(0);
  const [approachLength, setApproachLength] = React.useState(10);
  const [vipOnly, setVipOnly] = React.useState(false);
  const [loop, setLoop] = React.useState(false);
  const [type, setType] = React.useState('rent');
  const [minLoad, setMinLoad] = React.useState(80);
  const [maxBadLegs, setMaxBadLegs] = React.useState(2);
  const [maxEmptyLeg, setMaxEmptyLeg] = React.useState(20);
  const [sortBy, setSortBy] = React.useState('payTime');
  const [focus, setFocus] = React.useState(null);
  const [filterMenu, setFilterMenu] = React.useState(null);
  const [minDist, setMinDist] = React.useState('');
  const [maxDist, setMaxDist] = React.useState('');
  const [minPay, setMinPay] = React.useState('');
  const [maxPay, setMaxPay] = React.useState('');
  const [minTime, setMinTime] = React.useState('');
  const [maxTime, setMaxTime] = React.useState('');
  const [nbDisplay, setNbDisplay] = React.useState(20);
  const [progress, setProgress] = React.useState(0);
  const [cancel, setCancel] = React.useState(null);
  const classes = useStyles();

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
    props.mapRef.current.leafletElement.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]]);
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

  const prepResults = (allResults) => {
    const approachSpeedRatio = 0.4;
    for (var i = 0; i < allResults.length; i++) {
      const aSpeed = type === 'rent' ? aircrafts[allResults[i].model].CruiseSpeed : speed;
      const totalDistance =
          allResults[i].distance
        + allResults[i].distance * overheadLength / 100
        + approachLength*(allResults[i].icaos.length-1);
      let time =
          allResults[i].distance/aSpeed
        + allResults[i].distance * overheadLength / 100 / aSpeed
        + approachLength*(allResults[i].icaos.length-1)/(aSpeed*approachSpeedRatio);
      // Compute fuel usage
      let fuelUsage = 0;
      let fuelCost = 0;
      if (type === 'rent') {
        fuelUsage = time * aircrafts[allResults[i].model].GPH;
        if (aircrafts[allResults[i].model].FuelType === 1) {
          fuelCost = fuelUsage * 4.19;
        }
        else {
          fuelCost = fuelUsage * 4.55;
        }
      }
      else {
        fuelUsage = time * consumption;
        // Do not know if 100LL or Jet-A Fuel: use a mean price per gallon between the 2
        fuelCost = fuelUsage * 4.37;
      }
      // Idle time at airport, added later because does not count for fuel usage
      //time += (idleTime / 60)*(allResults[i].icaos.length-1);
      const h = Math.floor(time);
      const min = Math.round((time-h)*60);
      let pay = allResults[i].pay;
      // Compute ground fees: 10% for each assignment
      // (could be 0 or 5% if there is no FBO at the originating or destination airport,
      // but there is no way of knowing if that is the case, so 10% is always applied)
      if (fees.includes('Ground')) {
        pay -= pay*0.1;
      }
      // Compute booking fees : X%, where X is the number of PT assignments loaded in the
      // plane (0 if less than 5 assignments)
      if (fees.includes('Booking')) {
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
                pay -= c.pay * feeHistory[key] / 100;
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
      }
      // Get plane reg, and compute rental cost and bonus
      let planeReg = null;
      let rentalType = 'dry';
      let rentalCost = 0;
      let bonus = 0;
      if (type === 'rent') {
        let lowestCost = null;
        const startIcao = allResults[i].icaos[0];
        const endIcao = allResults[i].icaos[allResults[i].icaos.length-1];
        for (const p of props.options.planes[allResults[i].icaos[0]]) {
          if (p.model !== allResults[i].model) { continue; }
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
            lowestCost = cost;
            rentalCost = p[t] * time;
            rentalType = t;
            bonus = -b;
          }
        }
      }
      // Subtract rental cost and bonus to total pay
      if (fees.includes('Rental')) {
        pay -= rentalCost - bonus;
      }
      // Subtract fuel usage to total pay
      if (fees.includes('Fuel') && rentalType !== 'wet') {
        pay -= fuelCost;
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
      allResults[i].rentalType = rentalType;
      allResults[i].b = bonus;
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

    // Compute aircraft specifications
    let planeMaxKg = maxKg;
    let planeMaxPax = maxPax;
    let planesSpecs = {
      free: {
        maxKg: maxKg,
        maxPax: maxPax,
        range: range
      }
    };
    if (type === "rent") {
      planeMaxKg = 0;
      planeMaxPax = 0;
      // Go through every available planes, to build an objetc
      // with the specifications of all plane models available
      for (const arr of Object.values(props.options.planes)) {
        for (const p of arr) {
          if (!planesSpecs[p.model]) {
            const c = aircrafts[p.model];
            const fuelCapacity = (
              c.Ext1 + c.LTip + c.LAux + c.LMain + c.Center1
                     + c.Center2 + c.Center3 + c.RMain + c.RAux
                     + c.RTip + c.RExt2);
            // Compute fuel weight in kg at 25% fuel load
            const fuel = 0.25 * 2.68735 * fuelCapacity;
            planesSpecs[p.model] = {
              // Max total weight - Empty plane weight - Weight of pilot and crew - Weight of fuel at 25% load
              maxKg: c.MTOW - c.EmptyWeight - 77*(1+c.Crew) - fuel,
              // Total plane seats - 1 seat for pilot - 1 seat if additionnal crew
              maxPax: c.Seats - (c.Crew > 0 ? 2 : 1),
              // Plane range: maximum length of a single leg
              range: fuelCapacity / c.GPH * c.CruiseSpeed
            }
            planeMaxKg = Math.max(planeMaxKg, planesSpecs[p.model].maxKg);
            planeMaxPax = Math.max(planeMaxPax, planesSpecs[p.model].maxPax);
          }
        }
      }
    }
    
    // Build job list
    const jobs = {};
    const jobsReverse = {};
    for (const [k, v] of Object.entries(props.options.jobs)) {
      const [fr, to] = k.split('-');
      if (hideAirport(fr, props.options.settings.airport) || hideAirport(to, props.options.settings.airport)) { continue; }
      const obj = {
        cargos: {
          TripOnly: [],
          VIP: []
        },
        distance: v.distance,
        direction: v.direction
      }
      if (v.kg) {
        if (v.kg['Trip-Only'] && !vipOnly) {
          for (const c of v.kg['Trip-Only']) {
            if (c.nb > planeMaxKg) { continue; }
            obj.cargos.TripOnly.push({pax: 0, kg: c.nb, pay: c.pay, from: fr, to: to, PT: false});
          }
        }
        if (v.kg['VIP']) {
          for (const c of v.kg['VIP']) {
            if (c.nb > planeMaxKg) { continue; }
            obj.cargos.VIP.push({pax: 0, kg: c.nb, pay: c.pay, from: fr, to: to, PT: false});
          }
        }
      }
      if (v.passengers) {
        if (v.passengers['Trip-Only'] && !vipOnly) {
          for (const c of v.passengers['Trip-Only']) {
            if (c.nb*77 > planeMaxKg || c.nb > planeMaxPax) { continue; }
            obj.cargos.TripOnly.push({pax: c.nb, kg: c.nb*77, pay: c.pay, from: fr, to: to, PT: c.PT === true});
          }
        }
        if (v.passengers['VIP']) {
          for (const c of v.passengers['VIP']) {
            if (c.nb*77 > planeMaxKg || c.nb > planeMaxPax) { continue; }
            obj.cargos.VIP.push({pax: c.nb, kg: c.nb*77, pay: c.pay, from: fr, to: to, PT: false});
          }
        }
      }
      if (obj.cargos.TripOnly || obj.cargos.VIP) {
        if (!jobs[fr]) { jobs[fr] = new Map(); }
        jobs[fr].set(to, obj);
        if (!jobsReverse[to]) { jobsReverse[to] = []; }
        jobsReverse[to].push(fr);
      }
    }

    // List of start points
    let icaos = [fromIcao];
    if (type === "rent") {
      icaos = Object.keys(props.options.planes);
    }
    const total = icaos.length

    const maxWorkers = navigator.hardwareConcurrency || 4;
    const closeIcaosCache = {};
    let done = 0;
    let allResults = [];
    const execute = (worker, icao) => {
      let model = 'free';
      // If renting a plane, consider the plane with the largest capacity in Kg available
      if (type === 'rent') {
        for (const p of props.options.planes[icao]) {
          if (model === 'free' || planesSpecs[p.model].maxKg > planesSpecs[model].maxKg) {
            model = p.model;
          }
        }
      }
      worker.postMessage({
        fromIcao: icao,
        toIcao: type === 'rent' ? (loop ? icao : null) : (toIcao ? toIcao : null),
        jobs: jobs,
        options: {
          maxKg: planesSpecs[model].maxKg,
          maxPax: planesSpecs[model].maxPax,
          minPaxLoad: planesSpecs[model].maxPax*minLoad/100,
          minKgLoad: planesSpecs[model].maxKg*minLoad/100,
          range: planesSpecs[model].range,
          maxStops: maxStops,
          maxEmptyLeg: maxEmptyLeg,
          icaos: Object.keys(jobs),
          icaodata: props.options.icaodata,
          model: model,
          jobsReverse: jobsReverse
        },
        maxHops: maxHops,
        maxBadLegs: maxBadLegs,
        closeIcaosCache: closeIcaosCache
      });
    };
    const onmessage = ({data}, worker) => {
      if (data.status === 'finished') {
        allResults = allResults.concat(data.results);
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
      jobs: jobs,
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
    <div className={classes.routing}>
      <Typography variant="h4" className={classes.title}>
        Route finder
        <IconButton className={classes.closeButton} onClick={props.close}>
          <CloseIcon />
        </IconButton>
      </Typography>

      {filteredResults ?

        focus ?

          <React.Fragment>
            <div className={classes.back} onClick={() => setFocus(null)}>
              <Typography variant="body1" className={classes.backText}><ArrowBackIcon />&nbsp;Back to results</Typography>
            </div>

            <div className={classes.content}>
              <Grid container spacing={1} className={classes.tlGrid}>
                <Grid item xs={4}>
                  <Typography variant="body1" className={classes.tlGridText}><MonetizationOnIcon className={classes.icon} />{focus.pay}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" className={classes.tlGridText}><SettingsEthernetIcon className={classes.icon} />{focus.distance} NM</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body1" className={classes.tlGridText}><TimerIcon className={classes.icon} />{focus.time}</Typography>
                </Grid>
              </Grid>
              <Timeline align="right">
                {focus.icaos.map((icao, i) => {
                  const onboard = i < focus.icaos.length-1 ? focus.cargos[i].TripOnly.reduce((acc, elm) => elm.from === icao ? acc : [...acc, elm], []) : [];
                  return (
                    <TimelineItem key={i}>
                      <TimelineOppositeContent className={classes.tlOp}>
                        { i === 0 && 
                          <React.Fragment>
                            { focus.reg &&
                              <React.Fragment>
                                <Typography variant="body2">Rent {focus.reg} {focus.rentalType}</Typography>
                                <Typography variant="body2">Flight total bonus : ${focus.b}</Typography>
                              </React.Fragment>
                            }
                            <Typography variant="body2" paragraph>Fuel usage : {focus.fuel} gallons</Typography>
                          </React.Fragment>
                        }
                        {i < focus.icaos.length-1 && focus.cargos[i].TripOnly.length > 0 &&
                          <Paper variant="outlined" className={classes.tlPaper}>
                            {focus.cargos[i].TripOnly.map((cargo, j) =>
                            cargo.from === icao
                              ? cargo.pax
                                ? <Typography variant="body2" key={j}>{cargo.pax} passenger{cargo.pax > 1 ? 's' : ''} to {cargo.to} (${cargo.pay})</Typography>
                                : <Typography variant="body2" key={j}>{cargo.kg}kg to {cargo.to} (${cargo.pay})</Typography>
                              : null
                            )}
                            { onboard.length > 0 && <Typography variant="body2"><i>{textTotalCargo(onboard, false)} already onboard</i></Typography> }
                            <Typography variant="body2" className={classes.tlTotal}><b>Total:</b> {textTotalCargo(focus.cargos[i].TripOnly)}</Typography>
                          </Paper>
                        }
                        {i < focus.icaos.length-1 && focus.cargos[i].VIP.length > 0 &&
                          <Paper variant="outlined" className={classes.tlPaper}>
                            {focus.cargos[i].VIP.map((cargo, j) =>
                            cargo.pax ?
                                <Typography variant="body2" key={j}>{cargo.pax} VIP passenger{cargo.pax > 1 ? 's' : ''} to {cargo.to} (${cargo.pay})</Typography>
                              :
                                <Typography variant="body2" key={j}>{cargo.kg}kg VIP to {cargo.to} (${cargo.pay})</Typography>
                            )}
                            <Typography variant="body2" className={classes.tlTotal}><b>Total:</b> {textTotalCargo(focus.cargos[i].VIP)}</Typography>
                          </Paper>
                        }
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
                      <TimelineContent className={classes.tlCt}>
                        <Link href="#" onClick={evt => {evt.preventDefault(); props.actions.current.goTo(icao) }}>{icao}</Link>
                      </TimelineContent>
                    </TimelineItem>
                  )
                })}
              </Timeline>
            </div>
          </React.Fragment>

        :

          <React.Fragment>
            <div className={classes.topResults}>
              <div
                className={classes.backSearch}
                onClick={() => {
                  setFilteredResults(null);
                  props.setRoute(null);
                  results.current = null;
                }}
              >
                <Typography variant="body2" className={classes.backSearchText}><ArrowBackIcon /><br />New search</Typography>
              </div>
              <div className={classes.topResultsDiv}>
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
                  classes={{paper: classes.filters}}
                >
                  <Typography variant="body1">Route filters:</Typography>
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
                        margin="dense"
                        className={classes.filtersInput}
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
                        margin="dense"
                        className={classes.filtersInput}
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
                        margin="dense"
                        className={classes.filtersInput}
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
                        margin="dense"
                        className={classes.filtersInput}
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
                        margin="dense"
                        className={classes.filtersInput}
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
                        margin="dense"
                        className={classes.filtersInput}
                      />
                    </Grid>
                  </Grid>
                  <Button variant="contained" color="primary" onClick={filterResults} className={classes.filtersApply}>Apply</Button>
                </Popover>
              </div>
              <div className={classes.topResultsDiv}>
                <TextField
                  value={sortBy}
                  onChange={changeSortBy}
                  label="Sort by"
                  variant="outlined"
                  size="small"
                  select
                  className={classes.filterBtn}
                  InputProps={{style:{fontSize:"1em"}}}
                  InputLabelProps={{style:{fontSize:"1em"}}}
                >
                  <MenuItem value="payNM">Pay per NM</MenuItem>
                  <MenuItem value="payLeg">Pay per leg</MenuItem>
                  <MenuItem value="payTime">Pay per flight time</MenuItem>
                  <MenuItem value="pay">Total pay</MenuItem>
                  {type === "rent" && <MenuItem value="bonus">Plane bonus</MenuItem>}
                </TextField>
              </div>
            </div>
            <div className={classes.nbResults}>
              {
                filteredResults.length > 0 ?
                  <Typography variant="body2">{filteredResults.length} routes found.</Typography>
                :
                  <Typography variant="body2">No route found.</Typography>
              }
            </div>
            <div
              ref={resultsDiv}
              className={classes.content}
              onScroll={() => {
                if (resultsDiv.current.scrollHeight - resultsDiv.current.scrollTop - resultsDiv.current.clientHeight < 400 && nbDisplay < filteredResults.length) {
                  setNbDisplay(nbDisplay + 20);
                }
              }}
            >
              <Results
                results={filteredResults}
                classes={classes}
                showDetail={showDetail}
                goTo={props.actions.current.goTo}
                setRoute={props.setRoute}
                nbDisplay={nbDisplay}
                sortBy={sortBy}
              />
            </div>
          </React.Fragment>

      :

        <div className={classes.content+' '+classes.form}>

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
            className={classes.typeButtons}
          >
            <ToggleButton value="rent" style={{flexGrow:1}}>Available planes</ToggleButton>
            <ToggleButton value="free" style={{flexGrow:1}}>Free search</ToggleButton>
          </ToggleButtonGroup>

          { type === "rent" ?
            <FormControlLabel
              control={<Switch checked={loop} onChange={(evt) => setLoop(evt.target.checked)} />}
              label="Return plane to starting airport"
              className={classes.formLabel}
            />
          :
            <React.Fragment>
              <Typography variant="body1" className={classes.formLabel}>Restrict search to specific route:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="From"
                    placeholder="ICAO"
                    variant="outlined"
                    value={fromIcao}
                    onChange={(evt) => setFromIcao(evt.target.value.toUpperCase())}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="To"
                    variant="outlined"
                    placeholder="ICAO"
                    value={toIcao}
                    onChange={(evt) => setToIcao(evt.target.value.toUpperCase())}
                  />
                </Grid>
              </Grid>

              <Typography variant="body1" className={classes.formLabel}>Aircraft specifications:</Typography>
              <Grid container spacing={1}>
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
              </Grid>
              <Grid container spacing={1} style={{marginTop:12}}>
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
            </React.Fragment>
          }


          {!moreSettings &&
            <Typography variant="body1" className={classes.pMore}>
              <span className={classes.more} onClick={() => setMoreSettings(true)}>More options...</span>
            </Typography>
          }

          {moreSettings &&
            <div>

              <Typography variant="body1" className={classes.formLabel}>Advanced algorithm parameters:</Typography>
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
              </Grid>

              <Typography variant="body1" className={classes.formLabel}>Route parameters:</Typography>
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
                className={classes.formLabel}
              />

            </div>
          }

          <div className={classes.pButtons}>
            {!loading &&
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={startSearch}
                disabled={
                  !maxHops || maxStops === '' || minLoad === '' || maxBadLegs === '' || idleTime === ''
                           || overheadLength === '' || approachLength === '' || maxEmptyLeg === ''
                           || (type === "free" && (!fromIcao || !maxPax || !maxKg || !speed || !consumption || !range))
                }
              >
                Find best routes
              </Button>
            }
            {loading && <LinearProgress variant="determinate" value={progress} className={classes.progressBar} />}
            {cancel !== null &&
              <Button color="secondary" onClick={cancelWorkers}>
                Cancel
              </Button>
            }
          </div>
        </div>
      }
    </div>
  );

});

export default Routing;