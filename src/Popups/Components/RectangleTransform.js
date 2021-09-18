import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-path-transform";

function RectangleTransform(props) {
  const map = React.useRef(useMap());
  const objRef = React.useRef();
  const boundsRef = React.useRef(props.bounds);
  const onUpdateRef = React.useRef(props.onUpdate);

  React.useEffect(() => {
    objRef.current = L.rectangle(boundsRef.current, {transform: true, draggable: true});
    objRef.current.addTo(map.current);
    objRef.current.transform.enable({rotation: false, scaling: true, uniformScaling: false});
    objRef.current.dragging.enable();
    objRef.current.on('transformed', () => onUpdateRef.current(objRef.current.getBounds()));
    return () => {
      objRef.current.remove();
    }
  }, []);

  return null;
}

export default RectangleTransform;