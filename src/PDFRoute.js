import React from 'react';
import { Page, Text, View, Document, Link, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { getDistance, convertDistance, getRhumbLineBearing } from "geolib";
import { airportSurface, simName } from './util/utility.js';

// Register font
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmSU5vAx05IsDqlA.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9vAx05IsDqlA.ttf',
      fontWeight: 700
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmYUtvAx05IsDqlA.ttf',
      fontWeight: 900
    },
  ]
});


// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: 'Roboto',
    fontSize: 11
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'heavy',
    marginTop: 30,
    marginBottom: 12
  },
  boxtitle: {
    fontSize: 14,
    fontWeight: 'heavy',
    marginBottom: 8
  },
  item: {
    marginTop: 5
  },
  cellHeader: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: 'bold',
    marginRight: 10
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10
  },
  cellFooter: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontWeight: 'bold',
    borderTop: '1px solid black',
    marginRight: 10
  },
  footerPages: {
    position: 'absolute',
    fontSize: 12,
    bottom: 34,
    left: 0,
    right: 0,
    color: 'grey',
    textAlign: 'center'
  },
  footerCopyright: {
    position: 'absolute',
    fontSize: 10,
    bottom: 22,
    left: 0,
    right: 0,
    color: 'grey',
    textAlign: 'center'
  }
});

const Title = ({left, right, nobreak}) => {
  return (
    <View style={styles.title} break={nobreak ? false : true}>
      <View style={{ flexDirection: 'column', fontWeight: 'heavy', paddingVertical: 4 }}>
        <Text>{left}</Text>
      </View>
      <View style={{ flexDirection: 'column', backgroundColor: 'black', paddingHorizontal: 8, paddingVertical: 4, color: 'white' }}>
        <Text>{right}</Text>
      </View>
    </View>
  );
}

function toReadableTime(time) {
  const h = Math.floor(time);
  const min = Math.round((time-h)*60);
  return h+'H'+(min > 9 ? min : "0"+min);
}

