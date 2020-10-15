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
          interactive: false,
          stroke: true,
          color: this.props.color,
          weight: this.props.weight
        }
      })
    };
    const patterns = [arrow];
    if (this.props.reverse) {
      const rarrow = {
        offset: '10%',
        endOffset: '10%',
        repeat: 800,
        symbol: L.Symbol.arrowHead({
          headAngle: 300,
          pixelSize: 15,
          polygon: false,
          pathOptions: {
            interactive: false,
            stroke: true,
            color: this.props.color,
            weight: this.props.weight
          }
        })
      };
      patterns.push(rarrow);
    }

    this.obj = L.polylineDecorator(polyline, {
      patterns: patterns
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
    const {weight, color, ...props} = this.props;
    return (
      <React.Fragment>
        <Polyline
          ref={this.polyRef}
          weight={weight}
          color={color}
          positions={props.positions}
        />
        <Polyline
          onMouseOver={(evt) => {
            this.polyRef.current.leafletElement.setStyle({
              color: this.props.highlight
            });
            this.obj.setStyle({
              color: this.props.highlight
            });
          }}
          onMouseOut={(evt) => {
            this.polyRef.current.leafletElement.setStyle({
              color: this.props.color
            });
            this.obj.setStyle({
              color: this.props.color
            });
          }}
          weight={Math.max(weight, 20)}
          opacity={0}
          {...props}
        />
      </React.Fragment>
    );
  }
}

export default withLeaflet(PolylineDecorator);