import React from 'react';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { getBounds, getDistance, getRhumbLineBearing, convertDistance } from "geolib";
import L from "leaflet";
import "@maplibre/maplibre-gl-leaflet";
import "@geoman-io/leaflet-geoman-free";
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { cleanLegs, wrapNb, formatGPSCoord } from "./util/utility.js";
import Canvas from "./MapLayers/Components/Canvas.js";
import Marker from "./MapLayers/Components/Marker.js";
import Job from "./MapLayers/Components/Job.js";
import LayerControl from "./MapLayers/LayerControl.js";

L.PM.setOptIn(true);

const FSEMap = React.memo(function FSEMap(props) {

  const s = props.options.settings;
  const [contextMenu, setContextMenu] = React.useState(null);
  const [basemap, setBasemap] = React.useState(s.display.map.basemap);
  const [init, setInit] = React.useState(false);
  const [measureDistance, setMeasureDistance] = React.useState(false);
  const basemapRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const distanceRef = React.useRef(null);

  const startDistanceMeasure = React.useRef((latlng) => {
    // If already measuring a distance, remove previous line
    if (distanceRef.current !== null) {
      distanceRef.current.remove();
      distanceRef.current = null;
    }
    setMeasureDistance(true);
    // Enable drawing a line and add clicked location as first point
    mapRef.current.pm.enableDraw('Line', {tooltips: false});
    mapRef.current.pm.Draw.Line._createVertex({latlng: latlng})
  });

  // Initialize map
  React.useEffect(() => {
    if (mapRef.current) { return; }
    const canvas = new Canvas({ padding: 0.5 });
    mapRef.current = L.map('map', {
      center: [46.5344, 3.42167],
      zoom: 6,
      minZoom: 2,
      maxZoom: 17,
      maxBounds: [[-90,-180], [90,180]],
      renderer: canvas,
      zoomControl: false,
      attributionControl: false,
      pmIgnore: false
    });
    mapRef.current.on('contextmenu', (evt) => {
      evt.originalEvent.stopPropagation();
      evt.originalEvent.preventDefault();
      const lat = Math.round((evt.latlng.lat + Number.EPSILON) * 10000) / 10000;
      const lon = Math.round((evt.latlng.lng + Number.EPSILON) * 10000) / 10000;
      setContextMenu({
        mouseX: evt.originalEvent.clientX,
        mouseY: evt.originalEvent.clientY,
        title: (lat >= 0 ? lat+'N ' : (-lat)+'S ') + (lon >= 0 ? lon+'E': (-lon)+'W'),
        actions: [
          {
            name: 'Measure distance from this point',
            onClick: () => startDistanceMeasure.current(evt.latlng)
          },
          {
            name: 'Location on Google Map (satellite)',
            onClick: () => window.open(`http://maps.google.com/maps?t=k&q=loc:${evt.latlng.lat}+${wrapNb(evt.latlng.lng, 0)}`, '_blank')
          },
        ]
      });
    });
    // When measuring line is finished: enable editing
    mapRef.current.on('pm:create', e => {
      const updateMeasure = () => {
        const [fr, to] = e.layer.getLatLngs();
        setMeasureDistance({
          direction: Math.round(getRhumbLineBearing(fr, to)),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
        });
      };
      // Enable editing
      e.layer.setStyle({ pmIgnore: false });
      L.PM.reInitLayer(e.layer);
      e.layer.pm.enable({ hideMiddleMarkers: true, preventMarkerRemoval: true });
      distanceRef.current = e.layer;
      // Update distance and bearing
      updateMeasure();
      e.layer.on('pm:markerdragend', () => {
        updateMeasure();
      });
    });
    // When measuring line starts: register event to limit the line to 2 points
    mapRef.current.on('pm:drawstart', e => {
      const { workingLayer } = e;
      workingLayer.on('pm:vertexadded', e => {
        if (workingLayer.getLatLngs().length >= 2) {
         mapRef.current.pm.Draw.Line._finishShape();
        }
      });
    });
    setInit(true);
  }, []);

  // Pass map reference to parent App
  React.useEffect(() => {
    props.mapRef.current = mapRef.current;
  }, [props.mapRef]);

  // Change basemap
  React.useEffect(() => {
    if (basemapRef.current) {
      basemapRef.current.remove();
      basemapRef.current = null;
    }
    if (basemap === 0) {
      basemapRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      basemapRef.current.addTo(mapRef.current);
    }
    else {
      basemapRef.current = L.maplibreGL({
      	style: 'https://map-a.fse-planner.piero-la-lune.fr/styles/default/style.json'
      });
      basemapRef.current.addTo(mapRef.current);
    }
  }, [basemap]);

  // Display search marker
  const searchRef = React.useRef(null);
  const prevSearchRef = React.useRef(null);
  const searchDestRef = React.useRef(null);
  const searchDestLegRef = React.useRef(null);
  const prevSearchDestRef = React.useRef(null);
  React.useEffect(() => {
    // Do not update is map is closed
    if (props.hidden) { return; }

    // If marker already exists remove it
    if (searchRef.current) {
      searchRef.current.remove();
      searchRef.current = null;
    }
    if (searchDestRef.current) {
      searchDestRef.current.remove();
      searchDestRef.current = null;
      searchDestLegRef.current.remove();
      searchDestLegRef.current = null;
    }

    // Only draw marker if search is not empty
    if (props.searchDest) {
      // Get jobs and draw line
      let legs = [];
      const key = props.search+'-'+props.searchDest;
      if (props.options.jobs[key]) {
        [legs, ] = cleanLegs({[key]: props.options.jobs[key]}, props.options);
      }
      if (!legs[key]) {
        const fr = { latitude: props.options.icaodata[props.search].lat, longitude: props.options.icaodata[props.search].lon };
        const to = { latitude: props.options.icaodata[props.searchDest].lat, longitude: props.options.icaodata[props.searchDest].lon };
        legs[key] = {
          amount: 0,
          pay: 0,
          direction: Math.round(getRhumbLineBearing(fr, to)),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
        };
      }
      searchDestLegRef.current = Job({
        positions: [[props.options.icaodata[props.search].lat, props.options.icaodata[props.search].lon], [props.options.icaodata[props.searchDest].lat, props.options.icaodata[props.searchDest].lon]],
        color: s.display.markers.colors.selected,
        highlight: s.display.legs.colors.highlight,
        weight: s.display.legs.weights.flight,
        leg: legs[key],
        options: props.options,
        actions: props.actions,
        fromIcao: props.search,
        toIcao: props.searchDest
      })
        .addTo(mapRef.current);
      // Draw marker
      searchDestRef.current = Marker({
        position: [props.options.icaodata[props.searchDest].lat, props.options.icaodata[props.searchDest].lon],
        size: s.display.markers.sizes.selected,
        color: s.display.markers.colors.selected,
        icao: props.searchDest,
        icaodata: props.options.icaodata,
        planes: props.options.planes[props.searchDest],
        siminfo: s.display.sim,
        actions: props.actions
      })
        .addTo(mapRef.current);
      // Zoom on leg if one ICAO has changed
      if ((prevSearchRef.current !== props.search || prevSearchDestRef.current !== props.searchDest) && props.search !== props.searchDest) {
        const points = [props.search, props.searchDest].map(elm => props.options.icaodata[elm]);
        const b = getBounds(points);
        // Need a small delay, otherwise does not work because of invalidateSize in App.js
        setTimeout(() => { mapRef.current.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]]) }, 10);
        ;
      }
    }
    if (props.search) {
      searchRef.current = Marker({
        position: [props.options.icaodata[props.search].lat, props.options.icaodata[props.search].lon],
        size: s.display.markers.sizes.selected,
        color: s.display.markers.colors.selected,
        icao: props.search,
        icaodata: props.options.icaodata,
        planes: props.options.planes[props.search],
        siminfo: s.display.sim,
        actions: props.actions
      })
        .addTo(mapRef.current);
      // Only open popup if search ICAO has changed
      if (prevSearchRef.current !== props.search && !props.searchDest) {
        setTimeout(() => { searchRef.current && searchRef.current.openPopup() }, 10);
      }
    }

    prevSearchRef.current = props.search;
    prevSearchDestRef.current = props.searchDest;
  }, [
    props.search,
    props.searchDest,
    props.options,
    s,
    props.actions,
    props.hidden
  ]);

  // Display search GPS marker
  const searchGpsRef = React.useRef(null);
  const prevSearchGpsRef = React.useRef(null);
  React.useEffect(() => {
    // Do not update is map is closed
    if (props.hidden) { return; }

    // If marker already exists remove it
    if (searchGpsRef.current) {
      searchGpsRef.current.remove();
      searchGpsRef.current = null;
    }

    // Only draw marker if searchGps is not empty
    if (props.searchGps) {
      searchGpsRef.current = Marker({
        position: [props.searchGps.lat, props.searchGps.lng],
        size: s.display.markers.sizes.selected,
        color: s.display.markers.colors.selected,
        icao: formatGPSCoord(props.searchGps.lat, props.searchGps.lng),
        icaodata: props.options.icaodata,
        sim: 'gps',
        actions: props.actions
      })
        .addTo(mapRef.current);
      // Only open popup if search lat/lng has changed
      if (prevSearchGpsRef.current !== props.searchGps) {
        setTimeout(() => { searchGpsRef.current && searchGpsRef.current.openPopup() }, 10);
      }
    }

    prevSearchGpsRef.current = props.searchGps;
  }, [
    props.searchGps,
    props.options,
    s,
    props.actions,
    props.hidden
  ]);

  // Set search marker on top at each render
  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.bringToFront();
    }
    if (searchDestRef.current) {
      searchDestRef.current.bringToFront();
      searchDestLegRef.current.bringToFront();
    }
  }, [props.options]);

  // Clear canvas cache on settings change
  React.useEffect(() => {
    mapRef.current.options.renderer.clearCache();
  }, [s]);

  // Auto zoom map on jobs
  React.useEffect(() => {
    const icaos = new Set();
    Object.keys(props.options.jobs).forEach(key => icaos.add(key.split('-')[0]));
    const points = [...icaos].map(elm => props.options.icaodata[elm]);
    if (points.length > 4) {
      const b = getBounds(points);
      mapRef.current.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]], {animate:false});
    }
  }, [props.options.jobs, props.options.icaodata]);

  // Auto zoom on route
  React.useEffect(() => {
    if (props.route) {
      const b = getBounds(props.route.icaos.map(elm => props.options.icaodata[elm]));
      const bounds = L.latLngBounds([b.minLat, b.minLng], [b.maxLat, b.maxLng]);
      const mapBounds = mapRef.current.getBounds();
      if (!mapBounds.contains(bounds)) {
        mapRef.current.fitBounds(mapBounds.extend(bounds));
      }
    }
  }, [props.route, props.options.icaodata]);

  // Change map bounds when map center changes
  React.useEffect(() => {
    mapRef.current.setMaxBounds([[-90, s.display.map.center-180], [90, s.display.map.center+180]]);
  }, [s.display.map.center]);

  props.actions.current.contextMenu = setContextMenu;
  props.actions.current.measureDistance = startDistanceMeasure.current;

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <Box
      sx={{
        display: props.hidden ? 'none' : 'flex',
        flex: '1 1 auto',
        position: 'relative'
      }}
    >
      <div id="map">
      </div>
      {contextMenu &&
        <Popover
          open={true}
          onClose={closeContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            { top: contextMenu.mouseY, left: contextMenu.mouseX }
          }
          onContextMenu={(evt) => {evt.preventDefault(); evt.stopPropagation();}}
          sx={{ '& .MuiPaper-root': { minWidth: 200 } }}
        >
          <Typography
            variant="body1"
            sx={{
              margin: 1,
              fontWeight: 'bold'
            }}
          >
            {contextMenu.title}
          </Typography>
          {contextMenu.actions.length > 0 &&
            <MenuList sx={{ pt: 0 }}>
              { contextMenu.actions.map((action, i) =>
                {
                  if (action.divider) {
                    return <Divider key={i} />
                  } else {
                    return <MenuItem dense key={i} onClick={() => { action.onClick(); closeContextMenu(); }}>{action.name}</MenuItem>
                  }
                }
              )}
            </MenuList>
          }
        </Popover>
      }
      {init &&
        <LayerControl
          map={mapRef.current}
          setBasemap={setBasemap}
          options={props.options}
          actions={props.actions}
          route={props.route}
          icaos={props.icaos}
        />
      }
      {measureDistance !== false &&
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={true}
          message={ measureDistance === true ?
            "Click the map to measure the distance"
          :
            <span>Distance: <b>{measureDistance.distance}NM</b> - Bearing: <b>{measureDistance.direction}°</b></span>
          }
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => {
                distanceRef.current.remove();
                distanceRef.current = null;
                setMeasureDistance(false);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      }
    </Box>
  );

});

export default FSEMap;
