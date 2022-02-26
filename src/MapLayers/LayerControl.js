import React from 'react';
import Paper from '@mui/material/Paper';
import LayersIcon from '@mui/icons-material/Layers';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import ShareIcon from '@mui/icons-material/Share';
import Box from '@mui/material/Box';

import { getBounds } from "geolib";
import {default as _clone} from 'lodash/cloneDeep';

import ZonesLayer from "./Zones.js";
import JobsLayer from "./Jobs.js";
import RouteLayer from "./Route.js";
import AirportsLayer from "./Airports.js";
import GPSLayer from "./GPS.js";
import AirportFilter from "./AirportFilter.js";
import { simName, hideAirport } from "../util/utility.js";
import Storage from "../Storage.js";
import uid from "../util/uid.js";

const storage = new Storage();


function BasemapBtn(props) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        position: 'relative',
        borderRadius: '8px',
        padding: '2px',
        margin: '0px 8px',
        border: '2px solid #fff',
        borderColor: props.selected ? 'secondary.main' : '#fff',
        cursor: 'pointer',
        transition: 'all .1s ease-in',
        '&:hover img': {
          filter: 'brightness(0.95)'
        },
        '&:hover p': {
          backgroundColor: 'primary.main',
          color: '#fff',
        }
      }}
      onClick={props.onClick}
    >
      <img
        style={{
          display: 'block',
          borderRadius: '5px',
          transition: 'all .1s ease-in'
        }}
        src={props.src}
        alt={props.label}
      />
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          top: 2,
          left: 2,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '4px 0 4px 0',
          padding: '1px 4px',
          fontSize: '0.7rem',
          transition: 'all .1s ease-in'
        }}>
          {props.label}
        </Typography>
    </Box>
  )
}


function Layer(props) {
  return (
    <Box
      sx={{
        width: 100,
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        '&:hover img': {
          filter: 'brightness(0.95)'
        },
        '&:hover div': {
          filter: 'brightness(0.95)'
        },
        '&:hover p': {
          color: 'primary.main'
        },
        '&:hover .layerBtn': {
          display: 'block'
        }
      }}
      onClick={() => props.onChange(!props.visible)}
      onContextMenu={props.onContextMenu}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          position: 'relative',
          borderRadius: '8px',
          padding: '2px',
          border: '2px solid #fff',
          borderColor: props.visible ? 'secondary.main' : '#fff',
          transition: 'all .1s ease-in'
        }}
      >
        {props.img ?
          <img
            style={{
              display: 'block',
              borderRadius: '5px',
              transition: 'all .1s ease-in'
            }}
            src={props.img}
            alt={props.label}
          />
        :
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '5px',
              transition: 'all .1s ease-in',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backgroundColor: props.color ? props.color : 'transparent'
            }}
          >
            {props.shared && <ShareIcon />}
          </Box>
        }
        {props.loading &&
          <CircularProgress
            size={24}
            thickness={10}
            color="secondary"
            disableShrink
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px'
            }}
          />
        }
      </Box>
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1,
          transition: 'all .1s ease-in'
        }}
      >
        {props.label}
      </Typography>
      { props.handleRemove &&
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: -8,
            right: 12,
            width: 20,
            height: 20,
            padding: '3px',
            borderRadius: '50%',
            background: '#fafafa',
            color: '#777',
            display: 'none',
            '&:hover': {
              color: '#000'
            }
          }}
          className="layerBtn"
          onClick={(evt) => {
            evt.stopPropagation();
            props.handleRemove();
          }}
          alt="Delete layer"
        >
          <CancelIcon fontSize="small" />
        </Box>
      }
      { props.handleEdit &&
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: -8,
            left: 12,
            width: 20,
            height: 20,
            padding: '3px',
            borderRadius: '50%',
            background: '#f4f4f4',
            color: '#777',
            display: 'none',
            '&:hover': {
              color: '#000'
            }
          }}
          className="layerBtn"
          onClick={(evt) => {
            evt.stopPropagation();
            props.handleEdit();
          }}
          alt="Edit layer"
        >
          <EditIcon fontSize="small" />
        </Box>
      }
    </Box>
  )
}


const imgs = [
  "settings/mapDef.png",
  "settings/mapAlt.png",
  "settings/LayerFSE.png",
  "settings/LayerZones.png",
  "settings/LayerSim.png",
  "settings/LayerJobs.png",
  "settings/LayerRoute.png",
  "settings/LayerCustom.png"
];

