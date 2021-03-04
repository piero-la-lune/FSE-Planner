# FSE Planner

FSE Planner is a map visualization app that allows you to display all kind of information from [FSE Economy](https://www.fseconomy.net) onto a world map:

* available jobs with tons of filtering options
* available rentable planes, available user/group planes
* all FSE airports, with their landing area and corresponding MSFS airports
* all MFSF airports
* ...

It also offers a tool to find the most paying routes.

<p align="center">
	<a href="https://www.youtube.com/watch?v=MDB7AFYSqMI"><img width="300" height="169" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/video_small.png?raw=true" alt="Overview video"></a>
</p>

## Features

<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature1.png?raw=true" alt="Display available jobs on map & apply search filters on location, length, amount, pay, direction, etc.">
</p>
<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature6.png?raw=true" alt="Route Finder: find best paying multi-hop multi-assignment route with complex on-route stops and return to home capabilities">
</p>
<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature2.png?raw=true" alt="Display airports with rentable planes & get detailed information about the available planes">
</p>
<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature3.png?raw=true" alt="Search for specific ICAO and airport name & get a link to the corresponding FSE website page">
</p>
<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature4.png?raw=true" alt="Display all FSE airports on the map & view the correspoding landing areas">
</p>
<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature5.png?raw=true" alt="Display all MSFS airports on the map & warn about non-existent or renamed airports">
</p>
<p align="center">
	<img width="600" src="https://github.com/piero-la-lune/FSE-Planner/blob/master/visual_assets/feature7.png?raw=true" alt="Display all airport with available lots to be built upon & filter out airports based on size">
</p>



## Installation

A public instance of FSE Planner is available at [https://piero-la-lune.fr/fseplanner/](https://piero-la-lune.fr/fseplanner/).

If you prefer, you can instead install your own instance.

### Local installation

To install your own instance of FSE Planner on your computer:

1. Download the [latest release](https://github.com/piero-la-lune/FSE-Planner/releases) from GitHub (you can also build the application from scratch, see "Developer instructions" bellow)
2. Unzip the release on your computer
3. Open `index.html` in your favorite web browser

/!\ The Route Finder will not work. This is a known issue with no workaround (see Remote installation to make it works).

### Remote (server) installation

To install your own instance of FSE Planner on a web server, execute the following steps.

/!\ Because of a bad configuration of the FSE server (wrong CORS settings), you will need to set up a proxy (you may also use an existing one such as https://cors-anywhere.herokuapp.com/).

1. Clone the [latest release](https://github.com/piero-la-lune/FSE-Planner/releases) on your computer or server
2. Edit the `.env` file to specify your proxy URL, for instance:
```
REACT_APP_PROXY=https://cors-anywhere.herokuapp.com/https://server.fseconomy.net/
```
3. Build the app (`npm install` then `npm run build`)
4. Drop all the files from the `build` folder to your web server.

Example of a complete nginx configuration:
```
server {

        listen 80;

        server_name YOUR_DOMAIN;

        root /YOUR_APP_FOLDER;

        location /proxy {

                if ($http_origin !~* "(^null$|^$|^https?://(YOUR_DOMAIN|localhost:3000)$)") {
                        return 404;
                }

                rewrite ^/proxy/(.*)$ /$1 break;

                # Activate proxy
                proxy_set_header                X-Real-IP $remote_addr;
                proxy_set_header                X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_pass                      https://server.fseconomy.net;
                proxy_redirect                  off;
                proxy_buffers                   32 16k;
                proxy_busy_buffers_size         64k;

                # Add CORS headers
                add_header    'Access-Control-Allow-Origin' "$http_origin" always;
                add_header    'Access-Control-Allow-Methods' 'GET' always;
                add_header    'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept' always;
                add_header    'Access-Control-Allow-Credentials' 'true' always;
        }

}
```


## Developer instructions

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!


## License

FSE Planner is open source software licensed as [MIT](https://github.com/piero-la-lune/FSE-Planner/blob/master/LICENSE).