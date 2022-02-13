import React from 'react';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { getBounds } from "geolib";
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
  const basemapRef = React.useRef(null);
  const mapRef = React.useRef(null);

  // Initialize map
  React.useEffect(() => {
    if (mapRef.current) { return; }
    const canvas = new Canvas({ padding: 0.5 });
    mapRef.current = L.map('map', {
      center: [46.5344, 3.42167],
      zoom: 6,
      minZoom: 2,
      maxZoom: 18,
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
        actions: []
      });
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
        actions: props.actions,
        id: 'search'
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
    props.actions
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

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
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
                    return <Divider />
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
          customIcaos={props.customIcaos}
          icaos={props.icaos}
        />
      }
    </Box>
  );

});

export default FSEMap;
