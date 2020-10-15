import { Component } from "react";
import { withLeaflet } from "react-leaflet";
import L from "leaflet";
import "leaflet-path-transform";

class RectangleTransform extends Component {
  constructor(props) {
    super(props);
    this.map = props.leaflet.map;
    this.obj = null;
  }
  componentDidMount() {
    this.obj = L.rectangle(this.props.bounds, {transform: true, draggable: true }).addTo(this.map);

    this.obj.transform.enable({rotation: false, scaling: true, uniformScaling: false});
    this.obj.dragging.enable();

    if (this.props.onUpdate) {
      this.obj.on('transformed', () => this.props.onUpdate(this.obj.getBounds()));
    }
    
  }
  componentWillUnmount() {
    if (this.obj) {
      this.obj.remove();
    }
  }

  render() {
    return null;
  }
}

export default withLeaflet(RectangleTransform);