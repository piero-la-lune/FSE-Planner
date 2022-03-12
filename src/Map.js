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

import Canvas from "./MapLayers/Components/Canvas.js";
import Marker from "./MapLayers/Components/Marker.js";
import LayerControl from "./MapLayers/LayerControl.js";


const FSEMap = React.memo(function FSEMap(props) {

  const s = props.options.settings;
  const [contextMenu, setContextMenu] = React.useState(null);
  const [basemap, setBasemap] = React.useState(s.display.map.basemap);
  const [init, setInit] = React.useState(false);
  const [measureDistance, setMeasureDistance] = React.useState(false);
  const basemapRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const distanceRef = React.useRef(null);

  // When user has clicked a second time on the map to measure a distance
  const endMeasure = latlng => {
    distanceRef.current = {
      startLatlng: distanceRef.current.startLatlng,
      stopLatlng: latlng,
      line2: L.polyline([distanceRef.current.startLatlng, latlng], { color: '#fff', weight: 4 }).addTo(mapRef.current),
      line1: L.polyline([distanceRef.current.startLatlng, latlng], { color: '#000' }).addTo(mapRef.current),
      startMarker: L.circleMarker(distanceRef.current.startLatlng, {
        color: '#fff',
        weight: 1,
        fillColor: '#000',
        fillOpacity: 1,
        draggable: true
      }).on('dragend', evt => {
        let fr = evt.target.getLatLng();
        let to = distanceRef.current.stopLatlng;
        distanceRef.current.line1.setLatLngs([fr, to])
        distanceRef.current.line2.setLatLngs([fr, to])
        distanceRef.current.startLatlng = fr;
        setMeasureDistance({
          direction: Math.round(getRhumbLineBearing(fr, to)),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
        });
      }).addTo(mapRef.current),
      stopMarker: L.circleMarker(latlng, {
        color: '#fff',
        weight: 1,
        fillColor: '#000',
        fillOpacity: 1,
        draggable: true
      }).on('dragend', evt => {
        let fr = distanceRef.current.startLatlng;
        let to = evt.target.getLatLng();
        distanceRef.current.line1.setLatLngs([fr, to])
        distanceRef.current.line2.setLatLngs([fr, to])
        distanceRef.current.stopLatlng = to;
        setMeasureDistance({
          direction: Math.round(getRhumbLineBearing(fr, to)),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
        });
      }).addTo(mapRef.current)
    };
    setMeasureDistance({
      direction: Math.round(getRhumbLineBearing(distanceRef.current.startLatlng, latlng)),
      distance: Math.round(convertDistance(getDistance(distanceRef.current.startLatlng, latlng), 'sm'))
    });
  }

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
        actions: [{
          name: 'Mesure distance from this point',
          onClick: () => {
            setMeasureDistance(true);
            distanceRef.current = { startLatlng: evt.latlng };
          }
        }]
      });
    });
    mapRef.current.on('click', (evt) => {
      if (distanceRef.current && !distanceRef.current.stopLatlng) {
        endMeasure(evt.latlng);
      }
    })
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
  React.useEffect(() => {
    // Do not update is map is closed
    if (props.hidden) { return false; }

    // If marker already exists remove it
    if (searchRef.current) {
      searchRef.current.remove();
      searchRef.current = null;
    }

    // Only draw marker if search is not empty
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
      if (prevSearchRef.current !== props.search) {
        setTimeout(() => { searchRef.current && searchRef.current.openPopup() }, 10);
      }
    }

    prevSearchRef.current = props.search;
  }, [
    props.search,
    props.options.icaodata,
    props.options.planes,
    s.display.sim,
    s.display.markers.colors.selected,
    s.display.markers.sizes.selected,
    props.actions,
    props.hidden
  ]);

  // Set search marker on top at each render
  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.bringToFront();
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
  props.actions.current.measureDistance = (latlng) => {
    setMeasureDistance(true);
    distanceRef.current = { startLatlng: latlng };
  }
  props.actions.current.markerClick = (evt) => {
    if (distanceRef.current && !distanceRef.current.stopLatlng) {
      evt.originalEvent.preventDefault();
      evt.originalEvent.stopPropagation();
      endMeasure(evt.latlng);
    }
  }

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
                if (distanceRef.current.line1) {
                  distanceRef.current.line1.remove();
                  distanceRef.current.line2.remove();
                  distanceRef.current.startMarker.remove();
                  distanceRef.current.stopMarker.remove();
                }
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
