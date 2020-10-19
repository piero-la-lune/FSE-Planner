# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).



## [Unreleased]

### Backlog
- Show current user assignments on map
- (allow for bigger area data requests, and multi-planes data requests) => not sure if it will be implemented 



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