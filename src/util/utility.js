import icaodata from "../data/icaodata.json";
import aircrafts from "../data/aircraft.json";

import { getDistance, getRhumbLineBearing, convertDistance } from "geolib";

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



// Filters non complying legs
export function cleanLegs(jobs, opts) {
  const keys = Object.keys(jobs);
  let legs = {};
  let max = 0;
  // Get legs
  for (var i = keys.length - 1; i >= 0; i--) {
    const leg = jobs[keys[i]];
    const [frIcao, toIcao] = keys[i].split('-');
    const fr = { latitude: opts.icaodata[frIcao].lat, longitude: opts.icaodata[frIcao].lon };
    const to = { latitude: opts.icaodata[toIcao].lat, longitude: opts.icaodata[toIcao].lon };

    // Filter out airports not meeting criterias
    if (hideAirport(frIcao, opts.settings.airport, opts.settings.display.sim) || hideAirport(toIcao, opts.settings.airport, opts.settings.display.sim)) { continue; }

    // Filter out jobs based on distance
    if (opts.minDist && leg.distance < opts.minDist) { continue; }
    if (opts.maxDist && leg.distance > opts.maxDist) { continue; }

    // Filter out wrong types of jobs
    if (!leg.hasOwnProperty(opts.cargo) || !leg[opts.cargo].hasOwnProperty(opts.type)) { continue; }

    // Filter out jobs with wrong direction
    if (opts.fromIcao) {
      const fromIcaoFilter = { latitude: opts.icaodata[opts.fromIcao].lat, longitude: opts.icaodata[opts.fromIcao].lon };
      if (opts.settings.from.distCoef !== '') {
        if (getDistance(fromIcaoFilter, to)/getDistance(fromIcaoFilter, fr) < parseFloat(opts.settings.from.distCoef)) { continue; }
      }
      if (opts.settings.from.maxDist !== '') {
        if (convertDistance(getDistance(fromIcaoFilter, fr), 'sm') > parseFloat(opts.settings.from.maxDist)) { continue; }
      }
      if (opts.settings.from.angle !== '') {
        if (opts.fromIcao !== frIcao && 180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(fromIcaoFilter, fr)) - 180) > parseInt(opts.settings.from.angle)) { continue; }
      }
    }
    if (opts.toIcao) {
      const toIcaoFilter = { latitude: opts.icaodata[opts.toIcao].lat, longitude: opts.icaodata[opts.toIcao].lon };
      if (opts.settings.to.distCoef !== '') {
        if (getDistance(toIcaoFilter, fr)/getDistance(toIcaoFilter, to) < parseFloat(opts.settings.to.distCoef)) { continue; }
      }
      if (opts.settings.to.maxDist !== '') {
        if (convertDistance(getDistance(toIcaoFilter, to), 'sm') > parseFloat(opts.settings.to.maxDist)) { continue; }
      }
      if (opts.settings.to.angle !== '') {
        if (opts.toIcao !== toIcao && 180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(to, toIcaoFilter)) - 180) > parseInt(opts.settings.to.angle)) { continue; }
      }
    }
    if (opts.direction) {
      if (180 - Math.abs(Math.abs(leg.direction - opts.direction) - 180) > parseInt(opts.settings.direction.angle)) { continue; }
    }

    const filteredJobs = leg[opts.cargo][opts.type].filter(job => {
      // Filter out bad payed jobs
      if (opts.minJobPay && job.pay < opts.minJobPay) { return false; }
      // Filter out jobs too big for plane
      if (opts.max && job.nb > opts.max) { return false; }
      // Filter out jobs with not enought cargo
      if (opts.type !== 'Trip-Only' && opts.min && job.nb < opts.min) { return false; }
      return true;
    });
    if (filteredJobs.length < 1) { continue; }

    // Compute total amount and pay
    const [amount, pay] = filteredJobs.reduce(([amount, pay], job) => [amount+job.nb, pay+job.pay], [0, 0]);

    // Filter out bad payed legs
    if (opts.minLegPay && pay < opts.minLegPay) { continue; }
    // Filter out legs with not enougth pax/kg
    if (opts.min && amount < opts.min) { continue; }

    legs[keys[i]] = {
      amount: amount,
      pay: pay,
      direction: leg.direction,
      distance: leg.distance,
      filteredJobs: filteredJobs
    };

    max = Math.max(max, amount);
  }
  // Only keep top x% paying jobs
  if (opts.percentPay) {
    const values = [];
    // Compute each leg pay / amount / distance
    Object.values(legs).forEach(leg => {
      leg.pay_r = leg.pay/leg.amount/leg.distance
      values.push(leg.pay_r);
    });
    values.sort((a, b) => a - b);
    // Get values index
    const index = Math.floor(values.length*(1-parseInt(opts.percentPay)/100)) - 1;
    // Get min pay
    const min_pay = values[Math.min(Math.max(index, 0), values.length-1)];
    // Filter out jobs
    Object.keys(legs).filter(icao => legs[icao].pay_r < min_pay).forEach(icao => delete legs[icao]);
  }
  return [legs, max];
}


// cargo: {pax, kg, pay}
export function maximizeTripOnly(i, cargos, max) {
  if (i === 0) {
    // Total pay, list of cargos, remain
    return [0, 0, [], []];
  }
  const elm = cargos[i-1];
  const [pay1, nb1, cargos1, remain1] = maximizeTripOnly(i-1, cargos, max);
  if (max-elm.nb >= 0)  {
    let [pay2, nb2, cargos2, remain2] = maximizeTripOnly(i-1, cargos, max-elm.nb);
    pay2 += elm.pay;
    if (pay2 > pay1) {
      return [pay2, nb2+elm.nb, [...cargos2, elm], remain2];
    }
  }
  return [pay1, nb1, cargos1, [...remain1, elm]];
}
