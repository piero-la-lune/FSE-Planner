import { getDistance, convertDistance, getRhumbLineBearing } from "geolib";

function dist(fr, to, src) {
  return Math.round(convertDistance(getDistance(src[fr].c, src[to].c), 'sm'));
}
function closeIcaos(icao, src, maxDist = 20) {
  const cIcaos = [];
  for (let i of Object.keys(src)) {
    const distance = dist(icao, i, src);
    if (distance < maxDist && i !== icao) {
      cIcaos.push([i, distance]);
    }
  }
  return cIcaos;
}
function maxKgFromDistance(distance, speed, gph, maxKg) {
  // Keep a 20% error margin in fuel quantity
  const fuelKg = (distance / speed) * gph * 2.68735 * 1.2;
  return maxKg - fuelKg;
}
// cargo: {pax, kg, pay}
function maximizeTripOnly(i, cargos, maxPax, maxKg, cache) {
  if (i === 0) {
    // Total pay, list of cargos, remain
    return [0, 0, 0, [], []];
  }
  if (cache[i+'/'+maxPax+'/'+maxKg]) { return cache[i+'/'+maxPax+'/'+maxKg]; }
  const elm = cargos[i-1];
  const [pay1, pax1, kg1, cargos1, remain1] = maximizeTripOnly(i-1, cargos, maxPax, maxKg, cache);
  if (maxPax-elm.pax >= 0 && maxKg-elm.kg >= 0)  {
    let [pay2, pax2, kg2, cargos2, remain2] = maximizeTripOnly(i-1, cargos, maxPax-elm.pax, maxKg-elm.kg, cache);
    pay2 += elm.pay;
    if (pay2 > pay1) {
      return cache[i+'/'+maxPax+'/'+maxKg] = [pay2, pax2+elm.pax, kg2+elm.kg, [...cargos2, elm], remain2];
    }
  }
  return cache[i+'/'+maxPax+'/'+maxKg] = [pay1, pax1, kg1, cargos1, [...remain1, elm]];
}
function maximizeVIP(cargos, maxPax, maxKg) {
  if (cargos.length === 0) {
    return [0, 0, 0, [], []];
  }
  const elm = cargos[0];
  const newCargos = cargos.slice(1);
  const [pay1, pax1, kg1, cargos1, remain1] = maximizeVIP(newCargos, maxPax, maxKg);
  const [pay2, pax2, kg2, cargos2, remain2] = [elm.pay, elm.pax, elm.kg, [elm], newCargos];
  if (pay1 > pay2 || pax2 > maxPax || kg2 > maxKg) {
    remain1.push(elm);
    return [pay1, pax1, kg1, cargos1, remain1];
  }
  return [pay2, pax2, kg2, cargos2, remain2];
}
function maximizeCargo(cargos, maxPax, maxKg) {
  const [pay1, pax1, kg1, cargos1, remain1] = maximizeTripOnly(cargos.TripOnly.length, cargos.TripOnly, maxPax, maxKg, {});
  const [pay2, pax2, kg2, cargos2, remain2] = maximizeVIP(cargos.VIP, maxPax, maxKg);
  const remain = {TripOnly: remain1, VIP: remain2};
  if (pay1 >= pay2) {
    if (cargos2.length > 0) { remain.VIP = remain.VIP.concat(cargos2); }
    return [pay1, pax1, kg1, {TripOnly: cargos1, VIP: []}, remain];
  }
  if (cargos1.length > 0) { remain.TripOnly = remain.TripOnly.concat(cargos1); }
  return [pay2, pax2, kg2, {TripOnly: [], VIP: cargos2}, remain];
}

function bestLegStop(jobs, maxPax, maxKg, exclude) {
  let bestRoute = {payNM: 0, icao: null};
  for (const [i, totalDistance, j] of jobs) {
    if (exclude.includes(i)) { continue; }

    // Compute best load
    const bestLoad = maximizeTripOnly(j.cargos.TripOnly.length, j.cargos.TripOnly, maxPax, maxKg, {});
    const pay = bestLoad[0];
    if (pay <= 0) { continue; }

    // Save if better than previous loads
    if (pay/totalDistance > bestRoute.payNM) {
      bestRoute = {payNM: pay/totalDistance, icao: i, load: bestLoad, distance: j.distance};
    }
  }
  return bestRoute;
}

