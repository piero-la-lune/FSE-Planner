import React from 'react';
import Paper from '@material-ui/core/Paper';
import LayersIcon from '@material-ui/icons/Layers';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Tooltip from '@material-ui/core/Tooltip';
import Alert from '@material-ui/lab/Alert';
import ShareIcon from '@material-ui/icons/Share';
import { makeStyles } from '@material-ui/core/styles';

import { getBounds } from "geolib";
import {default as _clone} from 'lodash/cloneDeep';

import ZonesLayer from "./Zones.js";
import JobsLayer from "./Jobs.js";
import RouteLayer from "./Route.js";
import AirportsLayer from "./Airports.js";
import GPSLayer from "./GPS.js";
import AirportFilter from "./AirportFilter.js";
import { simName, hideAirport } from "../utility.js";
import Storage from "../Storage.js";

const storage = new Storage();


const useStylesBasemapBtn = makeStyles(theme => ({
  span: {
    display: 'inline-block',
    position: 'relative',
    borderRadius: 8,
    padding: 2,
    margin: '0px 8px',
    border: '2px solid #fff',
    cursor: 'pointer',
    transition: 'all .1s ease-in',
    '&:hover img': {
      filter: 'brightness(0.95)'
    },
    '&:hover p': {
      background: theme.palette.primary.main,
      color: '#fff',
    }
  },
  spanS: {
    borderColor: theme.palette.secondary.main,
  },
  img: {
    display: 'block',
    borderRadius: 5,
    transition: 'all .1s ease-in'
  },
  label: {
    position: 'absolute',
    top: 2,
    left: 2,
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '4px 0 4px 0',
    padding: '1px 4px',
    fontSize: '0.7rem',
    transition: 'all .1s ease-in'
  }
}));

function BasemapBtn(props) {
  const classes = useStylesBasemapBtn();

  return (
    <span className={classes.span+' '+(props.selected ? classes.spanS : '')} onClick={props.onClick}>
      <img className={classes.img} src={props.src} alt={props.label} />
      <Typography variant="body2" className={classes.label}>{props.label}</Typography>
    </span>
  )
}

