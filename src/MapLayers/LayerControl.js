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
import { makeStyles } from '@material-ui/core/styles';

import ZonesLayer from "./Zones.js";
import JobsLayer from "./Jobs.js";
import RouteLayer from "./Route.js";
import AirportsLayer from "./Airports.js";
import AirportFilter from "./AirportFilter.js";
import { simName } from "../utility.js";



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
    transition: 'all .1s ease-in'
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
    <div className={classes.div} onClick={() => props.onChange(!props.visible)}>
      <span className={classes.span+' '+(props.visible ? classes.spanS : '')}>
        {props.img ?
          <img className={classes.img} src={props.img} alt={props.label} />
        :
          <div className={classes.divImg} style={{backgroundColor: props.color ? props.color : 'transparent'}} />
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
  },
  layers: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'left',
    gap: '20px 0',
    maxWidth: 300
  },
  add: {
    textAlign: 'center',
    marginTop: 16
  }
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
    price: [0, 0]
  },
  display: {
    name: 'My custom layer',
    color: '#d4ac0d',
    size: 20
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
  const { setBasemap } = props;
  const layersRef = React.useRef([
    {
      label: "FSE airports",
      visible: false,
      type: 'airports',
      layer: null,
      img: imgs[2]
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
  const orderRef = React.useRef([0, 1, 2, 3, 4, 5]);
  const unbuiltRef = React.useRef(null);
  const forsaleRef = React.useRef(null);
  const layerEditId = React.useRef(null);

  React.useEffect(() => {
    setBasemap(basemap);
  }, [setBasemap, basemap]);

  const showLayer = React.useCallback(id => {
    layersRef.current[id].layer.addTo(props.map);
    layersRef.current[id].visible = true;
    setLoading(null);
    orderRef.current = orderRef.current.filter(elm => elm !== id);
    orderRef.current.push(id);
    forceUpdate();
  }, [props.map]);

  const hideLayer = React.useCallback(id => {
    layersRef.current[id].layer.remove();
    layersRef.current[id].visible = false;
    setLoading(null);
    forceUpdate();
  }, []);

  const show = React.useCallback((i, checked) => {
    const layerRef = layersRef.current[i];
    setLoading(i);
    if (checked) {
      if (!layerRef.layer) {
        if (layerRef.type === 'zones') {
          setLoading(i);
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
          layersRef.current[i].layer = AirportsLayer({
            icaos: props.customIcaos,
            icaodata: props.options.icaodata,
            fseicaodata: props.options.icaodata,
            color: s.display.markers.colors.custom,
            size: s.display.markers.sizes.custom,
            weight: s.display.legs.display.custom ? s.display.legs.weights.flight : undefined,
            highlight: s.display.legs.colors.highlight,
            siminfo: s.display.sim,
            actions: props.actions,
            id: "custom"
          });
          showLayer(i); 
        }
        else if (layerRef.type === 'airports-sim') {
          if (!simIcaodataRef.current) {
            setLoading(i);
            fetch('data/'+s.display.sim+'.json').then(response => {
              if (response.ok) {
                response.json().then(obj => {
                  simIcaodataRef.current = {icaos: Object.keys(obj), data: obj};
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
        else {
          layersRef.current[i].layer = AirportsLayer({
            icaos: layersRef.current[i].icaos ? layersRef.current[i].icaos : props.icaos,
            icaodata: props.options.icaodata,
            fseicaodata: props.options.icaodata,
            color: layersRef.current[i].color ? layersRef.current[i].color : s.display.markers.colors.fse,
            size: layersRef.current[i].size ? layersRef.current[i].size : s.display.markers.sizes.fse,
            airportFilter: layersRef.current[i].filter ? layersRef.current[i].filter : s.airport,
            forsale: layersRef.current[i].forsale ? layersRef.current[i].forsale : null,
            siminfo: s.display.sim,
            actions: props.actions,
            id: layersRef.current[i].id ? layersRef.current[i].id : "fse"
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

  // Show default layers and preload images
  React.useEffect(() => {
    if (!loadedRef.current) {
      show(0, true);
      show(3, true);
      show(4, true);
      show(5, true);
      imgs.forEach(src => {
        let img = new Image();
        img.src = src;
      });
      loadedRef.current = true;
    }
  }, [show]);

  // When remove layer icon is clicked
  const removeLayer = (i) => {
    layersRef.current[i].layer.remove();
    layersRef.current.splice(i, 1);
    orderRef.current = orderRef.current.map(elm => elm > i ? elm-1 : elm);
    forceUpdate();
  }

  // When edit layer icon is clicked
  const editLayer = (i) => {
    layerEditId.current = i;
    setLayer(layersRef.current[i].layerInfo);
    setOpenFilter(true);
  }

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

  return (
    <Paper
      elevation={3}
      className={classes.paper+' '+(hover || openFilter ? classes.paperHover : '')}
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
          const ll = {
            label: l.display.name,
            visible: true,
            type: 'airports',
            layer: null,
            img: null,
            icaos: [],
            color: l.display.color,
            size: l.display.size,
            filter: l.filters,
            id: (Math.random() + 1).toString(36).substring(7),
            layerInfo: l
          };
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
            layersRef.current[id] = ll;
            layerEditId.current = null;
          }
          if (l.type === 'unbuilt') {
            if (unbuiltRef.current === null) {
              fetch(process.env.REACT_APP_DYNAMIC_DATA_URL+'unbuilt.json').then(response => {
                if (response.ok) {
                  response.json().then(arr => {
                    layersRef.current[id].icaos = arr;
                    unbuiltRef.current = arr;
                    resetLayer(id);
                    setHover(false);
                  });
                }
              });
            }
            else {
              layersRef.current[id].icaos = unbuiltRef.current;
              resetLayer(id);
              setHover(false);
            }
          }
          else if (l.type === 'forsale') {
            if (forsaleRef.current === null) {
              fetch(process.env.REACT_APP_DYNAMIC_DATA_URL+'forsale.json').then(response => {
                if (response.ok) {
                  response.json().then(arr => {
                    layersRef.current[id].icaos = icaosForSale(arr, l.filters.price);
                    layersRef.current[id].forsale = Object.fromEntries(arr);
                    forsaleRef.current = arr;
                    resetLayer(id);
                    setHover(false);
                  });
                }
              });
            }
            else {
              layersRef.current[id].icaos = icaosForSale(forsaleRef.current, l.filters.price);
              layersRef.current[id].forsale = Object.fromEntries(forsaleRef.current);
              resetLayer(id);
              setHover(false);
            }
          }
          else {
            layersRef.current[id].icaos = Object.keys(props.options.icaodata);
            resetLayer(id);
            setHover(false);
          }
        }}
        handleCancel={() => {
          layerEditId.current = null;
          setOpenFilter(false);
          setLayer({...defaultLayer});
          setHover(false);
        }}
        layer={layer}
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
                handleEdit={i > 5 ? () => { editLayer(i); } : null}
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
    </Paper>
  );

}

export default LayerControl;