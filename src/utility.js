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
          (
              s.onlyMSFS
            &&
              icaodata[icao].msfs[0] === null
          )
      )
  );
}