const useStylesLayer = makeStyles(theme => ({
  div: {
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
      color: theme.palette.primary.main
    },
    '&:hover button': {
      display: 'block'
    }
  },
  span: {
    display: 'inline-block',
    position: 'relative',
    borderRadius: 8,
    padding: 2,
    border: '2px solid #fff',
    transition: 'all .1s ease-in'
  },
  spanS: {
    borderColor: theme.palette.secondary.main
  },
  img: {
    display: 'block',
    borderRadius: 5,
    transition: 'all .1s ease-in'
  },
  label: {
    lineHeight: 1,
    transition: 'all .1s ease-in'
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  divImg: {
    width: 50,
    height: 50,
    borderRadius: 5,
    transition: 'all .1s ease-in',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  delete: {
    position: 'absolute',
    top: -8,
    right: 12,
    background: '#fff',
    display: 'none',
    '&:hover': {
      background: '#fff'
    },
    '&:hover span': {
      color: '#000'
    }
  },
  edit: {
    position: 'absolute',
    top: -8,
    left: 12,
    background: '#fff',
    display: 'none',
    '&:hover': {
      background: '#fff'
    },
    '&:hover span': {
      color: '#000'
    }
  }
}));

function Layer(props) {
  const classes = useStylesLayer();
  return (
    <div className={classes.div} onClick={() => props.onChange(!props.visible)} onContextMenu={props.onContextMenu}>
      <span className={classes.span+' '+(props.visible ? classes.spanS : '')}>
        {props.img ?
          <img className={classes.img} src={props.img} alt={props.label} />
        :
          <div className={classes.divImg} style={{backgroundColor: props.color ? props.color : 'transparent'}}>
            {props.shared && <ShareIcon />}
          </div>
        }
        {props.loading && <CircularProgress size={24} thickness={10} color="secondary" className={classes.progress} disableShrink />}
      </span>
      <Typography variant="body2" className={classes.label}>{props.label}</Typography>
      { props.handleRemove &&
        <IconButton
          className={classes.delete}
          onClick={(evt) => {
            evt.stopPropagation();
            props.handleRemove();
          }}
          size="small"
          alt="Remove layer"
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      }
      { props.handleEdit &&
        <IconButton
          className={classes.edit}
          onClick={(evt) => {
            evt.stopPropagation();
            props.handleEdit();
          }}
          size="small"
          alt="Edit layer"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      }
    </div>
  )
}


const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: 22,
    left: 22,
    zIndex: 1001,
    cursor: 'auto',
    borderRadius: '50%',
  },
  'paperHover': {
    borderRadius: '4px',
    padding: '8px 16px 16px 16px',
    width: 320,
    overflow: 'auto',
    maxHeight: 'calc(100% - 60px)'
  },
  layers: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'left',
    gap: '20px 0'
  },
  add: {
    textAlign: 'center',
    marginTop: 16
  },
  contextMenu: {
    minWidth: 200
  },
  contextMenuTitle: {
    margin: theme.spacing(1),
    fontWeight: 'bold'
  },
  contextMenuList: {
    paddingTop: 0
  },
}));

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

  const classes = useStyles();
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
      {visible: l.visible, info: l.layerInfo} :
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
            color: s.display.markers.colors.custom,
            size: s.display.markers.sizes.custom,
            weight: s.display.legs.weights.flight,
            highlight: s.display.legs.colors.highlight,
            siminfo: s.display.sim,
            actions: props.actions,
            connections: s.display.legs.display.custom ? connections : undefined,
            id: "custom"
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
              siminfo: s.display.sim,
              sim: s.display.sim,
              actions: props.actions,
              id: "sim"
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
            id: layerRef.id
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
            color: layerRef.color ? layerRef.color : s.display.markers.colors.fse,
            size: layerRef.size ? layerRef.size : s.display.markers.sizes.fse,
            weight: s.display.legs.weights.flight,
            highlight: s.display.legs.colors.highlight,
            airportFilter: layerRef.filter ? layerRef.filter : s.airport,
            forsale: forsaleRef.current === null ? null : Object.fromEntries(forsaleRef.current),
            siminfo: s.display.sim,
            actions: props.actions,
            connections: layerRef.connections ? layerRef.connections : undefined,
            id: layerRef.id ? layerRef.id : "fse"
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
  const layerFactory = (l) => {
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
      id: (Math.random() + 1).toString(36).substring(7),
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
          const ll = layerFactory(l.info);
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
    if (layersRef.current[i].layer) {
      layersRef.current[i].layer.remove();
    }
    layersRef.current.splice(i, 1);
    orderRef.current = orderRef.current.filter(elm => elm !== i);
    orderRef.current = orderRef.current.map(elm => elm > i ? elm-1 : elm);
    updateLocalStorage();
    forceUpdate();
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
        name: "Remove",
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
      }
      if (layer.src !== 'gps') {
        actions.push({
          name: "Download data",
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
      className={classes.paper+' '+(hover || openFilter ? classes.paperHover : '')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onContextMenu={evt => { evt.preventDefault() }}
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
        <div>
          <Typography variant="h6" gutterBottom>Basemap</Typography>
          <BasemapBtn src={imgs[0]} selected={basemap === 0} onClick={() => setBasemapId(0)} label="Default" />
          <BasemapBtn src={imgs[1]} selected={basemap === 1} onClick={() => setBasemapId(1)} label="Alternative" />
          <Typography variant="h6" gutterBottom style={{marginTop: 16}}>
            Layers
          </Typography>
          <div className={classes.layers}>
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
          </div>
          <div className={classes.add}>
            <Button
              color="primary"
              startIcon={<AddIcon />}
              size="small"
              onClick={() => setOpenFilter(true)}
            >
              New layer
            </Button>
          </div>
        </div>
      :
        <IconButton><LayersIcon /></IconButton>
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
          classes={{paper:classes.contextMenu}}
        >
          <Typography variant="body1" className={classes.contextMenuTitle}>{contextMenu.title}</Typography>
          {contextMenu.actions.length > 0 &&
            <MenuList className={classes.contextMenuList}>
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
                    >
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
                        >
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
    </Paper>
  );

}

export default LayerControl;