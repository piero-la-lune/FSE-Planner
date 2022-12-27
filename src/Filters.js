import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import StarIcon from '@mui/icons-material/Star';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import FlightIcon from '@mui/icons-material/Flight';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ExploreIcon from '@mui/icons-material/Explore';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BusinessIcon from '@mui/icons-material/Business';
import ClearIcon from '@mui/icons-material/Clear';

import { default as _debounce } from 'lodash/debounce';

const styles = {
  tgBtn: {
    color: "rgba(255, 255, 255, 0.5)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    '&.Mui-selected': {
      color: "rgba(255, 255, 255, 1) !important"
    }
  },
  boxBorder: {
    borderRadius: 1,
    border: '1px solid',
    borderColor: "rgba(255, 255, 255, 0.5)",
    px: 1,
    py: 0.9,
    display: 'flex',
    alignItems: 'center'
  },
  inputM: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: 1,
    px: 0.5,
    width: "55px"
  },
  inputS: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    borderRadius: 1,
    px: 0.5,
    width: "45px"
  },
  tooltip: {
    backgroundColor: 'primary.dark',
    border: '1px solid #fff',
    fontSize: '0.9em',
    fontWeight: 'normal',
    marginTop: '5px',
    '& .MuiTooltip-arrow': {
      color: 'primary.dark',
      "&:before": {
        border: '1px solid #fff'
      }
    }
  }
}

const MyTooltip = ({ children, ...props}) => (
  <Tooltip componentsProps={{ tooltip: { sx: styles.tooltip }}} arrow {...props}>
    {children}
  </Tooltip>
);

const TooltipToggleButton = ({ children, title, ...props }) => (
  <MyTooltip title={title}>
    <ToggleButton sx={styles.tgBtn} {...props}>{children}</ToggleButton>
  </MyTooltip>
);

