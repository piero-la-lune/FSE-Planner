import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LinearProgress from '@mui/material/LinearProgress';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';


import { getDistance, convertDistance, getBounds } from "geolib";

import RoutingWorker from './routing.worker.js';
import Result from './Result.js';
import Results from './Results.js';
import IcaoSearch from './IcaoSearch.js';
import { hideAirport, Plane } from "../util/utility.js";
import log from "../util/logger.js";

import aircrafts from "../data/aircraft.json";

const styles = {
  content: {
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarWidth: "thin",
    background: "#fff"
  },
  formLabel: {
    marginBottom: 1.5,
    marginTop: 3
  }
};


const Routing = React.memo((props) => {
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [nbResults, setNbResults] = React.useState(0);
  const [moreSettings, setMoreSettings] = React.useState(false);
  const [maxPax, setMaxPax] = React.useState('');
  const [maxCargo, setMaxCargo] = React.useState('');
  const [maxKg, setMaxKg] = React.useState('');
  const [speed, setSpeed] = React.useState(250);
  const [consumption, setConsumption] = React.useState(60);
  const [fuelCapacity, setFuelCapacity] = React.useState(500);
  const [fuelType, setFuelType] = React.useState(1);
  const [rentFee, setRentFee] = React.useState(0);
  const [rentType, setRentType] = React.useState('dry');
  const [planeHome, setPlaneHome] = React.useState('');
  const [planeBonus, setPlaneBonus] = React.useState('');
  const [fromIcao, setFromIcao] = React.useState(null);
  const [toIcao, setToIcao] = React.useState(null);
  const [heading, setHeading] = React.useState('');
  const [maxHops, setMaxHops] = React.useState(props.options.settings.routeFinder.maxHops);
  const [maxStops, setMaxStops] = React.useState(props.options.settings.routeFinder.maxStops);
  const [idleTime, setIdleTime] = React.useState(props.options.settings.routeFinder.idleTime);
  const [fees, setFees] = React.useState(props.options.settings.routeFinder.fees.length ? props.options.settings.routeFinder.fees : ['No']);
  const [overheadLength, setOverheadLength] = React.useState(props.options.settings.routeFinder.overheadLength);
  const [approachLength, setApproachLength] = React.useState(props.options.settings.routeFinder.approachLength);
  const [memory, setMemory] = React.useState(props.options.settings.routeFinder.memory);
  const [jobsType, setJobsType] = React.useState(props.options.settings.routeFinder.jobsType);
  const [loop, setLoop] = React.useState(props.options.settings.routeFinder.returnLeg);
  const [type, setType] = React.useState('rent');
  const [minLoad, setMinLoad] = React.useState(props.options.settings.routeFinder.minLoad);
  const [maxBadLegs, setMaxBadLegs] = React.useState(props.options.settings.routeFinder.maxBadLegs);
  const [maxEmptyLeg, setMaxEmptyLeg] = React.useState(props.options.settings.routeFinder.maxEmptyLeg);
  const [focus, setFocus] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [cancel, setCancel] = React.useState(null);
  const [availableModels, setAvailableModels] = React.useState([]);
  const [aircraftModels, setAircraftModels] = React.useState([]);
  const [aircraftSpecsModel, setAircraftSpecsModel] = React.useState(null);
  const [editSpecs, setEditSpecs] = React.useState(false);
  const [planes, setPlanes] = React.useState({});

  const icaodataArr = React.useMemo(() => Object.values(props.options.icaodata), [props.options.icaodata]);

  const setRoute = props.setRoute;
  const showDetail = React.useCallback((result) => {
    setFocus(result);
    setRoute(result);
    // Center map on route
    const b = getBounds(result.icaos.map(elm => props.options.icaodata[elm]));
    props.mapRef.current.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]]);
  }, [props.options.icaodata, props.mapRef, setRoute]);

  // Update list of available aircraft models
  React.useEffect(() => {
    const set = new Set();
    const obj = {};
    for (const icao of Object.keys(props.options.planes)) {
      const arr = [];
      for (const p of props.options.planes[icao]) {
        // Discard planes exclusively used for All-In assignments
        if (!p.allin) {
          arr.push(p);
          set.add(p.model);
        }
      }
      if (arr.length) {
        obj[icao] = arr;
      }
    }
    setPlanes(obj);
    setAvailableModels([...set].sort());
    setAircraftModels((oldAircraftModels) => oldAircraftModels.filter(elm => set.has(elm)));
  }, [props.options.planes]);

  const prepResults = (allResults, planesSpecs) => {
    const approachSpeedRatio = 0.4;
    const customPlaneBonus = planeHome ? parseInt(planeBonus, 10) : 0;
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
      let feeGround = pay*0.1;
      if (fees.includes('Ground')) {
        pay -= feeGround;
      }
      else {
        feeGround = 0;
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
      else {
        feeBooking = 0;
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
        for (const p of planes[allResults[i].icaos[0]]) {
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
        if (customPlaneBonus) {
          // Compute bonus
          const startIcao = allResults[i].icaos[0];
          const endIcao = allResults[i].icaos[allResults[i].icaos.length-1];
          bonus = -Math.round(
            (
                convertDistance(getDistance(props.options.icaodata[endIcao], props.options.icaodata[planeHome]), 'sm')
              -
                convertDistance(getDistance(props.options.icaodata[startIcao], props.options.icaodata[planeHome]), 'sm')
            )
            * customPlaneBonus / 100);
        }
      }
      // Subtract rental cost and bonus to total pay
      if (fees.includes('Rental')) {
        pay -= rentalCost - bonus;
      }
      else {
        rentalCost = 0;
        bonus = 0;
      }
      // Subtract fuel usage to total pay
      if (fees.includes('Fuel') && rentalType !== 'wet') {
        pay -= fuelCost;
      }
      else {
        fuelCost = 0;
      }

      // If rental is wet, no fuel cost
      if (rentalType === 'wet') {
        fuelCost = 0;
      }

      allResults[i].payNM = pay/totalDistance;
      allResults[i].payLeg = pay / (allResults[i].icaos.length - 1);
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

    setResults(allResults);
    setLoading(false);
    setCancel(null);
  }

  const startSearch = () => {
    setProgress(0);
    setLoading(true);
    setNbResults(0);

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
    let planeMaxCargo = maxCargo;
    let planeMaxPax = maxPax;
    let planesSpecs = {};
    if (type === "rent") {
      planeMaxCargo = 0;
      planeMaxPax = 0;
      // Go through every available planes, to build an object
      // with the specifications of all plane models available
      for (const model of aircraftModels.length ? aircraftModels : availableModels) {
        planesSpecs[model] = new Plane(model);
        planeMaxCargo = Math.max(planeMaxCargo, planesSpecs[model].maxCargo);
        planeMaxPax = Math.max(planeMaxPax, planesSpecs[model].maxPax);
      }
    }
    else {
      planesSpecs['free'] = new Plane(aircraftSpecsModel, {
        maxPax: maxPax,
        maxCargo: maxCargo,
        maxKg: maxKg,
        speed: speed,
        GPH: consumption,
        fuelType: fuelType,
        fuelCapacity: fuelCapacity
      });
    }

    // List of start points
    const icaos = [];
    if (type === "rent") {
      for (const icao of Object.keys(planes)) {
        if (hideAirport(icao, props.options.settings.airport, props.options.settings.display.sim)) { continue; }
        for (const p of planes[icao]) {
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
      if (toIcao) {
        addIcao(toIcao);
      }
    }
    const total = icaos.length;

    const paxSys = jobsType.includes("pax-sys");
    const paxTrip = jobsType.includes("pax-trip");
    const paxVIP = jobsType.includes("pax-vip");
    const cargoSys = jobsType.includes("cargo-sys");
    const cargoVIP = jobsType.includes("cargo-vip");

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
        if (v['Trip-Only']) {
          for (const c of v['Trip-Only']) {
            if (c.pax && (
                  c.pax > planeMaxPax
              ||  (!c.PT && !paxSys)
              ||  (c.PT && !paxTrip)
            )) { continue; }
            if (!c.pax && (c.kg > planeMaxCargo || !cargoSys)) { continue; }
            obj.cargos.TripOnly.push({from: fr, to: to, ...c});
          }
        }
        if (v['VIP']) {
          for (const c of v['VIP']) {
            if (c.pax && (c.pax > planeMaxPax || !paxVIP)) { continue; }
            if (!c.pax && (c.kg > planeMaxCargo || !cargoVIP)) { continue; }
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
        for (const p of planes[icao]) {
          if (!planesSpecs[p.model]) { continue; }
          if (model === 'free' || planesSpecs[p.model].maxCargo > planesSpecs[model].maxCargo) {
            model = p.model;
          }
        }
      }
      worker.postMessage({
        fromIcao: icao,
        toIcao: type === 'rent' ? (loop ? icao : null) : (toIcao ? toIcao : null),
        heading: heading === '' ? false : parseInt(heading, 10),
        src: src,
        options: {
          maxKg: planesSpecs[model].maxKg,
          maxPax: planesSpecs[model].maxPax,
          maxCargo: planesSpecs[model].maxCargo,
          minPaxLoad: planesSpecs[model].maxPax*minLoad/100,
          minCargoLoad: planesSpecs[model].maxCargo*minLoad/100,
          range: planesSpecs[model].range,
          gph: planesSpecs[model].GPH,
          speed: planesSpecs[model].speed,
          maxStops: maxStops,
          maxEmptyLeg: maxEmptyLeg,
          model: model,
          resultLimit: resultLimit
        },
        maxHops: maxHops,
        maxBadLegs: parseInt(maxBadLegs, 10)
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

      {results && !loading &&
        <React.Fragment>
          <Results
            showDetail={showDetail}
            setRoute={props.setRoute}
            goTo={props.actions.current.goTo}
            icaodataArr={icaodataArr}
            close={() => {
              setResults(null);
              props.setRoute(null);
              setMoreSettings(false);
            }}
            results={results}
            type={type}
            display={focus ? false : true}
          />

          {focus &&
            <Result
              focus={focus}
              setFocus={setFocus}
              idleTime={idleTime}
              overheadLength={overheadLength}
              approachLength={approachLength}
              options={props.options}
              actions={props.actions}
            />
          }
        </React.Fragment>
      }

      {!results && !loading &&
        <Box sx={{ ...styles.content, ...{ p: 2 }}}>

          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(evt, newType) => {
              if (newType !== null) {
                setType(newType);
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
              <Box
                sx={{
                  background: "rgba(0, 0, 0, 0.04)",
                  borderRadius: 1,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  p: 1
                }}
              >
                <Typography variant="body">Search for the best paying routes using a rented aircraft.</Typography>
              </Box>
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
              <Box
                sx={{
                  background: "rgba(0, 0, 0, 0.04)",
                  borderRadius: 1,
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  p: 1
                }}
              >
                <Typography variant="body">Search for the best paying routes given a starting location and an aircraft model.</Typography>
              </Box>
              <Typography variant="body1" sx={styles.formLabel}>Restrict search to specific route:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <IcaoSearch
                    options={icaodataArr}
                    label="From"
                    required
                    onChange={(evt, value) => {
                      if (value) {
                        setFromIcao(value.icao);
                      }
                      else {
                        setFromIcao(null);
                      }
                    }}
                    value={fromIcao ? props.options.icaodata[fromIcao] : null}
                  />
                </Grid>
                <Grid item xs={6}>
                  <IcaoSearch
                    options={icaodataArr}
                    label="To"
                    onChange={(evt, value) => {
                      if (value) {
                        setToIcao(value.icao);
                      }
                      else {
                        setToIcao(null);
                      }
                    }}
                    value={toIcao ? props.options.icaodata[toIcao] : null}
                    disabled={heading !== ""}
                  />
                  <TextField
                    label="Heading"
                    variant="outlined"
                    placeholder="180"
                    value={heading}
                    onChange={(evt) => setHeading(evt.target.value.replace(/[^0-9]/g, ''))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">°</InputAdornment>,
                    }}
                    sx={{mt: 1}}
                    disabled={toIcao !== null}
                  />
                </Grid>
              </Grid>

              { toIcao &&
                <Alert severity="info" sx={styles.formLabel}>
                  Recommended algorithm parameters when setting a destination:
                  <ul>
                    <li><i>Max number of legs</i>: 10</li>
                    <li><i>Min plane load</i>: 20%</li>
                    <li><i>Max number of "bad" legs</i>: 2</li>
                    <li><i>Max length of empty legs</i>: 50NM</li>
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
                  setMaxCargo(p.maxCargo);
                  setMaxPax(p.maxPax);
                  setFuelCapacity(p.fuelCapacity);
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
                        label="Max cargo"
                        placeholder="500"
                        variant="outlined"
                        required
                        value={maxCargo}
                        onChange={(evt) => setMaxCargo(evt.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <Tooltip title="Maximum weight of fuel AND cargo (passengers + packages) the plane can handle.">
                        <TextField
                          label="Max weight (fuel + load)"
                          variant="outlined"
                          placeholder="2000"
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">Kg</InputAdornment>,
                          }}
                          value={maxKg}
                          onChange={(evt) => setMaxKg(evt.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Cruise speed"
                        placeholder="250"
                        variant="outlined"
                        value={speed}
                        onChange={(evt) => setSpeed(evt.target.value.replace(/[^0-9]/g, ''))}
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Kts</InputAdornment>,
                        }}
                      />
                    </Grid>

                  </Grid>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <TextField
                        label="Fuel capacity"
                        placeholder="500"
                        variant="outlined"
                        value={fuelCapacity}
                        onChange={(evt) => setFuelCapacity(evt.target.value.replace(/[^0-9]/g, ''))}
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">Gallons</InputAdornment>,
                        }}
                      />
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
                    <Grid item xs={4}>
                      <TextField
                        label="Fuel type"
                        variant="outlined"
                        value={fuelType}
                        onChange={(evt) => setFuelType(parseInt(evt.target.value))}
                        select
                        fullWidth
                        required
                      >
                        <MenuItem value="0">100LL</MenuItem>
                        <MenuItem value="1">Jet-A</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={5}>
                      <Tooltip title="Leave it to 0 if using your own plane.">
                        <TextField
                          label="Rental price"
                          placeholder="0"
                          variant="outlined"
                          value={rentFee}
                          onChange={(evt) => setRentFee(evt.target.value.replace(/[^0-9]/g, ''))}
                          required
                          InputProps={{
                            endAdornment: <InputAdornment position="end">$/hour</InputAdornment>,
                          }}
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label="Rent type"
                        variant="outlined"
                        value={rentType}
                        onChange={(evt) => setRentType(evt.target.value)}
                        select
                        fullWidth
                        required
                      >
                        <MenuItem value="dry">Dry</MenuItem>
                        <MenuItem value="wet">Wet</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} style={{marginTop:12}}>
                    <Grid item xs={6}>
                      <TextField
                        label="Bonus"
                        placeholder="0"
                        variant="outlined"
                        value={planeBonus}
                        onChange={(evt) => setPlaneBonus(evt.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">$/</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <IcaoSearch
                        options={icaodataArr}
                        label="Aircraft home"
                        onChange={(evt, value) => {
                          if (value) {
                            setPlaneHome(value.icao);
                          }
                          else {
                            setPlaneHome(null);
                          }
                        }}
                        value={planeHome ? props.options.icaodata[planeHome] : null}
                      />
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
            <Paper
              sx={{
                p:1,
                position: 'relative',
                mt: 2
              }}
              variant="outlined"
            >
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 3,
                  top: 3,
                  color: 'grey[500]',
                }}
                onClick={() => setMoreSettings(false)}
              >
                <CloseIcon />
              </IconButton>

              <Typography variant="body1" sx={{...styles.formLabel, mt: 1}}>Advanced algorithm parameters:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Tooltip title="Maximum number of legs in a route.">
                    <TextField
                      label="Max number of legs"
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
                      label="Max intermediate stops"
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
                  <Tooltip title="Number of possible legs bellow the minimum plane load or in the wrong direction (if destination is set).">
                    <TextField
                      label='Max number of "bad" legs'
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
                  <Tooltip title="Maximum distance of entirely empty legs (no cargo/pax at all). Do not set this too high in dense airports areas, it quickly becomes very computer intensive.">
                    <TextField
                      label="Max length of empty legs"
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

              <TextField
                label="Jobs type"
                variant="outlined"
                value={jobsType}
                onChange={(evt) => setJobsType(evt.target.value)}
                select
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    if (selected.length === 5) { return 'All' }
                    const arr = [];
                    if (selected.includes("pax-sys")) {
                      if (selected.includes("cargo-sys")) {
                        arr.push('Black');
                      }
                      else {
                        arr.push('Black pax');
                      }
                    }
                    else if (selected.includes("cargo-sys")) {
                      arr.push('Black cargo');
                    }
                    if (selected.includes("pax-trip")) {
                      arr.push('Green');
                    }
                    if (selected.includes("pax-vip")) {
                      if (selected.includes("cargo-vip")) {
                        arr.push('VIP');
                      }
                      else {
                        arr.push('VIP pax');
                      }
                    }
                    else if (selected.includes("cargo-vip")) {
                      arr.push('VIP cargo');
                    }
                    return arr.join(', ');
                  }
                }}
                sx={styles.formLabel}
              >
                <MenuItem value="pax-sys">
                  <Checkbox checked={jobsType.indexOf("pax-sys") > -1} />
                  <ListItemText primary="Black jobs - Passengers" />
                </MenuItem>
                <MenuItem value="cargo-sys">
                  <Checkbox checked={jobsType.indexOf("cargo-sys") > -1} />
                  <ListItemText primary="Black jobs - Cargo" />
                </MenuItem>
                <MenuItem value="pax-trip">
                  <Checkbox checked={jobsType.indexOf("pax-trip") > -1} />
                  <ListItemText primary="Green jobs" />
                </MenuItem>
                <MenuItem value="pax-vip">
                  <Checkbox checked={jobsType.indexOf("pax-vip") > -1} />
                  <ListItemText primary="VIP jobs - Passengers" />
                </MenuItem>
                <MenuItem value="cargo-vip">
                  <Checkbox checked={jobsType.indexOf("cargo-vip") > -1} />
                  <ListItemText primary="VIP jobs - Cargo" />
                </MenuItem>
              </TextField>

            </Paper>
          }

          <Box
            sx={{
              marginTop: 4,
              marginBottom: 2,
              textAlign: "center"
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={startSearch}
              disabled={
                !maxHops || maxStops === '' || minLoad === '' || maxBadLegs === '' || idleTime === ''
                         || overheadLength === '' || approachLength === '' || maxEmptyLeg === ''
                         || (type === "free" && (!fromIcao || !maxPax || !maxCargo || !maxKg || !speed || !consumption || !fuelCapacity || !aircraftSpecsModel))
                         || (type === "rent" && (!availableModels.length))
              }
            >
              Find best routes
            </Button>
          </Box>
        </Box>
      }

      {loading &&
        <Box
          sx={{
            m:2,
            textAlign: "center"
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ my: 2 }} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">{`${Math.floor(progress)}%`}</Typography>
            </Box>
          </Box>
          {cancel !== null &&
            <div>
              <Typography variant="body2">Searching routes...</Typography>
              <Typography variant="body2" gutterBottom>({nbResults} routes found)</Typography>
              <Button color="secondary" onClick={cancelWorkers}>
                Cancel
              </Button>
            </div>
          }
        </Box>
      }
    </Box>
  );

});

export default Routing;
