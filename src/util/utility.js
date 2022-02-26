import icaodata from "../data/icaodata.json";
import aircrafts from "../data/aircraft.json";

export function hideAirport(icao, s, sim) {
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
              s.onlySim
            &&
              icaodata[icao][sim][0] === null
          )
        ||
          (
              s.onlyBM
            &&
              icaodata[icao].size < 5000
          )
        ||
          (
              s.onlyILS
            &&
              !icaodata[icao].ils
          )
        ||
          (
              s.excludeMilitary
            &&
              icaodata[icao].type === 'military'
          )
      )
  );
}

export function airportSurface(surface) {
  switch (surface) {
    case 1: return "Asphalt"
    case 2: return "Concrete"
    case 3: return "Dirt"
    case 4: return "Grass"
    case 5: return "Gravel"
    case 6: return "Helipad"
    case 7: return "Snow"
    default: return "Water"
  }
}

export function simName(id) {
  switch (id) {
    case 'msfs': return "MSFS"
    case 'xplane': return "X-Plane 11.55"
    default: return "FSX"
  }
}

export function wrap(num, center) {
  if (num < center-180) { return 360; }
  if (num >= center+180) { return -360; }
  return 0;
}

export class Plane {
  constructor(model, specs = undefined) {
    if (aircrafts[model]) {
      const p = aircrafts[model];
      this.model = model;
      this.crew = p.Crew;
      // Total plane seats - 1 seat for pilot - 1 seat if additionnal crew
      this.maxPax = p.Seats - (p.Crew > 0 ? 2 : 1);
      this.fuelCapacity = (p.Ext1 + p.LTip + p.LAux + p.LMain + p.Center1
                         + p.Center2 + p.Center3 + p.RMain + p.RAux
                         + p.RTip + p.RExt2);
      this.speed = p.CruiseSpeed;
      this.GPH = p.GPH;
      this.fuelType = p.FuelType;
      this.MTOW = p.MTOW;
      this.emptyWeight = p.EmptyWeight;
      // Plane range: maximum length of a single leg
      this.range = Math.round(this.fuelCapacity / p.GPH * p.CruiseSpeed);
      // Compute fuel weight in kg at 25% fuel load
      const fuelKg = 0.25 * 2.68735 * this.fuelCapacity;
      // Max total weight - Empty plane weight - Weight of pilot and crew - Weight of fuel at 25% load
      this.maxKg = Math.floor(this.MTOW - this.emptyWeight - 77*(1+this.crew) - fuelKg);
    }
    else {
      this.model = model;
      this.crew = 0;
      this.maxPax = 0;
      this.fuelCapacity = 0;
      this.speed = 0;
      this.GPH = 0;
      this.fuelType = 0;
      this.MTOW = 0;
      this.emptyWeight = 0;
      this.range = 0;
      this.maxKg = 0;
    }
    if (specs) {
      if (specs.maxPax) {
        this.maxPax = specs.maxPax;
      }
      if (specs.speed) {
        this.speed = specs.speed;
      }
      if (specs.GPH) {
        this.GPH = specs.GPH;
      }
      if (specs.fuelType) {
        this.fuelType = specs.fuelType;
      }
      if (specs.range) {
        this.range = specs.range;
      }
      if (specs.maxKg) {
        this.maxKg = specs.maxKg;
      }
    }
  }
  preciseMaxKg(tank) {
    // Compute fuel weight in kg at given fuel load
    const fuelKg = tank * 2.68735 * this.fuelCapacity;
    // Max total weight - Empty plane weight - Weight of pilot and crew - Weight of fuel at 25% load
    return this.MTOW - this.emptyWeight - 77*(1+this.crew) - fuelKg;
  }
}
