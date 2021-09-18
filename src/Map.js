import React from 'react';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import { getBounds } from "geolib";
import L from "leaflet";

import Canvas from "./MapLayers/Components/Canvas.js";
import JobsLayer from "./MapLayers/Jobs.js";
import RouteLayer from "./MapLayers/Route.js";
import ZonesLayer from "./MapLayers/Zones.js";
import AirportsLayer from "./MapLayers/Airports.js";
import Marker from "./MapLayers/Components/Marker.js";

const useStyles = makeStyles(theme => ({
  contextMenu: {
    minWidth: 200
  },
  contextMenuTitle: {
    margin: theme.spacing(1),
    fontWeight: 'bold'
  },
  contextMenuList: {
    paddingTop: 0
  }
}));

const FSEMap = React.memo(function FSEMap(props) {

  const s = props.options.settings;
  const mapRef = props.mapRef;
  const classes = useStyles();
  const canvasRendererRef = React.useRef(new Canvas({ padding: 0.5 }));
  const maxBounds=[[-90, s.display.map.center-180], [90, s.display.map.center+180]];
  const [contextMenu, setContextMenu] = React.useState(null);
  const [unbuiltFBOs, setUnbuildFBOs] = React.useState([]);
  const [simIcaodata, setSimIcaodata] = React.useState({icaos: [], data: {}});

  // Display search marker
  const searchRef = React.useRef(null);
  const prevSearchRef = React.useRef(null);
  React.useEffect(() => {
    if (!mapRef.current) { return; }

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
    props.actions,
    mapRef
  ]);

  // Load sim data
  React.useEffect(() => {
    fetch('sim/'+s.display.sim+'.json').then(response => {
      if (response.ok) {
        response.json().then(obj => {
          setSimIcaodata({icaos: Object.keys(obj), data: obj});
        });
      }
    });
  }, [s.display.sim]);

  // Set search marker on top at each render
  React.useEffect(() => {
    if (searchRef.current) {
      searchRef.current.bringToFront();
    }
  }, [props.options]);

  // Clear canvas cache on settings change
  React.useEffect(() => {
    canvasRendererRef.current.clearCache();
  }, [s]);


  // Auto zoom map on jobs
  React.useEffect(() => {
    if (!mapRef.current) { return; }
    const icaos = new Set();
    Object.keys(props.options.jobs).forEach(key => icaos.add(key.split('-')[0]));
    const points = [...icaos].map(elm => props.options.icaodata[elm]);
    if (points.length > 4) {
      const b = getBounds(points);
      mapRef.current.fitBounds([[b.minLat, b.minLng], [b.maxLat, b.maxLng]], {animate:false});
    }
  }, [props.options.jobs, props.options.icaodata, mapRef]);

  // Auto zoom on route
  React.useEffect(() => {
    if (!mapRef.current) { return; }
    if (props.route) {
      const b = getBounds(props.route.icaos.map(elm => props.options.icaodata[elm]));
      const bounds = L.latLngBounds([b.minLat, b.minLng], [b.maxLat, b.maxLng]);
      const mapBounds = mapRef.current.getBounds();
      if (!mapBounds.contains(bounds)) {
        mapRef.current.fitBounds(mapBounds.extend(bounds));
      }
    }
  }, [props.route, props.options.icaodata, mapRef]);

  // Load unbuilt lots
  React.useEffect(() => {
    fetch(process.env.REACT_APP_DYNAMIC_DATA_URL+'unbuilt.json').then(response => {
      if (response.ok) {
        response.json().then(arr => {
          setUnbuildFBOs(arr);
        });
      }
    });
  }, []);


  props.actions.current.contextMenu = setContextMenu;

  const closeContextMenu = () => {
    setContextMenu(null);
  };


  return (
    <MapContainer
      center={[46.5344, 3.42167]}
      zoom={6}
      maxBounds={maxBounds}
      attributionControl={false}
      minZoom={2}
      maxZoom={12}
      renderer={canvasRendererRef.current}
      whenCreated={(map) => {
        map.on('contextmenu', (evt) => {
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
        });
        mapRef.current = map
      }}
    >
      {contextMenu &&
        <Popover
          open={true}
          onClose={closeContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            { top: contextMenu.mouseY, left: contextMenu.mouseX }
          }
          onContextMenu={(evt) => {evt.preventDefault(); evt.stopPropagation();}}
          classes={{paper:classes.contextMenu}}
        >
          <Typography variant="body1" className={classes.contextMenuTitle}>{contextMenu.title}</Typography>
          {contextMenu.actions.length > 0 &&
            <MenuList className={classes.contextMenuList}>
              { contextMenu.actions.map((action, i) =>
                <MenuItem dense key={i} onClick={() => { action.onClick(); closeContextMenu(); }}>{action.name}</MenuItem>
              )}
            </MenuList>
          }
        </Popover>
      }
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayersControl position="topleft">
        <LayersControl.Overlay name="FSE airports" checked={true}>
          <AirportsLayer
            icaos={props.icaos}
            icaodata={props.options.icaodata}
            fseicaodata={props.options.icaodata}
            color={s.display.markers.colors.fse}
            size={s.display.markers.sizes.fse}
            airportFilter={s.airport}
            siminfo={s.display.sim}
            actions={props.actions}
            id="fse"
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Unbuilt lots" checked={false}>
          <AirportsLayer
            icaos={unbuiltFBOs}
            icaodata={props.options.icaodata}
            fseicaodata={props.options.icaodata}
            color={s.display.markers.colors.fse}
            size={s.display.markers.sizes.custom}
            airportFilter={s.airport}
            siminfo={s.display.sim}
            actions={props.actions}
            id="fbo"
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Simulator airports" checked={false}>
          <AirportsLayer
            icaos={simIcaodata.icaos}
            icaodata={simIcaodata.data}
            fseicaodata={props.options.icaodata}
            color={s.display.markers.colors.sim}
            size={s.display.markers.sizes.sim}
            siminfo={s.display.sim}
            sim={s.display.sim}
            actions={props.actions}
            id="sim"
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="FSE airports landing area" checked={false}>
          <ZonesLayer
            icaos={props.icaos}
            icaodata={props.options.icaodata}
            renderer={canvasRendererRef.current}
            color={s.display.markers.colors.base}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Job & plane search" checked={true}>
          <JobsLayer
            options={props.options}
            renderer={canvasRendererRef.current}
            actions={props.actions}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Route finder" checked={true}>
          <RouteLayer
            options={props.options}
            renderer={canvasRendererRef.current}
            actions={props.actions}
            route={props.route}
          />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Custom markers" checked={true}>
          <AirportsLayer
            icaos={props.customIcaos}
            icaodata={props.options.icaodata}
            fseicaodata={props.options.icaodata}
            color={s.display.markers.colors.custom}
            size={s.display.markers.sizes.custom}
            weight={s.display.legs.display.custom ? s.display.legs.weights.flight : undefined}
            highlight={s.display.legs.colors.highlight}
            siminfo={s.display.sim}
            actions={props.actions}
            id="custom"
          />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );

});

export default FSEMap;