// For the given destination and jobs, try to find assignments on the same path
// to complement the cargo
function getLegStops(fr, to, src, maxPax, maxKg, maxStops) {
  const maxDist = src[fr].j.get(to).distance;

  // Keep only legs going to the same direction
  const jobsFiltered = [];
  for (const [i, j] of src[fr].j) {
    if (i === to) { continue; }
    
    // Discard farther legs
    if (j.distance > maxDist) { continue; }

    // Compute total distance, and discard legs that stray too far away from source leg
    const totalDistance = (j.distance + dist(i, to, src));
    const ratio = maxDist / totalDistance;
    if (ratio < 0.7) { continue; }

    jobsFiltered.push([i, totalDistance, j]);
  }

  const routes = [{
    icaos: [],
    cargos: [],
    pay: 0,
    distance: 0
  }];
  const exclude = [];
  for (var i = 0; i < maxStops; i++) {
    const bestRoute = bestLegStop(jobsFiltered, maxPax, maxKg, exclude);

    // Stop if no leg found
    if (!bestRoute.icao) { break; }

    const [pay, pax, kg, loadCargo] = bestRoute.load;

    // Find correct position for new airport
    let pos = i;
    for (var k = 0; k < i; k++) {
      if (bestRoute.distance <= src[fr].j.get(routes[i].icaos[k]).distance) {
        pos = k;
        break;
      }
    }

    const icaos = [...routes[i].icaos];
    const cargos = [...routes[i].cargos];
    icaos.splice(pos, 0, bestRoute.icao);
    if (pos < i) {
      cargos.splice(pos, 0, {TripOnly: [...cargos[pos].TripOnly, ...loadCargo], VIP: []});
    }
    else {
      cargos.splice(pos, 0, {TripOnly: loadCargo, VIP: []});
    }
    for (k = 0; k < pos; k++) {
      cargos[k] = {TripOnly: [...cargos[k].TripOnly, ...loadCargo], VIP: []};
    }

    // Compute legs distance
    let distance = src[fr].j.get(icaos[0]).distance;
    for (k = 1; k < icaos.length; k++) {
      distance += dist(icaos[k-1], icaos[k], src);
    }

    routes.push({
      icaos: icaos,
      cargos: cargos,
      pay: routes[i].pay + pay,
      distance: distance
    });

    exclude.push(bestRoute.icao);
    maxPax -= pax;
    maxKg -= kg;
  }

  return routes;
}

// For the given destination and jobs, try to find assignments on the same path
// to complement the cargo
function getLegStopsReverse(fr, to, src, maxPax, maxKg, maxStops) {
  const maxDist = src[fr].j.get(to).distance;

  // Keep only legs going to the same direction
  const jobsFiltered = [];
  for (const i of src[to].r) {
    if (i === fr) { continue; }
    const j = src[i].j.get(to);
    
    // Discard farther legs
    if (j.distance > maxDist) { continue; }

    // Compute total distance, and discard legs that stray too far away from source leg
    const totalDistance = (j.distance + dist(fr, i, src));
    const ratio = maxDist / totalDistance;
    if (ratio < 0.7) { continue; }

    jobsFiltered.push([i, totalDistance, j]);
  }

  // Contrary to getLegStops, empty `routes` because the no stop route
  // is already added by getLegStops
  const routes = [];
  const exclude = [];
  for (var i = 0; i < maxStops; i++) {
    const bestRoute = bestLegStop(jobsFiltered, maxPax, maxKg, exclude);

    // Stop if no leg found
    if (!bestRoute.icao) { break; }

    const [pay, pax, kg, loadCargo] = bestRoute.load;

    // Find correct position for new airport
    let pos = i;
    for (var k = 0; k < i; k++) {
      if (bestRoute.distance >= src[routes[i-1].icaos[k]].j.get(to).distance) {
        pos = k;
        break;
      }
    }

    let icaos = [];
    let cargos = [];
    if (i > 0) {
      icaos = [...routes[i-1].icaos];
      cargos = [...routes[i-1].cargos];
    }
    icaos.splice(pos, 0, bestRoute.icao);
    if (pos > 0) {
      cargos.splice(pos, 0, {TripOnly: [...cargos[pos-1].TripOnly, ...loadCargo], VIP: []});
    }
    else {
      cargos.splice(pos, 0, {TripOnly: loadCargo, VIP: []});
    }
    for (k = pos+1; k <= i; k++) {
      cargos[k] = {TripOnly: [...cargos[k].TripOnly, ...loadCargo], VIP: []};
    }

    // Compute legs distance
    let distance = src[icaos[icaos.length-1]].j.get(to).distance;
    for (k = icaos.length-2; k >= 0; k--) {
      distance += dist(icaos[k], icaos[k+1], src);
    }

    routes.push({
      icaos: icaos,
      cargos: cargos,
      pay: (i > 0 ? routes[i-1].pay : 0) + pay,
      distance: distance
    });

    exclude.push(bestRoute.icao);
    maxPax -= pax;
    maxKg -= kg;
  }

  return routes;
}