function Filters({setFilters, clear, ...props}) {
  const [fromIcaoInput, setFromIcaoInput] = React.useState(props.filters.fromIcao || '');
  const [toIcaoInput, setToIcaoInput] = React.useState(props.filters.toIcao || '');
  const [directionInput, setDirectionInput] = React.useState(props.filters.direction);
  const [minPaxInput, setMinPaxInput] = React.useState(props.filters.minPax);
  const [minKgInput, setMinKgInput] = React.useState(props.filters.minKg);
  const [maxPaxInput, setMaxPaxInput] = React.useState(props.filters.maxPax);
  const [maxKgInput, setMaxKgInput] = React.useState(props.filters.maxKg);
  const [minDistInput, setMinDistInput] = React.useState(props.filters.minDist);
  const [maxDistInput, setMaxDistInput] = React.useState(props.filters.maxDist);
  const [minJobPayInput, setMinJobPayInput] = React.useState(props.filters.minJobPay);
  const [minLegPayInput, setMinLegPayInput] = React.useState(props.filters.minLegPay);
  const [percentPayInput, setPercentPayInput] = React.useState(props.filters.percentPay);

  // Update parent filters
  const setNb = React.useCallback((prop, value) => {
    setFilters(prev => {
      const f = {...prev};
      const nb = parseInt(value, 10);
      f[prop] =  isNaN(nb) ? '' : nb;
      return f;
    });
  }, [setFilters]);
  const set = React.useCallback((prop, value) => {
    setFilters(prev => {
      const f = {...prev};
      f[prop] = value;
      return f;
    });
  }, [setFilters]);

  // Add a 500ms debounce time, to allow user typing more than one character before updating the filters
  const debounceMinPax = React.useMemo(() => _debounce((value) => setNb('minPax', value), 500), [setNb]);
  React.useEffect(() => debounceMinPax(minPaxInput), [minPaxInput, debounceMinPax]);
  const debounceMinKg = React.useMemo(() => _debounce((value) => setNb('minKg', value), 500), [setNb]);
  React.useEffect(() => debounceMinKg(minKgInput), [minKgInput, debounceMinKg]);
  const debounceMaxPax = React.useMemo(() => _debounce((value) => setNb('maxPax', value), 500), [setNb]);
  React.useEffect(() => debounceMaxPax(maxPaxInput), [maxPaxInput, debounceMaxPax]);
  const debounceMaxKg = React.useMemo(() => _debounce((value) => setNb('maxKg', value), 500), [setNb]);
  React.useEffect(() => debounceMaxKg(maxKgInput), [maxKgInput, debounceMaxKg]);
  const debounceMinDist = React.useMemo(() => _debounce((value) => setNb('minDist', value), 500), [setNb]);
  React.useEffect(() => debounceMinDist(minDistInput), [minDistInput, debounceMinDist]);
  const debounceMaxDist = React.useMemo(() => _debounce((value) => setNb('maxDist', value), 500), [setNb]);
  React.useEffect(() => debounceMaxDist(maxDistInput), [maxDistInput, debounceMaxDist]);
  const debounceMinJobPay = React.useMemo(() => _debounce((value) => setNb('minJobPay', value), 500), [setNb]);
  React.useEffect(() => debounceMinJobPay(minJobPayInput), [minJobPayInput, debounceMinJobPay]);
  const debounceMinLegPay = React.useMemo(() => _debounce((value) => setNb('minLegPay', value), 500), [setNb]);
  React.useEffect(() => debounceMinLegPay(minLegPayInput), [minLegPayInput, debounceMinLegPay]);
  const debouncePercentPay = React.useMemo(() => _debounce((value) => setNb('percentPay', value), 500), [setNb]);
  React.useEffect(() => debouncePercentPay(percentPayInput), [percentPayInput, debouncePercentPay]);
  const debounceDirection = React.useMemo(() => _debounce((value) => setNb('direction', value), 500), [setNb]);
  React.useEffect(() => debounceDirection(directionInput), [directionInput, debounceDirection]);

  // When typing FROM ICAO, ensure it is a valid ICAO before updating the filters
  const setFrom = React.useCallback((icao) => {
    icao = icao.toUpperCase();
    setFromIcaoInput(icao);
    if (props.icaodata.hasOwnProperty(icao)) {
      set('fromIcao', icao);
    }
    else {
      set('fromIcao', null);
    }
  }, [props.icaodata, set]);
  // When FROM ICAO is changed somewhere else in the app, update input
  React.useEffect(() => {
    setFromIcaoInput(props.filters.fromIcao || '');
  }, [props.filters.fromIcao]);

  // When typing TO ICAO, ensure it is a valid ICAO before updating the filters
  const setTo = React.useCallback((icao) => {
    icao = icao.toUpperCase();
    setToIcaoInput(icao);
    if (props.icaodata.hasOwnProperty(icao)) {
      set('toIcao', icao);
    }
    else {
      set('toIcao', null);
    }
  }, [props.icaodata, set]);
  // When TO ICAO is changed somewhere else in the app, update input
  React.useEffect(() => {
    setToIcaoInput(props.filters.toIcao || '');
  }, [props.filters.toIcao]);

  // When filters are changed somewgare else, update inputs
  React.useEffect(() => {
    setDirectionInput(props.filters.direction);
  }, [props.filters.direction]);
  React.useEffect(() => {
    setMinPaxInput(props.filters.minPax);
  }, [props.filters.minPax]);
  React.useEffect(() => {
    setMinKgInput(props.filters.minKg);
  }, [props.filters.minKg]);
  React.useEffect(() => {
    setMaxPaxInput(props.filters.maxPax);
  }, [props.filters.maxPax]);
  React.useEffect(() => {
    setMaxKgInput(props.filters.maxKg);
  }, [props.filters.maxKg]);
  React.useEffect(() => {
    setMinDistInput(props.filters.minDist);
  }, [props.filters.minDist]);
  React.useEffect(() => {
    setMaxDistInput(props.filters.maxDist);
  }, [props.filters.maxDist]);
  React.useEffect(() => {
    setMinJobPayInput(props.filters.minJobPay);
  }, [props.filters.minJobPay]);
  React.useEffect(() => {
    setMinLegPayInput(props.filters.minLegPay);
  }, [props.filters.minLegPay]);
  React.useEffect(() => {
    setPercentPayInput(props.filters.percentPay);
  }, [props.filters.percentPay]);

  // Clear filters
  const clearFilters = React.useCallback(() => {
    setFromIcaoInput('');
    setToIcaoInput('');
    clear();
  }, [clear]);

  return (
    <Box
      sx={{
        display: 'flex',
        px: 1,
        pb: 1,
        boxSizing: 'border-box'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
          gap: {
            xs: 1,
            xl: 2
          }
        }}
      >
        <Box sx={styles.boxBorder}>
          <FlightTakeoffIcon sx={props.filters.fromIcao === null && props.filters.toIcao === null ? styles.tgBtn : null}/>
          &nbsp;&nbsp;
          <MyTooltip title='Jobs radiating FROM this airport'>
            <InputBase
              placeholder="From"
              sx={styles.inputM}
              inputProps={{maxLength:4}}
              value={fromIcaoInput}
              onChange={evt => setFrom(evt.target.value)}
            />
          </MyTooltip>
          &nbsp;
          <MyTooltip title='Jobs radiating TO this airport'>
            <InputBase
              placeholder="To"
              sx={styles.inputM}
              inputProps={{maxLength:4}}
              value={toIcaoInput}
              onChange={evt => setTo(evt.target.value)}
            />
          </MyTooltip>
        </Box>
        <MyTooltip title='Jobs going in this direction (+/- 30°)'>
          <Box sx={styles.boxBorder}>
            <ExploreIcon sx={directionInput === '' ? styles.tgBtn : null}/>
            &nbsp;&nbsp;
            <InputBase
              placeholder="145°"
              sx={styles.inputS}
              inputProps={{maxLength:3}}
              value={directionInput}
              onChange={evt => { setDirectionInput(evt.target.value); }}
            />
          </Box>
        </MyTooltip>
        <ToggleButtonGroup value={props.filters.type} onChange={(evt, val) => set('type', val)} exclusive>
          <TooltipToggleButton value="Trip-Only" title="Trip Only">
            <EmojiPeopleIcon />
          </TooltipToggleButton>
          <TooltipToggleButton value="VIP" title="VIP">
            <StarIcon />
          </TooltipToggleButton>
          <TooltipToggleButton value="All-In" title="All In">
            <FlightIcon />
          </TooltipToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup value={props.filters.cargo} onChange={(evt, val) => set('cargo', val)}>
          <TooltipToggleButton value="passengers" title="Passengers">
            <PeopleIcon />
          </TooltipToggleButton>
          <TooltipToggleButton value="kg" title="Cargo">
            <BusinessCenterIcon />
          </TooltipToggleButton>
        </ToggleButtonGroup>
        <Box sx={styles.boxBorder}>
          <PeopleIcon sx={minPaxInput === '' && maxPaxInput === '' ? styles.tgBtn : null} />
          &nbsp;
          <MyTooltip title="Minimum number of passengers in the aircraft">
            <InputBase
              placeholder="min"
              sx={styles.inputS}
              value={minPaxInput}
              onChange={evt => setMinPaxInput(evt.target.value)}
            />
          </MyTooltip>
          -
          <MyTooltip title="Maximum number of passengers in the aircraft">
            <InputBase
              placeholder="max"
              sx={styles.inputS}
              value={maxPaxInput}
              onChange={evt => setMaxPaxInput(evt.target.value)}
            />
          </MyTooltip>
        </Box>
        <Box sx={styles.boxBorder}>
          <BusinessCenterIcon sx={minKgInput === '' && maxKgInput === '' ? styles.tgBtn : null} />
          &nbsp;
          <MyTooltip title="Minimum weight in the aircraft">
            <InputBase
              placeholder="min"
              sx={styles.inputS}
              value={minKgInput}
              onChange={evt => setMinKgInput(evt.target.value)}
            />
          </MyTooltip>
          -
          <MyTooltip title="Maximum weight in the aircraft">
            <InputBase
              placeholder="max"
              sx={styles.inputS}
              value={maxKgInput}
              onChange={evt => setMaxKgInput(evt.target.value)}
            />
          </MyTooltip>
        </Box>
        <Box sx={styles.boxBorder}>
          <SettingsEthernetIcon sx={minDistInput === '' && maxDistInput === '' ? styles.tgBtn : null} />
          &nbsp;
          <MyTooltip title='Minimum job distance in NM'>
            <InputBase
              placeholder="min"
              sx={styles.inputS}
              value={minDistInput}
              onChange={evt => setMinDistInput(evt.target.value)}
            />
          </MyTooltip>
          -
          <MyTooltip title='Maximum job distance in NM'>
            <InputBase
              placeholder="max"
              sx={styles.inputS}
              value={maxDistInput}
              onChange={evt => setMaxDistInput(evt.target.value)}
            />
          </MyTooltip>
        </Box>
        <Box sx={styles.boxBorder}>
          <MonetizationOnIcon sx={minJobPayInput === '' && minLegPayInput === '' && percentPayInput === '' ? styles.tgBtn : null} />
          &nbsp;
          <MyTooltip title='Minimum job pay (in $)'>
            <InputBase
              placeholder="Job $"
              sx={styles.inputM}
              value={minJobPayInput}
              onChange={evt => setMinJobPayInput(evt.target.value)}
            />
          </MyTooltip>
          &nbsp;
          <MyTooltip title='Minimum leg pay (in $)'>
            <InputBase
              placeholder="Leg $"
              sx={styles.inputM}
              value={minLegPayInput}
              onChange={evt => setMinLegPayInput(evt.target.value)}
            />
          </MyTooltip>
          &nbsp;
          <MyTooltip title='Top paying jobs (in percent)'>
            <InputBase
              placeholder="Top %"
              sx={styles.inputM}
              value={percentPayInput}
              onChange={evt => setPercentPayInput(evt.target.value)}
            />
          </MyTooltip>
        </Box>
        <MyTooltip title='Airport filtering'>
          <IconButton
            onClick={() => props.setSettingsPopup('panel3')}
            sx={styles.tgBtn}
          >
            <BusinessIcon />
          </IconButton>
        </MyTooltip>
        <MyTooltip title='Clear all filters'>
          <IconButton
            onClick={clearFilters}
            sx={styles.tgBtn}
          >
            <ClearIcon />
          </IconButton>
        </MyTooltip>
      </Box>
    </Box>
  )
}

export default Filters;