const defaultLayer = {
  type: null,
  filters: {
    size: [0, 23500],
    surface: [1, 2, 3, 4, 5, 7],
    runway: [0, 30000],
    onlySim: false,
    onlyBM: false,
    onlyILS: false,
    excludeMilitary: false,
    price: [0, 0]
  },
  display: {
    name: 'My custom layer',
    color: '#d4ac0d',
    size: 20
  },
  data: {
    icaos: [],
    connections: [],
    points: []
  }
}

function LayerControl(props) {

  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const s = props.options.settings;
  const [hover, setHover] = React.useState(false);
  const [basemap, setBasemapId] = React.useState(s.display.map.basemap);
  const [loading, setLoading] = React.useState(null);
  const [openFilter, setOpenFilter] = React.useState(false);
  const [layer, setLayer] = React.useState(defaultLayer);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [share, setShare] = React.useState(false);
  const [shareID, setShareID] = React.useState(null);
  const [shareLabel, setShareLabel] = React.useState('');
  const [shareEditID, setShareEditID] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const [confirm, setConfirm] = React.useState({});
  const { setBasemap } = props;
  const layersRef = React.useRef([
    {
      label: "FSE airports",
      visible: false,
      type: 'airports',
      layer: null,
      img: imgs[2],
      src: 'all'
    },
    {
      label: "FSE airports landing area",
      visible: false,
      type: 'zones',
      layer: null,
      img: imgs[3]
    },
    {
      label: simName(s.display.sim)+' airports',
      visible: false,
      type: 'airports-sim',
      layer: null,
      img: imgs[4]
    },
    {
      label: "Job and plane search",
      visible: false,
      type: 'jobs',
      layer: null,
      img: imgs[5]
    },
    {
      label: "Route finder",
      visible: false,
      type: 'route',
      layer: null,
      img: imgs[6]
    },
    {
      label: "Custom markers",
      visible: false,
      type: 'airports-custom',
      layer: null,
      img: imgs[7]
    },
  ]);
  const simIcaodataRef = React.useRef(null);
  const simRef = React.useRef(s.display.sim);
  const loadedRef = React.useRef(false);
  const toUpdateRef = React.useRef([]);
  const orderRef = React.useRef(storage.get('layersOrder', [0, 1, 2, 3, 4, 5]));
  const unbuiltRef = React.useRef(null);
  const forsaleRef = React.useRef(null);
  const layerEditId = React.useRef(null);

  React.useEffect(() => {
    setBasemap(basemap);
  }, [setBasemap, basemap]);

  const updateLocalStorage = React.useCallback(() => {
    const ls = layersRef.current.map(l => l.layerInfo ?
      {visible: l.visible, info: l.layerInfo, id: l.id} :
      {visible: l.visible}
    );
    storage.set('layers', ls);
    storage.set('layersOrder', orderRef.current);
  }, []);

  const showLayer = React.useCallback(id => {
    layersRef.current[id].layer.addTo(props.map);
    layersRef.current[id].visible = true;
    setLoading(null);
    orderRef.current = orderRef.current.filter(elm => elm !== id);
    orderRef.current.push(id);
    updateLocalStorage();
    forceUpdate();
  }, [props.map, updateLocalStorage]);

  const hideLayer = React.useCallback(id => {
    layersRef.current[id].layer.remove();
    layersRef.current[id].visible = false;
    setLoading(null);
    updateLocalStorage();
    forceUpdate();
  }, [updateLocalStorage]);

  const show = React.useCallback((i, checked) => {
    const layerRef = layersRef.current[i];
    setLoading(i);
    if (checked) {
      if (!layerRef.layer) {
        if (layerRef.type === 'zones') {
          fetch('data/zones.json').then(response => {
            if (response.ok) {
              response.json().then(obj => {
                layersRef.current[i].layer = ZonesLayer({zones: obj});
                showLayer(i);
              });
            }
          });
        }
        else if (layerRef.type === 'jobs') {
          layersRef.current[i].layer = JobsLayer({
            options: props.options,
            actions: props.actions
          });
          showLayer(i);
        }
        else if (layerRef.type === 'route') {
          layersRef.current[i].layer = RouteLayer({
            options: props.options,
            actions: props.actions,
            route: props.route
          });
          showLayer(i);
        }
        else if (layerRef.type === 'airports-custom') {
          const connections = [];
          for (var j = 1; j < props.customIcaos.length; j++) {
            connections.push([props.customIcaos[j-1], props.customIcaos[j]]);
          }
          layersRef.current[i].layer = AirportsLayer({
            icaos: props.customIcaos,
            icaodata: props.options.icaodata,
            fseicaodata: props.options.icaodata,
            planes: props.options.planes,
            color: s.display.markers.colors.custom,
            size: s.display.markers.sizes.custom,
            weight: s.display.legs.weights.flight,
            highlight: s.display.legs.colors.highlight,
            colorPlanes: s.display.markers.colors.rentable,
            actions: props.actions,
            connections: s.display.legs.display.custom ? connections : undefined,
            settings: s
          });
          showLayer(i);
        }
        else if (layerRef.type === 'airports-sim') {
          if (!simIcaodataRef.current) {
            fetch('data/'+s.display.sim+'.json').then(response => {
              if (response.ok) {
                response.json().then(obj => {
                  simIcaodataRef.current = {icaos: Object.keys(obj), data: obj};
                  show(i, checked);
                });
              }
            });
          }
          else {
            layersRef.current[i].layer = AirportsLayer({
              icaos: simIcaodataRef.current.icaos,
              icaodata: simIcaodataRef.current.data,
              fseicaodata: props.options.icaodata,
              color: s.display.markers.colors.sim,
              size: s.display.markers.sizes.sim,
              sim: s.display.sim,
              actions: props.actions,
              settings: s
            });
            showLayer(i);
          }
        }
        else if (layerRef.type === 'airports' && layerRef.src === 'gps') {
          layersRef.current[i].layer = GPSLayer({
            points: layerRef.points,
            fseicaodata: props.options.icaodata,
            color: layerRef.color,
            size: layerRef.size,
            weight: s.display.legs.weights.flight,
            highlight: s.display.legs.colors.highlight,
            actions: props.actions,
            connections: layerRef.connections,
            settings: s
          });
          showLayer(i);
        }
        else {
          // Default source is all FSE airports
          let src = props.icaos;
          // If source is unbuilt airports
          if (layerRef.src === 'unbuilt') {
            if (unbuiltRef.current === null) {
              fetch(process.env.REACT_APP_DYNAMIC_DATA_URL+'unbuilt.json').then(response => {
                if (response.ok) {
                  response.json().then(arr => {
                    unbuiltRef.current = arr;
                    show(i, checked);
                  });
                }
              });
              return;
            }
            src = unbuiltRef.current;
          }
          // If source is airports for sale
          else if (layerRef.src === 'forsale') {
            if (forsaleRef.current === null) {
              fetch(process.env.REACT_APP_DYNAMIC_DATA_URL+'forsale.json').then(response => {
                if (response.ok) {
                  response.json().then(arr => {
                    forsaleRef.current = arr;
                    show(i, checked);
                  });
                }
              });
              return;
            }
            src = icaosForSale(forsaleRef.current, layerRef.filter.price);
          }
          // If source is from custom user input
          else if (layerRef.src === 'custom') {
            src = layerRef.icaos;
          }
          layersRef.current[i].layer = AirportsLayer({
            icaos: src,
            icaodata: props.options.icaodata,
            fseicaodata: props.options.icaodata,
            planes: props.options.planes,
            color: layerRef.color ? layerRef.color : s.display.markers.colors.fse,
            size: layerRef.size ? layerRef.size : s.display.markers.sizes.fse,
            weight: s.display.legs.weights.flight,
            highlight: s.display.legs.colors.highlight,
            colorPlanes: s.display.markers.colors.rentable,
            airportFilter: layerRef.filter ? layerRef.filter : s.airport,
            forsale: forsaleRef.current === null ? null : Object.fromEntries(forsaleRef.current),
            actions: props.actions,
            connections: layerRef.connections ? layerRef.connections : undefined,
            settings: s
          });
          showLayer(i);
        }
      }
      else {
        showLayer(i);
      }
    }
    else {
      hideLayer(i);
    }
  }, [
    showLayer,
    hideLayer,
    props.options,
    props.actions,
    props.route,
    props.customIcaos,
    props.icaos,
    s
  ]);

  const resetLayer = React.useCallback(id => {
    const layerRef = layersRef.current[id];
    if (layerRef.layer) {
      layerRef.layer.remove();
      layerRef.layer = null;
    }
    if (layerRef.visible) {
      show(id, true);
    }
  }, [show]);

  // Update jobs
  React.useEffect(() => {
    layersRef.current.forEach((layerRef, id) => {
      if (layerRef.type === 'jobs') {
        toUpdateRef.current.push(id);
      }
    })
  }, [props.options, props.actions]);

  // Update route
  React.useEffect(() => {
    layersRef.current.forEach((layerRef, id) => {
      if (layerRef.type === 'route') {
        toUpdateRef.current.push(id);
      }
    })
  }, [props.options, props.actions, props.route]);

  // Update custom icaos
  React.useEffect(() => {
    layersRef.current.forEach((layerRef, id) => {
      if (layerRef.type === 'airports-custom') {
        toUpdateRef.current.push(id);
      }
    })
  }, [props.options, props.actions, props.customIcaos]);

  // Update sim airports
  React.useEffect(() => {
    const changed = props.options.settings.display.sim !== simRef.current;
    if (changed) {
      simRef.current = props.options.settings.display.sim;
      simIcaodataRef.current = null;
    }
    layersRef.current.forEach((layerRef, id) => {
      if (layerRef.type === 'airports-sim') {
        if (changed) {
          layersRef.current[id].label = simName(props.options.settings.display.sim)+' airports';
        }
        toUpdateRef.current.push(id);
      }
    })
  }, [props.options, props.actions]);

  // Update airports
  React.useEffect(() => {
    layersRef.current.forEach((layerRef, id) => {
      if (layerRef.type === 'airports') {
        toUpdateRef.current.push(id);
      }
    });
  }, [props.options, props.actions, props.icaos]);

  // Apply updates in the right order
  React.useEffect(() => {
    orderRef.current.forEach(id => {
      if (toUpdateRef.current.includes(id)) {
        resetLayer(id);
      }
    });
    toUpdateRef.current = [];
  }, [props.options, props.actions, props.route, props.customIcaos, props.icaos, resetLayer]);

  // Layer factory for custom layers
  const layerFactory = (l, id = null) => {
    if (!id) { id = uid(); }
    return {
      label: l.display.name,
      visible: true,
      type: 'airports',
      layer: null,
      img: null,
      icaos: l.data.icaos,
      connections: l.data.connections,
      points: l.data.points,
      color: l.display.color,
      size: l.display.size,
      filter: l.filters,
      id: id,
      layerInfo: l,
      src: l.type,
      shared: l.shareID ? true : false
    };
  }

  const centerMapOnLayer = React.useCallback((i) => {
    const layer = layersRef.current[i];
    let bounds = [[-30, -100], [50, 100]]
    if (layer.src === 'custom') {
      const points = layer.icaos.map(elm => props.options.icaodata[elm]);
      const b = getBounds(points);
      bounds = [[b.minLat, b.minLng], [b.maxLat, b.maxLng]];
    }
    else if (layer.src === 'gps') {
      const points = layer.points.map(elm => { return {latitude: elm[0], longitude: elm[1]} });
      const b = getBounds(points);
      bounds = [[b.minLat, b.minLng], [b.maxLat, b.maxLng]];
    }
    props.map.fitBounds(bounds, {animate:false});
  }, [props.map, props.options.icaodata])

  // Show default layers and preload images
  React.useEffect(() => {
    if (!loadedRef.current) {
      const ls = storage.get('layers', [{"visible":true},{"visible":false},{"visible":false},{"visible":true},{"visible":true},{"visible":true}]);
      ls.forEach((l, i) => {
        if (l.info) {
          const ll = layerFactory(l.info, l.id);
          layersRef.current.push(ll);
        }
        if (l.visible) {
          layersRef.current[i].visible = true;
        }
        else {
          layersRef.current[i].visible = false;
        }
      });
      // Is layer query param set ?
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('layer');
      // If layer query param is set
      if (id) {
        let found = false;
        // Hide all other layers
        orderRef.current.forEach(i => {
          layersRef.current[i].visible = false;
          // If layer is already loaded, do not add another copy
          if (layersRef.current[i].layerInfo
              && layersRef.current[i].layerInfo.shareID
              && layersRef.current[i].layerInfo.shareID === id) {
            // If edit key is passed too, save it
            const shareEditID = urlParams.get('edit');
            if (shareEditID) {
              layersRef.current[i].layerInfo.shareEditID = shareEditID;
            }
            show(i, true);
            centerMapOnLayer(i);
            found = true;
          }
        });
        // If layer is not already loaded, load it
        if (!found) {
          fetch(process.env.REACT_APP_API_URL+'/layer/'+id).then(response => {
            if (response.ok) {
              response.json().then(arr => {
                if (arr.info) {
                  // Add layer
                  const ll = layerFactory(arr.info);
                  layersRef.current.push(ll);
                  const i = layersRef.current.length - 1;
                  orderRef.current.push(i);
                  // If edit key is passed too, save it
                  const shareEditID = urlParams.get('edit');
                  if (shareEditID) {
                    layersRef.current[i].layerInfo.shareEditID = shareEditID;
                  }
                  show(i, true);
                  centerMapOnLayer(i);
                }
              });
            }
          });
        }
      }
      else {
        //
        orderRef.current.forEach(i => {
          if (layersRef.current[i].visible) {
            show(i, true);
          }
        });
      }
      // Preload images
      imgs.forEach(src => {
        let img = new Image();
        img.src = src;
      });
      loadedRef.current = true;
    }
  }, [show, centerMapOnLayer]);

  // When remove layer icon is clicked
  const removeLayer = React.useCallback((i) => {
    setConfirm({
      title: "Delete layer?",
      msg: 'Are you sure you want to delete this layer?',
      yes: () => {
        if (layersRef.current[i].layer) {
          layersRef.current[i].layer.remove();
        }
        layersRef.current.splice(i, 1);
        orderRef.current = orderRef.current.filter(elm => elm !== i);
        orderRef.current = orderRef.current.map(elm => elm > i ? elm-1 : elm);
        updateLocalStorage();
        forceUpdate();
        setConfirm({});
        setHover(false);
      },
      no: () => {
        setConfirm({});
        setHover(false);
      }
    });
  }, [updateLocalStorage]);

  // When edit layer icon is clicked
  const editLayer = React.useCallback((i) => {
    layerEditId.current = i;
    setLayer(layersRef.current[i].layerInfo);
    setOpenFilter(true);
  }, []);

  // Return list of ICAOs that are in the given price range [min,max]
  const icaosForSale = (arr, price) => {
    const [min, max] = price;
    const icaos = [];
    for (const [icao, p] of arr) {
      if (min && p < min) { continue; }
      if (max && p > max) { continue; }
      icaos.push(icao);
    }
    return icaos;
  }

  // When right click on a layer name
  const openContextMenu = React.useCallback((evt, i) => {
    evt.preventDefault();
    const layer = layersRef.current[i];
    const actions = [];
    if (layer.visible) {
      actions.push({
        name: "Bring to front",
        onClick: () => { resetLayer(i) }
      });
    }
    // Custom layer
    if (!layer.img) {
      if (!layer.shared || layer.layerInfo.shareEditID) {
        actions.push({
          name: "Edit",
          onClick: () => { editLayer(i) }
        });
      }
      actions.push({
        name: "Duplicate",
        onClick: () => {
          const layerInfo = _clone(layer.layerInfo);
          layerInfo.display.name = layerInfo.display.name+' copy';
          delete layerInfo.shareID;
          const ll = layerFactory(layerInfo);
          layersRef.current.push(ll);
          const id = layersRef.current.length - 1;
          orderRef.current.push(id);
          show(id, true);
        }
      });
      actions.push({
        name: "Delete",
        onClick: () => { removeLayer(i) }
      });
      if (!layer.shared) {
        actions.push({
          name: "Share",
          onClick: () => {
            setShare(true);
            setShareLabel(layer.label);
            fetch(process.env.REACT_APP_API_URL+'/layer', {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({version: process.env.REACT_APP_VERSION, info: layer.layerInfo})
            }).then(response => {
              if (response.ok) {
                response.json().then(arr => {
                  if (arr.id && arr.editId) {
                    layersRef.current[i].layerInfo.shareID = arr.id;
                    layersRef.current[i].layerInfo.shareEditID = arr.editId;
                    layersRef.current[i].shared = true;
                    updateLocalStorage();
                    setShareID(arr.id);
                    setShareEditID(arr.editId);
                  }
                });
              }
            });
          }
        });
      }
      else {
        actions.push({
          name: "Shared: get link",
          onClick: () => {
            setShare(true);
            setShareLabel(layer.label);
            setShareID(layer.layerInfo.shareID);
            if (layer.layerInfo.shareEditID) {
              setShareEditID(layer.layerInfo.shareEditID);
            }
          }
        });
        actions.push({
          name: "Pull latest data",
          onClick: () => {
            setLoading(i);
            fetch(process.env.REACT_APP_API_URL+'/layer/'+layer.layerInfo.shareID).then(response => {
              if (response.ok) {
                response.json().then(arr => {
                  if (arr.info) {
                    // Update layer
                    const ll = layerFactory(arr.info, layer.id);
                    layersRef.current[i] = ll;
                    show(i, true);
                  }
                });
              }
            });
          }
        })
      }
      if (layer.src !== 'gps') {
        actions.push({
          name: "Download data (CSV)",
          onClick: () => {
            let src = props.icaos;
            if (layer.src === 'unbuilt') {
              src = unbuiltRef.current;
            }
            else if (layer.src === 'forsale') {
              src = icaosForSale(forsaleRef.current, layer.filter.price);
            }
            else if (layer.src === 'custom') {
              src = layer.icaos;
            }
            src = src.filter(icao => !hideAirport(icao, layer.filter, s.display.sim));
            let csv = "icao,latitude,longitude,name\n";
            for (const icao of src) {
              csv += icao+','+props.options.icaodata[icao].lat+','+props.options.icaodata[icao].lon+','+props.options.icaodata[icao].name+"\n";
            }
            const blob = new Blob([csv], {type: 'text/csv'});
            const a = document.createElement('a');
            a.download = layer.label.replace(/[^a-zA-Z0-9]+/g, "-")+'.csv';
            a.href = window.URL.createObjectURL(blob)
            a.dataset.downloadurl =  ['text/csv', a.download, a.href].join(':');
            a.click();
          }
        });
      }
    }
    setContextMenu({
      mouseX: evt.clientX,
      mouseY: evt.clientY,
      title: layersRef.current[i].label,
      actions: actions
    });
  }, [resetLayer, editLayer, removeLayer, props.options.icaodata, s.display.sim, props.icaos, updateLocalStorage, show]);

  // Close layer share popup
  const handleCloseShare = React.useCallback(() => {
    setShare(false);
    setShareID(null);
    setShareEditID(null);
    setHover(false);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 22,
        left: 22,
        zIndex: 1001,
        cursor: 'auto',
        borderRadius: '50%',
        ...((hover || openFilter) && {
          borderRadius: '4px',
          padding: '8px 16px 16px 16px',
          width: 320,
          overflow: 'auto',
          maxHeight: 'calc(100% - 60px)'
        })
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AirportFilter
        open={openFilter}
        handleSave={(l) => {
          // Close popup and reset to default layer
          setOpenFilter(false);
          setLayer({...defaultLayer});
          // Create layer
          const ll = layerFactory(l);
          let id = null;
          // New layer
          if (layerEditId.current === null) {
            layersRef.current.push(ll);
            id = layersRef.current.length - 1;
            orderRef.current.push(id);
          }
          // Edit layer
          else {
            id = layerEditId.current;
            ll.id = layersRef.current[id].id;
            if (layersRef.current[id].layer) {
              layersRef.current[id].layer.remove();
            }
            if (layersRef.current[id].layerInfo.shareEditID) {
              fetch(process.env.REACT_APP_API_URL+'/layer/'+layersRef.current[id].layerInfo.shareID, {
                method: 'post',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({version: process.env.REACT_APP_VERSION, info: ll.layerInfo, editId: layersRef.current[id].layerInfo.shareEditID})
              }).then(response => {
                if (!response.ok) {
                  alert('Unable to update this shared layer. Check your internet connection or try again later.')
                }
              });
              ll.shared = true;
              ll.layerInfo.shareID = layersRef.current[id].layerInfo.shareID;
              ll.layerInfo.shareEditID = layersRef.current[id].layerInfo.shareEditID;
            }
            layersRef.current[id] = ll;
            layerEditId.current = null;
          }
          resetLayer(id);
          setHover(false);
        }}
        handleCancel={() => {
          layerEditId.current = null;
          setOpenFilter(false);
          setLayer({...defaultLayer});
          setHover(false);
        }}
        layer={layer}
        icaos={props.icaos}
      />
      {hover || openFilter ?
        <Box onContextMenu={evt => { evt.preventDefault() }}>
          <Typography variant="h6" gutterBottom>Basemap</Typography>
          <BasemapBtn src={imgs[0]} selected={basemap === 0} onClick={() => setBasemapId(0)} label="Default" />
          <BasemapBtn src={imgs[1]} selected={basemap === 1} onClick={() => setBasemapId(1)} label="Alternative" />
          <Typography variant="h6" gutterBottom style={{marginTop: 16}}>
            Layers
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'left',
              gap: '20px 0'
            }}
          >
            {layersRef.current.map((elm, i) =>
              <Layer
                label={elm.label}
                visible={elm.visible}
                key={i}
                onChange={checked => show(i, checked)}
                img={elm.img}
                color={elm.color}
                loading={loading === i}
                handleRemove={i > 5 ? () => { removeLayer(i); } : null}
                handleEdit={i > 5 && (!elm.shared || elm.layerInfo.shareEditID) ? () => { editLayer(i); } : null}
                onContextMenu={evt => openContextMenu(evt, i)}
                shared={elm.shared}
              />
            )}
          </Box>
          <Box
            sx={{
              textAlign: 'center',
              marginTop: 2
            }}
          >
            <Button
              color="primary"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => setOpenFilter(true)}
            >
              New layer
            </Button>
          </Box>
        </Box>
      :
        <IconButton size="large"><LayersIcon /></IconButton>
      }
      {contextMenu &&
        <Popover
          open={true}
          onClose={() => setContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={
            { top: contextMenu.mouseY, left: contextMenu.mouseX }
          }
          onContextMenu={(evt) => {evt.preventDefault(); evt.stopPropagation();}}
          sx={{ minWidth: 200 }}
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
            <MenuList sx={{ paddingTop: 0 }}>
              { contextMenu.actions.map((action, i) =>
                <MenuItem dense key={i} onClick={() => { action.onClick(); setContextMenu(null); }}>{action.name}</MenuItem>
              )}
            </MenuList>
          }
        </Popover>
      }
      <Dialog open={share}>
        <DialogTitle>Share "{shareLabel}"</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Read-only link</Typography>
          <Typography variant="body2" style={{margin: '12px 0 24px 0'}}>People with this link will be able to view this custom layer, but not edit it.</Typography>
          <TextField
            label="Read-only URL"
            fullWidth
            readOnly
            value={shareID ? 'https://fse-planner.piero-la-lune.fr/?layer='+shareID : 'Loading...'}
            variant="outlined"
            onFocus={event => {
              event.target.select();
            }}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <Tooltip title={copied ? 'Copied!' : 'Copy URL to clipboard'}>
                    <IconButton
                      disabled={shareID === null}
                      onClick={() => {
                        navigator.clipboard.writeText('https://fse-planner.piero-la-lune.fr/?layer='+shareID)
                        setTimeout(() => setCopied(false), 1000);
                        setCopied(true);
                      }}
                      size="large">
                      <FileCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
            }}
          />
          {
            shareEditID &&
            <div>
              <Typography variant="h6" style={{marginTop: 32}}>Edit link</Typography>
              <Alert severity="warning">You should keep a copy of this link on your computer, you will not be able to recover the link if a data reset happens in your current Internet browser.</Alert>
              <Typography variant="body2" style={{margin: '12px 0 24px 0'}}>People with this link will be able to edit this custom layer.</Typography>
              <TextField
                label="Edit URL"
                fullWidth
                readOnly
                value={'https://fse-planner.piero-la-lune.fr/?edit='+shareEditID+'&layer='+shareID}
                variant="outlined"
                onFocus={event => {
                  event.target.select();
                }}
                InputProps={{
                  endAdornment:
                    <InputAdornment position="end">
                      <Tooltip title={copied ? 'Copied!' : 'Copy URL to clipboard'}>
                        <IconButton
                          onClick={() => {
                            navigator.clipboard.writeText('https://fse-planner.piero-la-lune.fr/?edit='+shareEditID+'&layer='+shareID)
                            setTimeout(() => setCopied(false), 1000);
                            setCopied(true);
                          }}
                          size="large">
                          <FileCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                }}
              />
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShare} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirm.yes ? true : false}
        onClose={confirm.no}
      >
        <DialogTitle>{confirm.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirm.msg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm.no} color="secondary">No</Button>
          <Button onClick={confirm.yes} color="primary" variant="contained" autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );

}

export default LayerControl;
