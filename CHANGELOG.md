# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).



## [1.4.1] - 2021-04-16

### Added
- Debug button: allow any user to easily export debug information, to help investigating bugs. The new button is accessible via the changelog & credits popup

### Changed
- Behind the scenes: removed proxy, thanks to a welcomed change on FSE side regarding CORS headers

### Fixed
- Bug in "From ICAO" and "To ICAO" filters, that would wrongly hide some jobs
- Bug in Route Finder, that would prevent the search from finishing



## [1.4.0] - 2021-03-13

### Added
- Better and more advanced parameters for the route finder:
  - Net earnings: the ground handling fees, booking fees, rental cost & bonus and fuel cost can be deduced from the total pay
  - When using the 'Available planes' option, no need to set the aircraft specifications anymore (like 'max pax'), it is automatically deduced from the aircraft model
  - New idle/taxi time parameter, to better take into account time spent on the ground
  - New distance overhead parameter, to take into account airways and routes that are not straight between two airports
  - Legs now cannot exceed the aircraft maximum range
  - New parameter to only search for VIP assignments
- Route finder considers on-route stops to better fill the plane along the way to a destination (was only considering loading more cargo to drop by along the way, but was not considering picking up cargo on the route) ([#33](https://github.com/piero-la-lune/FSE-Planner/issues/33))

### Fixed
- Aircrafts reserved for All-in assignments are now correctly displayed on the map ([#40](https://github.com/piero-la-lune/FSE-Planner/issues/40))



## [1.3.2] - 2021-03-05

### Added
- You can now load owned planes (by any user or group) on top of / instead of publicly rentable planes

### Fixed
- Aircraft models list updated ([#36](https://github.com/piero-la-lune/FSE-Planner/issues/36))



## [1.3.1] - 2021-01-07

### Fixed
- Wrong passenger count in Route Finder ([#31](https://github.com/piero-la-lune/FSE-Planner/issues/31))



## [1.3.0] - 2021-01-05

### Added
- New airport surface and airport runway length filter ([#20](https://github.com/piero-la-lune/FSE-Planner/issues/20))

### Changed
- Airport popup now show runway length and surface
- Airplane model list updated to include the new CJ4 and 2 other new models ([#19](https://github.com/piero-la-lune/FSE-Planner/issues/19))

### Fixed
- Wrong latitude and longitude in context menu ([#25](https://github.com/piero-la-lune/FSE-Planner/issues/25))
- Missing MN24 airport ([#14](https://github.com/piero-la-lune/FSE-Planner/issues/14))
- Wrong passenger weight in Route Finder ([#21](https://github.com/piero-la-lune/FSE-Planner/issues/21))



## [1.2.0] - 2020-12-11

### Added
- New map overlay with unbuilt lots (updated daily)
- Airport filter settings: only show/consider aiports in MSFS or in the given size range (also works with Route Finder)

### Changed
- Display sort by value in Route Finder results

### Fixed
- Planes showing as rentable but cannot be rented
- Tutorial skip button issue



## [1.1.1] - 2020-12-07

### Added
- Cancel button in Route Finder
- ICAOs in leg tooltips

### Changed
- MSFS airports updated

### Fixed
- Overlapping buttons in airport popups



## [1.1.0] - 2020-12-01

### Added
- Route Finder: find the best paying multi-hop multi-assignment routes
- Huge performance improvement when displaying lot of objects on map
- Right click context menu on map, with various actions (open in FSE, set FROM or TO filter, etc.)
- Display custom markers on map (right click on airport to add/remove, or bulk management in the Data popup)
- Rentable planes: link to the FSE plane page
- Rentable planes: link to pan the map to a plane home

### Changed
- Default settings for FROM and TO filters
- Include searched ICAO in URL
- Default colors
- Variable airport icon size and path weight, depending on map zoom

### Fixed
- Broken tooltips in airports popups
- Alternative airport list display, when list was exceeding one line (#6)
- Broken zoom on search result (#7)



## [1.0.0] - 2020-11-06

### Added
- New map layer with all FSE airports
- New map layer with all MSFS airports
- New map layer with all FSE airport landing areas
- Show/hide layers on map
- Tutorial for first time users
- FSE airport popup now indicates if the airport exists in MSFS, if the ICAO is different, and other potential MSFS landing spots within the FSE airport landing area
- No more restriction on the size of the zone for loading jobs from FSE
- You can now select multiple plane models when loading rentable planes from FSE
- New changelog and credits popup (changelog opens automatically when a new version is released)
- 3 different airport icons depending on airport size
- New pay filter : minimum job pay, minimum leg pay, and top X% job pay per NM
- Loading screen and app icon

### Changed
- Load Data popup now opens automatically for first time users
- Airports popup remodeled
- Improved performance
- Better proxy for FSE requests

### Fixed
- Search history is now correctly ordered
- Leg tooltips now show correct information when only My Flight is displayed on map



## [0.5.0] - 2020-10-20

### Added
- Auto center/zoom map to jobs on loading
- New setting to change map middle
- Show My Flight (FSE selected jobs) on map

### Changed
- Update popup improved

### Fixed
- From/To ICAO bug with max angle
- Naval airport icon
- Map issue at around longitude -180
- Typo



## [0.4.1] - 2020-10-17

### Fixed
- "From ICAO" and "To ICAO" filters now work as expected for jobs departing/arriving from/to the selected airport
when a maximum angle is set



## [0.4.0] - 2020-10-17

### Added
- Highlight leg on mouse over
- Search airport by ICAO or name, and display its location on map
- Search history is saved between sessions, and shown in drop-down list
- Display home information for rentable planes (arrow + details in tooltip)

### Changed
- Both way legs are now merged into one line on map
- Better design for map tooltips and popups

### Fixed
- App header now adapt to window width



## [0.3.0] - 2020-10-14

### Added
- Display settings
- Advanced "From ICAO", "To ICAO" and "Distance" settings
- Settings are kept between sessions



## [0.2.0] - 2020-10-12

### Added
- You can now select an area on a map to load jobs from, instead of selecting countries
- You get an error if the selected job area is too large
- "From ICAO" and "To ICAO" airports now appear with a green icon on the map
- New distance filter : set minimum and/or maximum job distance



## [0.1.0] - 2020-10-11

### Added
- Show available jobs on map
- Show rentable plane on map
- Choose countries to load jobs from
- Choose airplane model to load rentable planes
- Filters are available to filter out unwanted jobs on map