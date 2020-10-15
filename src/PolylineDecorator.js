import React, { Component } from "react";
import { Polyline, withLeaflet } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";

class PolylineDecorator extends Component {
  constructor(props) {
    super(props);
    this.polyRef = React.createRef();
    this.obj = null;
  }

  componentDidMount() {
    const polyline = this.polyRef.current.leafletElement; //get native Leaflet polyline
    const { map } = this.polyRef.current.props.leaflet; //get native Leaflet map
    const arrow = {
      offset: '10%',
      endOffset: '10%',
      repeat: 800,
      symbol: L.Symbol.arrowHead({
        pixelSize: 15,
        polygon: false,
        pathOptions: {
          stroke: true,
          color: this.props.color,
          weight: this.props.weight
        }
      })
    };

    this.obj = L.polylineDecorator(polyline, {
      patterns: [arrow]
    }).addTo(map);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color || prevProps.weight !== this.props.weight) {
      this.obj.remove();
      this.componentDidMount();
    }
  }

  componentWillUnmount() {
    if (this.obj) {
      this.obj.remove();
    }
  }

  render() {
    return <Polyline ref={this.polyRef} {...this.props} />;
  }
}

export default withLeaflet(PolylineDecorator);