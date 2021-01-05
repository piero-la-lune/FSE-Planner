import icaodata from "./data/icaodata-with-zones.json";

export function hideAirport(icao, s) {
  return (
      s
    &&
      (
          icaodata[icao].size < s.size[0]
        ||
          icaodata[icao].size > s.size[1]
        ||
          icaodata[icao].runway < s.runway[0]
        ||
          icaodata[icao].runway > s.runway[1]
        ||
          !s.surface.includes(icaodata[icao].surface)
        ||
          (
              s.onlyMSFS
            &&
              icaodata[icao].msfs[0] === null
          )
      )
  );
}

export function airportSurface(surface) {
  switch (surface) {
    case 1: return "Asphalt"
    case 2: return "Concrete"
    case 3: return "Coral"
    case 4: return "Dirt"
    case 5: return "Grass"
    case 6: return "Gravel"
    case 7: return "Helipad"
    case 8: return "Oil Treated"
    case 9: return "Snow"
    case 10: return "Steel Mats"
    default: return "Water"
  }
}