// options: {maxPax, maxKg}
function route(icao, dest, src, options, hop, legHistory, includeLocalArea, badLegsCount, closeIcaosCache, progressStep = null) {
  // Stop when reached max iterations
  if (hop === 0) {
    return [];
  }
  hop -= 1;

  // Do not loop over same airport twice, except for the same outbound leg
  let restrictNextHop = null;
  const indexInHistory = legHistory.indexOf(icao);
  if (indexInHistory >= 0) {
    restrictNextHop = legHistory[indexInHistory+1];
  }

  // Also, stop on destination airport, except if looping because it is also
  // the departing airport: in this case, only consider the same outbound leg as before
  if (icao === dest && !restrictNextHop && legHistory.length) {
    return [];
  }

  // Hold found routes
  const routes = [];

  // Ensure there are jobs departing from this airport
  if (src[icao].j) {

    // Loop over possible destinations
    for (const [to, j] of src[icao].j) {
      if (progressStep) { postMessage({status: 'progress', progress: progressStep}); }

      // If looping, only consider the same destination as before
      if (restrictNextHop && restrictNextHop !== to) { continue; }

      // Do not consider destination if not within the plane range
      if (j.distance > options.range) { continue; }

      // Compute best load
      const maxKg = maxKgFromDistance(j.distance, options.speed, options.gph, options.maxKg);
      const [pay, pax, kg, loadCargo, remainCargo] = maximizeCargo(j.cargos, options.maxPax, maxKg);
      if (pay <= 0) { continue; }

      // Ensure leg is interesting enough considering the number of previous bad legs
      let newBadLegsCount = badLegsCount;
      if (pax < options.minPaxLoad && kg < options.minKgLoad) {
        if (!badLegsCount) { continue; }
        newBadLegsCount -= 1;
      }
      else if (dest && !options.loop) {
        // If a given destination is set (and different from origin), only keep legs going in the right direction
        const d = dist(icao, dest, src);
        const dir = getRhumbLineBearing(src[icao].c, src[dest].c);
        if ((180 - Math.abs(Math.abs(j.direction - dir) - 180)) > 50 || j.distance / d > 1.2) {
          if (!badLegsCount) { continue; }
          newBadLegsCount -= 1;
        }
      }

      let legStops = [];
      let legStopsReverse = [];
      // If there is still room, and no VIP, try to find onroute jobs
      // Limitation: if looping, do not search onroute jobs, because the previous taken jobs
      // were not removed from the jobs array.
      if (pax < options.maxPax && kg < maxKg && loadCargo.VIP.length === 0 && indexInHistory < 0) {
        const maxKgStop = maxKgFromDistance(j.distance*1.5, options.speed, options.gph, options.maxKg)
        legStops = getLegStops(icao, to, src, options.maxPax-pax, maxKgStop-kg, options.maxStops);
        legStopsReverse = getLegStopsReverse(icao, to, src, options.maxPax-pax, maxKgStop-kg, options.maxStops);
        for (const legStop of legStops) {
          for (var i = 0; i < legStop.cargos.length; i++) {
            legStop.cargos[i] = {TripOnly: [...legStop.cargos[i].TripOnly, ...loadCargo.TripOnly], VIP:[]};
          }
        }
        for (const legStop of legStopsReverse) {
          for (i = 0; i < legStop.cargos.length; i++) {
            legStop.cargos[i] = {TripOnly: [...legStop.cargos[i].TripOnly, ...loadCargo.TripOnly], VIP:[]};
          }
        }
      }
      else {
        legStops.push({icaos:[], cargos:[], pay: 0, distance: 0});
      }
      
      // Save cargos for later use
      const savedCargos =  j.cargos;
      src[icao].j.get(to).cargos = remainCargo;

      // Compute routes
      const newRoutes = route(to, dest, src, options, hop, [...legHistory, icao], true, newBadLegsCount, closeIcaosCache);
      newRoutes.push({icaos:[to], cargos:[], pay: 0, distance: 0});

      // Restore cargos
      src[icao].j.get(to).cargos = savedCargos;

      // Append routes to result
      for (const newRoute of newRoutes) {
        for (const legStop of legStops) {
          // Do not include a route if it loops over an airport included via a stop
          if (newRoute.icaos.filter(icao => legStop.icaos.includes(icao)).length) { continue; }
          let remainDist = j.distance;
          if (legStop.icaos.length) {
            remainDist = dist(legStop.icaos[legStop.icaos.length-1], to, src);
          }
          routes.push({
            icaos: [icao, ...legStop.icaos, ...newRoute.icaos],
            cargos: [...legStop.cargos, loadCargo, ...newRoute.cargos],
            pay: pay + legStop.pay + newRoute.pay,
            distance: legStop.distance + remainDist + newRoute.distance
          });
        }
        for (const legStop of legStopsReverse) {
          // Do not include a route if it loops over an airport included via a stop
          if (newRoute.icaos.filter(icao => legStop.icaos.includes(icao)).length) { continue; }
          let remainDist = j.distance;
          remainDist = dist(icao, legStop.icaos[0], src);
          routes.push({
            icaos: [icao, ...legStop.icaos, ...newRoute.icaos],
            cargos: [loadCargo, ...legStop.cargos, ...newRoute.cargos],
            pay: pay + legStop.pay + newRoute.pay,
            distance: legStop.distance + remainDist + newRoute.distance
          });
        }
      }
    }

  }

  // If include local area, and last leg had enough load
  if (includeLocalArea && badLegsCount) {

    // Get close-by airports
    if (!closeIcaosCache[icao]) {
      closeIcaosCache[icao] = closeIcaos(icao, src, options.maxEmptyLeg);
    }

    for (const [i, distance] of closeIcaosCache[icao]) {
      if (progressStep) { postMessage({status: 'progress', progress: progressStep}); }

      // If looping, only consider the same destination as before
      if (restrictNextHop && restrictNextHop !== i) { continue; }

      // If there are jobs between the two airports, abort because it was already done
      if (src[icao].j && src[icao].j.get(i)) { continue; }

      // Compute routes
      const newRoutes = route(i, dest, src, options, hop+1, [...legHistory, icao], false, badLegsCount-1, closeIcaosCache);

      // Append routes to result
      for (const newRoute of newRoutes) {
        routes.push({
          icaos: [icao, ...newRoute.icaos],
          cargos: [{TripOnly: [], VIP: []}, ...newRoute.cargos],
          pay: newRoute.pay,
          distance: distance+newRoute.distance
        });
      }
    }
  }

  let res = [];

  if (options.resultLimit && routes.length > options.resultLimit) {
    const indexPay = [...Array(routes.length).keys()];
    indexPay.sort((a, b) => routes[b].pay - routes[a].pay);
    const indexPayNM = [...Array(routes.length).keys()];
    indexPayNM.sort((a, b) => (routes[b].pay/routes[b].distance) - (routes[a].pay/routes[a].distance));
    const indexPayLeg = [...Array(routes.length).keys()];
    indexPayLeg.sort((a, b) => (routes[b].pay/routes[b].icaos.length) - (routes[a].pay/routes[a].icaos.length));
    const indexes = new Set([...indexPay.slice(0, options.resultLimit), ...indexPayNM.slice(0, options.resultLimit), ...indexPayLeg.slice(0, options.resultLimit)]);
    for (i of indexes) {
      res.push(routes[i]);
    }
  }
  else {
    res = routes;
  }

  return res;
}