// Create Document Component
function PDFRoute({route, icaodata, routeParams, settings}) {
  const legs = [];
  let lastMaxFuel = 9999999999;
  for (var i = route.icaos.length - 1; i > 0 ; i--) {
    const distance = Math.round(convertDistance(getDistance(icaodata[route.icaos[i-1]], icaodata[route.icaos[i]]), 'sm'));
    let pay = 0;
    let pax = 0;
    let kg = 0;
    for (const c of route.cargos[i-1].TripOnly) {
      if (c.to === route.icaos[i]) {
        pay += c.pay;
      }
      pax += c.pax;
      kg += c.kg;
    }
    for (const c of route.cargos[i-1].VIP) {
      if (c.to === route.icaos[i]) {
        pay += c.pay;
      }
      pax += c.pax;
      kg += c.kg;
    }
    const time = distance/route.plane.speed + distance*routeParams.overheadLength/100/route.plane.speed + routeParams.approachLength/(route.plane.speed*0.4);
    const fuelUsage = time * route.plane.GPH;
    let maxFuel = Math.min((route.plane.preciseMaxKg(0) - kg) / 2.68735, lastMaxFuel + fuelUsage);
    lastMaxFuel = maxFuel;
    legs.push({
      from: route.icaos[i-1],
      to: route.icaos[i],
      distance: distance,
      bearing: Math.round(getRhumbLineBearing(icaodata[route.icaos[i-1]], icaodata[route.icaos[i]])),
      totalDistance: Math.round(distance + distance*routeParams.overheadLength/100 + routeParams.approachLength),
      timeGround: toReadableTime(routeParams.idleTime/60),
      timeFlight: toReadableTime(time),
      cargo: route.cargos[i-1].TripOnly,
      VIPcargo: route.cargos[i-1].VIP,
      pay: pay,
      pax: pax,
      kg: kg,
      fuelUsage: Math.ceil(fuelUsage),
      maxFuel: Math.floor(maxFuel)
    });
  }
  legs.reverse();

  return (
    <Document
      title={'Route '+route.icaos[0]+' > '+route.icaos[route.icaos.length - 1]}
      author='FSE Planner'
      creator='FSE Planner'
      producer='FSE Planner'
    >
      <Page style={styles.page}>
        <Title left="GENERAL INFORMATION" right={route.icaos[0]+' > '+route.icaos[route.icaos.length - 1]} nobreak />
        { settings.routeFinder.pdfImage &&
          <Image
            src={settings.routeFinder.pdfImage}
            style={{
              width: "500px",
              height: "180px",
              marginLeft: 11
            }}
          />
        }
        <Text style={styles.subtitle}>ROUTE</Text>
        <Text style={styles.item}>{route.icaos.length - 1} leg{route.icaos.length > 2 && 's'}</Text>
        <Text style={styles.item}>Path: {route.icaos.join(' ')}</Text>
        <Text style={styles.item}>Distance: {route.distance}NM</Text>
        <Text style={styles.item}>Duration: {route.time}</Text>
        <Text style={styles.subtitle}>AIRCRAFT</Text>
        <Text style={styles.item}>Model: {route.plane.model ? route.plane.model : 'Unknown'}</Text>
        {
          route.reg &&
            <Text style={styles.item}>Registration: {route.reg}</Text>
        }
        <Text style={styles.item}>Fuel usage: {route.fuel} gallons</Text>
        <Text style={styles.subtitle}>REVENUE</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
          <View style={{ flexDirection: 'column', marginRight: 12 }}>
            <Text style={styles.cell}>Income</Text>
            <Text style={styles.cell}>Ground Crew Fee</Text>
            <Text style={styles.cell}>Booking Fee</Text>
            <Text style={styles.cell}>Rental cost</Text>
            <Text style={styles.cell}>Distance bonus</Text>
            <Text style={styles.cell}>Fuel cost</Text>
            <Text style={styles.cellFooter}>Estimated total earnings</Text>
          </View>
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Text style={styles.cell}>&nbsp;</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>-</Text>
            <Text style={styles.cell}>{route.b < 0 ? '-' : '+'}</Text>
            <Text style={styles.cell}>-</Text>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.cell}>${route.grossPay}</Text>
            <Text style={styles.cell}>${route.feeGround}</Text>
            <Text style={styles.cell}>${route.feeBooking}</Text>
            <Text style={styles.cell}>${route.rentalCost}</Text>
            <Text style={styles.cell}>${Math.abs(route.b)}</Text>
            <Text style={styles.cell}>${route.fuelCost}</Text>
            <Text style={styles.cellFooter}>${route.grossPay - route.feeGround - route.feeBooking - route.rentalCost + route.b - route.fuelCost}</Text>
          </View>
        </View>

        {
          legs.map((leg, i) =>
            <React.Fragment key={i}>
              <Title left={'LEG #'+(i+1)} right={leg.from+' > '+leg.to} />
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexGrow: 1, flexBasis: 0, flexDirection: 'column', marginRight: 10, border: '1px solid black', paddingVertical: 10, paddingHorizontal: 12 }}>
                  <Text style={styles.boxtitle}>Depart: <Link src={'https://server.fseconomy.net/airport.jsp?icao='+leg.from}>{leg.from}</Link></Text>
                  <Text style={styles.item}>Runway: {icaodata[leg.from].runway} feet of {airportSurface(icaodata[leg.from].surface)}</Text>
                  <Text style={styles.item}>Coordinates: {Math.abs(icaodata[leg.from].lat)+(icaodata[leg.from].lat >= 0 ? 'N' : 'S')} {Math.abs(icaodata[leg.from].lon)+(icaodata[leg.from].lon >= 0 ? 'E' : 'W')}</Text>
                  <Text style={styles.item}>Elevation: {icaodata[leg.from].elev} feet</Text>
                  { icaodata[leg.from][settings.display.sim][0] !== leg.from &&
                    <Text style={{fontWeight: 'bold', ...styles.item}}>
                      {leg.from} does not exist in {simName(settings.display.sim)}.
                      { icaodata[leg.from][settings.display.sim][0] === null && icaodata[leg.from][settings.display.sim].length === 1 ?
                          ' There is no alternative airport in the simulator.'
                        :
                          ' You may instead take off from: '+icaodata[leg.from][settings.display.sim].filter(elm => elm !== null).join(' ')
                      }
                    </Text>
                  }
                </View>
                <View style={{ flexGrow: 1, flexBasis: 0, flexDirection: 'column', marginLeft: 10, border: '1px solid black', paddingVertical: 10, paddingHorizontal: 12 }}>
                  <Text style={styles.boxtitle}>Arrival: <Link src={'https://server.fseconomy.net/airport.jsp?icao='+leg.to}>{leg.to}</Link></Text>
                  <Text style={styles.item}>Runway: {icaodata[leg.to].runway} feet of {airportSurface(icaodata[leg.to].surface)}</Text>
                  <Text style={styles.item}>Coordinates: {Math.abs(icaodata[leg.to].lat)+(icaodata[leg.to].lat >= 0 ? 'N' : 'S')} {Math.abs(icaodata[leg.to].lon)+(icaodata[leg.to].lon >= 0 ? 'E' : 'W')}</Text>
                  <Text style={styles.item}>Elevation: {icaodata[leg.to].elev} feet</Text>
                  { icaodata[leg.to][settings.display.sim][0] !== leg.to &&
                    <Text style={{fontWeight: 'bold', ...styles.item}}>
                      {leg.to} does not exist in {simName(settings.display.sim)}.
                      { icaodata[leg.to][settings.display.sim][0] === null && icaodata[leg.to][settings.display.sim].length === 1 ?
                          ' There is no alternative airport in the simulator.'
                        :
                          ' You may instead land at: '+icaodata[leg.to][settings.display.sim].filter(elm => elm !== null).join(' ')
                      }
                    </Text>
                  }
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flexGrow: 1, flexBasis: 0, flexDirection: 'column', marginRight: 10 }}>
                  <Text style={styles.subtitle}>NAVIGATION</Text>
                  <Text style={styles.item}>Bearing: {leg.bearing}°</Text>
                  <Text style={styles.item}>Direct distance: {leg.distance}NM</Text>
                  <Text style={styles.item}>Flight distance: {leg.totalDistance}NM</Text>
                  <Text style={styles.item}>Ground time: {leg.timeGround}</Text>
                  <Text style={styles.item}>Flight time: {leg.timeFlight}</Text>
                </View>
                <View style={{ flexGrow: 1, flexBasis: 0, flexDirection: 'column', marginLeft: 10 }}>
                  <Text style={styles.subtitle}>FUEL</Text>
                  <Text style={styles.item}>Estimated fuel usage: {leg.fuelUsage} gallons</Text>
                  <Text style={styles.item}>Max fuel load: {leg.maxFuel} gallons</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>MANIFEST</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.cellHeader}>Origin</Text>
                  {
                    leg.cargo.map((c, i) => <Text key={i} style={styles.cell}>{c.from}</Text>)
                  }
                  {
                    leg.VIPcargo.map((c, i) => <Text key={i} style={styles.cell}>{c.from}</Text>)
                  }
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.cellHeader}>Destination</Text>
                  {
                    leg.cargo.map((c, i) => <Text key={i} style={styles.cell}>{c.to}</Text>)
                  }
                  {
                    leg.VIPcargo.map((c, i) => <Text key={i} style={styles.cell}>{c.to}</Text>)
                  }
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.cellHeader}>Passengers</Text>
                  {
                    leg.cargo.map((c, i) => c.pax ?
                        <Text key={i} style={styles.cell}>{c.pax} passenger{c.pax > 1 && 's'}</Text>
                      :
                        <Text key={i} style={styles.cell}>&nbsp;</Text>
                    )
                  }
                  {
                    leg.VIPcargo.map((c, i) => c.pax ?
                        <Text key={i} style={styles.cell}>{c.pax} VIP passenger{c.pax > 1 && 's'}</Text>
                      :
                        <Text key={i} style={styles.cell}>&nbsp;</Text>
                    )
                  }
                  <Text style={styles.cellFooter}>{leg.pax} passenger{leg.pax > 1 && 's'}</Text>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.cellHeader}>Cargo</Text>
                  {
                    leg.cargo.map((c, i) => c.pax ?
                        <Text key={i} style={styles.cell}>&nbsp;</Text>
                      :
                        <Text key={i} style={styles.cell}>{c.kg} kg package</Text>
                    )
                  }
                  {
                    leg.VIPcargo.map((c, i) => c.pax ?
                        <Text key={i} style={styles.cell}>&nbsp;</Text>
                      :
                        <Text key={i} style={styles.cell}>{c.kg} kg VIP package</Text>
                    )
                  }
                  <Text style={styles.cellFooter}>{leg.cargo.reduce((acc, c) => c.pax ? acc : acc+c.kg, 0)+leg.VIPcargo.reduce((acc, c) => c.pax ? acc : acc+c.kg, 0)} kg</Text>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.cellHeader}>Weight</Text>
                  {
                    leg.cargo.map((c, i) => c.pax ?
                        <Text key={i} style={styles.cell}>{c.pax*77} kg</Text>
                      :
                        <Text key={i} style={styles.cell}>{c.kg} kg</Text>
                    )
                  }
                  {
                    leg.VIPcargo.map((c, i) => c.pax ?
                        <Text key={i} style={styles.cell}>{c.pax*77} kg</Text>
                      :
                        <Text key={i} style={styles.cell}>{c.kg} kg</Text>
                    )
                  }
                  <Text style={styles.cellFooter}>{leg.kg} kg</Text>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.cellHeader}>Revenue</Text>
                  {
                    leg.cargo.map((c, i) => <Text key={i} style={styles.cell}>{c.to === leg.to ? '$'+c.pay : '-' }</Text>)
                  }
                  {
                    leg.VIPcargo.map((c, i) => <Text key={i} style={styles.cell}>{c.to === leg.to ? '$'+c.pay : '-' }</Text>)
                  }
                  <Text style={styles.cellFooter}>${leg.pay}</Text>
                </View>
              </View>
              {leg.kg === 0 && <Text style={styles.item}>This is a ferry leg with no assignment.</Text>}
              {leg.pax < route.plane.maxPax ?
                  <Text style={styles.item}>{route.plane.maxPax - leg.pax} seat{route.plane.maxPax - leg.pax > 1 && 's'} available</Text>
                :
                  <Text style={styles.item}>No seat available</Text>
              }
              <Text style={styles.item}>{route.plane.preciseMaxKg(0) - leg.kg} kg available for fuel</Text>
            </React.Fragment>

          )
        }



        <Text style={styles.footerCopyright} fixed>This route was generated by <Link src="https://fse-planner.piero-la-lune.fr">FSE Planner</Link></Text>
        <Text style={styles.footerPages} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
}


export default PDFRoute;
