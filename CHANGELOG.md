# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).



## [1.19.4] - 2025-03-16

### Fix
- Fixed panning bug on alternative map
- Fixed missing airports on map



## [1.19.3] - 2025-03-11

### Changed
- Updated FSE airport list to include the 20 new airports
- Updated FSE aircraft list
- Updated project dependencies



## [1.19.2] - 2024-12-15

### Changed
- Updated FSE plane list (AW109SP and C408 - thx jonaseberle)
- Updated project dependencies



## [1.19.1] - 2024-09-29

### Changed
- Updated MSFS airports list
- Updated project dependencies



## [1.19.0] - 2024-07-07

### Added
- "FBOs with unbuilt lots" layer is back!
- Add setting to keep the Update popup open after clicking an update button (new default behavior) (#186 by machouinard)
- New option in Route Finder filters to exclude the given ICAO(s) from the results (#183)
- Display current number of loaded jobs/planes in the Update popup

### Changed
- Updated FSE aircraft list
- Updated project dependencies

### Fixed
- Fix pay numbers in Route Finder PDFs



## [1.18.2] - 2024-05-11

### Changed
- Updated FSE aircraft list
- Updated project dependencies

### Fixed
- Fix pay per leg sorting option in Route Finder (#184 by jonaseberle)



## [1.18.1] - 2024-02-16

### Changed
- Updated FSE aircraft list
- Updated project dependencies



## [1.18.0] - 2023-12-10

### Added
- Assignments can now be marked as flown: this makes those assignments disappear entirely from FSE Planner without having to refresh the data. This feature is accessible in two places: in the Table view and in the Router Finder result view
- Added a counter to track the number of requests to FSE datafeeds (by @jsilva74 #178)
- Added the "Return to starting airport" option to the global Route Finder settings (#177)

### Changed
- Modified the Filters behavior so that it now also apply to My Assignments
- Added a note to specify that read access key are stored by on the user own computer, and are only used for data updates requested by the said user
- Updated MSFS data
- Updated FSE aircraft list
- Updated project dependencies
- Modified the behavior when pasting data in the Route Finder ICAO filter, to allow for multiple ICAOs to be pasted at once (#176)



## [1.17.0] - 2023-07-31

### Added
- New filter for custom layers: you can now filter by geographical area (useful to save preset regions as custom layers for loading jobs)
- Search for GPS coordinates in search bar (example: 48.8583N 2.2944E). URL can be shared with pinned location

### Changed
- Geographical area selection can now be any polygon (not longer restricted to rectangle)

### Fixed
- Fixed bug that prevented booking fees to be calculated with personal or group assignments
- Fixed bug that allowed All-In reserved airplanes to be considered as rentable by the Route Finder (#172)



## [1.16.0] - 2023-07-23

### Added
- Context menu (right click on map): open location in Google Maps satellite view
- Job direction parameter directly in the Load Data popup
- More control on assignment types in Route Finder (passengers/cargo, black/green/VIP)

### Changed
- Updated MSFS data
- Updated FSE aircraft list
- Updated project dependencies

### Fixed
- Fixed bug when creating new custom layer with For Sale or Unbuilt Lots (no markers were shown on the map)



## [1.15.0] - 2023-06-04

### Added
- Customization of line thickness for custom layers
- Custom layer colors can now be entered with an hexadecimal color code (#157)
- Share multiple layers with one unique URL (new `layers` URL query parameter). To share `ID1` and `ID2` layers at once (ids can be retrieved in the layer sharing URL), use this URL: `https://fse-planner.piero-la-lune.fr/?layers=ID1,ID2` (ids must be comma separated)
- New settings to save default job type filters (Trip/VIP/All In, Passengers/Cargo)
- New settings to allow non-compatible airports that have at least one alternative airport in the simulator to be included (when the option "Only display and use simulator compatible airports" is On) (#159)

### Changed
- Updated MSFS data
- Updated FSE aircraft list
- Updated project dependencies

### Fixed
- Fixed rounding bug in airport coordinates (#162)
- Fixed "More" alternative airports button (#160)



## [1.14.1] - 2022-12-28

### Changed
- Better autocomplete (ICAO search, FSE group/username search)

### Fixed
- Fixed bug that prevented some usernames to appear in the "Owned & leased plane" autocomplete field



## [1.14.0] - 2022-12-27

### Added
- Community layers: make public your layer so that other users can easily search for it and view it (no more need for a share link)
- Layers options: more colors and added description field
- New "Clear all filters" button to reset all filters at once (#152)

### Changed
- Layer creation popup look & feel
- Clearer warning message when deleting a shared layer
- Updated FSE plane list
- Updated MSFS data

### Fixed
- Fixed bug that could prevent future edit capability on custom layers



## [1.13.0] - 2022-11-06

### Added
- Automatic import from FSE with Read Access Key when creating FBOs custom layers
- An aircraft bonus can now be manually set when using Route Finder in Free Search mode (#144)

### Changed
- Updated FSE plane list
- Updated MSFS data

### Fixed
- Fixed bug with job custom area when changing the map center (#149)
- Fixed wording in Route Finder results (#145)



## [1.12.0] - 2022-06-18

### Added
- Support for the new "Maximum Cargo Weight" aircraft parameter in Route Finder
- You can now set a heading instead of a destination in Route Finder Free Search
- New sorting option in Route Finder: sort by shortest distance
- New search option in Route Finder: exclude all VIP jobs from search

### Changed
- Updated FSE plane list (added Honda HA-420 HondaJet)
- Updated MSFS data

### Fixed
- Fixed FSE redirection after adding jobs to My Flight or renting a plane
- Fixed bug when setting the direction filter to 0
- Fixed bug when setting "Max number of bad legs" parameter to 0 in Route Finder




## [1.11.5] - 2022-05-22

### Fixed
- Fixed bug in Route Finder with result sorting
- Fixed bug with alternative map



## [1.11.4] - 2022-05-20

### Changed
- Updated FSE plane list (added Cessna 310R and Diamond DA-50RG)
- Reworked part of the Route Finder interface to improve user experience and make the parameters clearer
- Route Finder "Iterations" parameter changed to "Max number of legs" to enforce the maximum number of legs in resulting routes

### Fixed
- Fixed bug in Route Finder when setting a destination that would give no result
- Fixed bug that would prevent to drag the custom area box (#137)



## [1.11.3] - 2022-04-23

### Changed
- Updated FSE plane list (added Boeing 247D W42 and Rutan Long EZ RTW)
- Updated libraries/dependencies

### Fixed
- Fixed X-Plane data (a lot of airports were missing)
- Fixed bug where clicking on an airport name in Route Finder results would do nothing or crash the app
- Fixed display bug with distance measuring tool



## [1.11.2] - 2022-04-17

### Changed
- Updated MSFS data

### Fixed
- Fixed "minimum number of passengers" filter bug with VIP jobs
- Fixed wrong "bad leg" count in Route Finder when using the Free Search option with a destination
- Fixed bug where closed MSFS airports would wrongly be displayed



## [1.11.1] - 2022-03-17

### Fixed
- Infinite loading screen due to a bug in data migration from older FSE Planner versions



## [1.11.0] - 2022-03-13

### New
- The search box can now be used to search for a leg (type the departing ICAO code, then a ">" and finally the destination ICAO): the leg will be highlighted and focused on the Map view, the Table view will be filtered to keep only the corresponding jobs
- New settings to prevent loading jobs that will expire soon
- Right click on airport to open the Table view, right click on leg to open the Table view
- Right click on airport to add (or remove) ICAO to an existing custom layer
- New option to load jobs both FROM and TO the selected area/layer

### Changed
- Passenger and package jobs can now be displayed at the same time on the map
- Removed Custom Markers feature

### Fixed
- Fixed Route Finder that was finding jobs too heavy to add the necessary fuel for the leg
- Fixed application height bug in Safari mobile
- In Route Finder, disable Add to My Flight button when there is a VIP job in the list



## [1.10.2] - 2022-03-07

### Fixed
- Fixed leg tooltip showing wrong jobs in returning jobs
- Fixed "Local storage is full" error
- Fixed plane sorting in Assignments Table view



## [1.10.0] - 2022-03-05

### New
- New Table view: display all available assignments and planes in a table instead of the map. Filters are shared between the Map view and the Table view
- Add assignments to My Flight or a group queue directly from within FSE Planner: works in Table view and in Route Finder
- Rent a plane directly from within FSE Planner: works in Table view and in Route Finder
- New job loading option: load data from the top 10 (by default) areas where a plane is available. This can also be used to query all All-In jobs for a given plane (set Strict mode in Settings for this to work as expected) ([#56](https://github.com/piero-la-lune/FSE-Planner/issues/56))
- Measure a distance and a bearing between two points on the map (right click to set the origin) ([#110](https://github.com/piero-la-lune/FSE-Planner/issues/110))
- Add a custom image to PDF generated by the Route Finder, in the colors of a group for instance (image can be set in the Settings popup)


### Changed
- The application top bar has been revamped to be clearer for new users
- Pay filters are now available with the other filters (they can no longer be changed in the Settings popup)
- Min/max filters are now working as expected (fixed min for All-In & VIP jobs, and fixed max for Trip Only jobs), tooltip display has been improved when hovering a leg to display individual jobs
- Updated X-Plane data (11.55) & MSFS data
- Clearer error message when updating data to separate maintenance and key errors ([#101](https://github.com/piero-la-lune/FSE-Planner/issues/101))
- A confirmation is now asked before deleting a custom layer ([#111](https://github.com/piero-la-lune/FSE-Planner/issues/111))
- Tabulations can now be used in custom layers data import to allow direct copy & paste from Google Sheets ([#112](https://github.com/piero-la-lune/FSE-Planner/issues/112))

### Fixed
- Fixed various bugs when using touch screen devices (long press to simulate right clicks)
- Fix bug preventing right clicks in the custom layer popup ([#112](https://github.com/piero-la-lune/FSE-Planner/issues/112))
- Fix bug with incorrect map wrapping for some layers



## [1.9.0] - 2022-02-17

### New
- Load jobs from custom layers (= you can now load jobs from a list of ICAOs instead of a geographical area) ([#95](https://github.com/piero-la-lune/FSE-Planner/issues/95), [#100](https://github.com/piero-la-lune/FSE-Planner/issues/100))
- Load group assignments (group read access key needed) ([#96](https://github.com/piero-la-lune/FSE-Planner/issues/96))
- New filter to exclude military airbases ([#103](https://github.com/piero-la-lune/FSE-Planner/issues/103))
- New settings to set job direction when loading jobs from FSE
- New action to update data of shared layers (to load the latest changes made by the layer author)

### Changed
- Alternative basemap: new personalized map tiles (self hosted), so no more usage limit (unless it becomes too expensive to host...) ([#97](https://github.com/piero-la-lune/FSE-Planner/issues/97))
- Airports with available planes for rent are now highlighted with the same (red by default) color, instead of just the "jobs and plane search" layer as before ([#98](https://github.com/piero-la-lune/FSE-Planner/issues/98))
- Increased the map max zoom
- Updated plane list to include the new Challenger 650
- Technical upgrade: updated a lot of libraries and dependencies

### Fixed
- Bug with destination airport elevation on exported route ([#93](https://github.com/piero-la-lune/FSE-Planner/pull/93)) [by jsjunior]



## [1.8.0] - 2021-12-08

### New
- Save layers between sessions
- New layer type: import CSV data (FSE airports or GPS coordinates) to build a custom layer
- Share layers to other people (right click on layer to access the feature)
- Export layer to CSV file (right click on layer to access the feature)
- Layer context menu (right click on layer)
- Direct link to SkyVector and ChartFox in airport context menu ([#81](https://github.com/piero-la-lune/FSE-Planner/issues/81)) [by John Bayly]
- Highlight all jobs from/to when mouse hovering an airport ([#53](https://github.com/piero-la-lune/FSE-Planner/issues/53)) [by John Bayly]

### Changed
- Updated MSFS data (added new seaplane bases, updated ILS and runway length & surface information, etc.)
- Updated FSE data (plane list)
- "Unbuilt" and "For Sale" layer data is now updated every 6 hours

### Fixed
- Duration display bug in Route Finder ([#86](https://github.com/piero-la-lune/FSE-Planner/issues/86))



## [1.7.0] - 2021-10-09

### New
- New custom layers: add custom layers to the map with your own filters and display settings
- New basemap with English location names
- New ILS filter: only display and use airports that have an ILS approach (MSFS). Thanks to Lily418 for the help
- New setting in Route Finder to set a custom airplane rental price ([#65](https://github.com/piero-la-lune/FSE-Planner/issues/65))

### Changed
- Optimized Route Finder memory usage: this should prevent crashes with Chrome, even when searching large areas
- Improved Route Finder when setting a destination: no more route going in the wrong overall direction
- Optimized application memory usage and loading time
- Updated runway data (length and surface)
- Updated plane list to include newly added FSE planes
- Updated MSFS data
- Changed display in Route Finder PDF to separate cargo weight from the total weight (cargo and passengers) ([#66](https://github.com/piero-la-lune/FSE-Planner)/issues/66)

### Fixed
- Bug when loading data from airports with an ICAO resembling a number, such as 0E0 ([#79](https://github.com/piero-la-lune/FSE-Planner/issues/79))
- Rounded airplane specs in Route Finder for a better display
- Bug when resetting settings multiple times



## [1.6.0] - 2021-06-27

### New
- New airport filter: only display airports that sell building materials

### Changed
- FSE Planner URL (now [https://fse-planner.piero-la-lune.fr](https://fse-planner.piero-la-lune.fr)) with better performances (new hosting)
- Whenever a bug occurs, display an error message instead of a white screen

### Fixed
- Bug that would cause a white screen when loading an in-flight plane ([#64](https://github.com/piero-la-lune/FSE-Planner/issues/64)
- Bug that would not load all planes when entering two or more users/groups ([#69](https://github.com/piero-la-lune/FSE-Planner/issues/69)



## [1.5.2] - 2021-04-22

### Fixed
- Bug that would prevent the route PDF from showing
- Bug that would not display all planes on map when loading both rentable and user planes



## [1.5.1] - 2021-04-22

### Fixed
- Bug that would prevent the Route Finder from displaying the results in some rare cases



## [1.5.0] - 2021-04-21

### Added
- Many additions/improvements to the Route Finder:
  - You can now export a route to a PDF document!
  - You can now copy a route to clipboard, to paste it in external tools
  - You can now change the default routing parameters (in the app settings), so that you do not need to change them each time you run the Route Finder
  - Available planes: you can now choose a specific model(s) for the search, instead off all loaded models
  - Free search: you can now select a plane model, instead of manually entering aircraft specifications
  - Free search: the ICAO inputs now offer suggestions and search capabilities
  - Route filter: you can now filter the results to only show routes stopping at a given ICAO (thanks icykoneko)
  - The Route Finder now includes "My flight" jobs in its search
- FSX and X-Plane airport information is now included (show missing/renamed airports, display all airports on map, etc.). You can switch between simulators in the app settings
- Elevation info: show elevation in airport popup

### Changed
- Improved "Update" buttons in the "Load data from FSE" popup to make their behavior clearer
- Planes rented by yourself are now loaded and displayed on the map (you need to enter your FSE username for it to works)
- Min/max filter values are now kept when switching between pax and cargo

### Fixed
- Bug in Route Finder, that would suggest routes with pax/cargo heavier than what the plane could carry ([#47](https://github.com/piero-la-lune/FSE-Planner/issues/47) & [#51](https://github.com/piero-la-lune/FSE-Planner/issues/51))



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