function computeRemain(cargos, maxPax, maxKg) {
  if (cargos.VIP.length) { return [0, 0]; }
  return [
    maxPax - cargos.TripOnly.reduce((acc, elm) => acc+elm.pax, 0),
    maxKg - cargos.TripOnly.reduce((acc, elm) => acc+elm.kg, 0)
  ];
}


onmessage = function({data}) {
  const closeIcaosCache = {}
  closeIcaosCache[data.fromIcao] = closeIcaos(data.fromIcao, data.src, data.options.maxEmptyLeg);
  if (!closeIcaosCache[data.fromIcao].length && !data.src[data.fromIcao].j) {
    // No jobs around this starting point, no need to continue
    postMessage({status: 'progress', progress: 100});
    postMessage({status: 'finished', results: []});
    return;
  }
  const progressStep = 100 / (closeIcaosCache[data.fromIcao].length + (data.src[data.fromIcao].j ? data.src[data.fromIcao].j.size : 0));

  const options = {
    loop: data.fromIcao === data.toIcao,
    ...data.options
  }
  let allResults = route(
    data.fromIcao,
    data.toIcao,
    data.src,
    options,
    data.maxHops,
    [],
    true,
    data.maxBadLegs,
    closeIcaosCache,
    progressStep
  );

  // If destination is set
  if (data.toIcao) {
    // If destination is equal to origin, only keep route terminating at the origin
    if (data.toIcao === data.fromIcao) {
      allResults = allResults.filter(elm => elm.icaos[elm.icaos.length-1] === elm.icaos[0]);
      // Try to add even more load: analyze each route
      for (var i = 0; i < allResults.length; i++) {
        const route = allResults[i];
        const icaos = [];

        // Analyse each stop in route
        for (var j = 1; j < route.icaos.length; j++) {
          if (icaos.includes(route.icaos[j])) { break; }
          icaos.push(route.icaos[j]);
          if (j<2) { continue; }

          // If previous leg has a job not coming from the previous stop, abort
          // For instance : for route A -> B -> C, with jobs A -> B and A -> C
          // We do not analyze C, because we would find the A -> C jobs which we
          // already have in hold
          let stop = false;
          for (var k = 0; k < route.cargos[j-1].TripOnly.length; k++) {
            if (route.cargos[j-1].TripOnly[k].from !== route.icaos[j-1]) {
              stop = true;
              break;
            }
          }
          if (stop) { continue; }

          // Compute remaining space
          if (route.cargos[j-1].VIP.length) { continue; }
          const distance = dist(route.icaos[j-1], route.icaos[j], data.src);
          const maxKg = maxKgFromDistance(distance, options.speed, options.gph, options.maxKg);
          let [remainPax, remainKg] = computeRemain(route.cargos[j-1], options.maxPax, maxKg);
          if (!remainKg) { continue; }

          // Find previous stop having jobs to the same destination
          for (k = j - 2; k >= 0; k--) {
            if (route.cargos[k].VIP.length) { break; }
            const distance2 = dist(route.icaos[k], route.icaos[k+1], data.src);
            const maxKg2 = maxKgFromDistance(distance2, options.speed, options.gph, options.maxKg);
            let [remainPax2, remainKg2] = computeRemain(route.cargos[k], options.maxPax, maxKg2);
            remainPax = Math.min(remainPax, remainPax2);
            remainKg = Math.min(remainKg, remainKg2);
            if (data.src[route.icaos[k]].j) {
              const jb = data.src[route.icaos[k]].j.get(route.icaos[j]);
              if (jb) {

                // Find best cargo, if any
                const [pay, pax, kg, loadCargo] = maximizeTripOnly(jb.cargos.TripOnly.length, jb.cargos.TripOnly, remainPax, remainKg, {});
                if (pay) {
                  for (var l = k; l < j; l++) {
                    route.cargos[l] = {TripOnly: [...route.cargos[l].TripOnly, ...loadCargo], VIP:[]};
                  }
                  route.pay += pay;
                  remainPax -= pax;
                  remainKg -= kg;
                }
              }
            }
          }
        }
      }
    }
    // Otherwise, add last leg to complete route
    else {
      // Filter out legs that do not bring you closer enough
      const minFinalDist = dist(data.fromIcao, data.toIcao, data.src)/3;
      allResults = allResults.filter(elm => dist(elm.icaos[elm.icaos.length-1], data.toIcao, data.src) < minFinalDist);
      for (i = 0; i < allResults.length; i++) {
        // Add only last leg if route does not terminate to correct destination
        const lastIcao = allResults[i].icaos[allResults[i].icaos.length-1];
        if (lastIcao !== data.toIcao) {
          allResults[i] = {
            icaos: [...allResults[i].icaos, data.toIcao],
            cargos: [...allResults[i].cargos, {TripOnly: [], VIP: []}],
            pay: allResults[i].pay,
            distance: allResults[i].distance + dist(lastIcao, data.toIcao, data.src)
          }
        }
      }
    }
  }

  // Add aircraft model to all routes
  allResults = allResults.map(elm => {
    elm.model = data.options.model;
    return elm;
  });

  postMessage({
    status: 'finished',
    results: allResults
  });
}
