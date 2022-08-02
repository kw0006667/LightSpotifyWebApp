# Light Spotify Web App by Nextjs

## Snapshots
![snapshot](./readme/Screen%20Shot%202022-08-01%20at%2011.45.52%20PM.png)

## Description
This is a web app which was created by Nextjs, Spotify Web API and Spotify Web Playback SDK. Since the official Spotify app has only dark theme. I would like to create a light theme web app.:)

Note: Since there is a limit for the count of request, I disable the feature that pull the current playback information frequently when playing on the other devices. It is by design and known issue from Spotify Web API. But I will try to get the playback data every 6sec or 10sec in the future to support to control the playback on the remote devices.

### Support Features
* Play track on your existing playlists
* Remember last playback state
* Playback actions
  * Play/Resume
  * Pause
  * Skip to Next
  * Skip to Previous
  * Shuffle
  * Repeat Mode
  * Volume Adjustment
  * Seek Position (Coming...)
* Home
  * New Release
  * Recently Played
  * Featured Playlists
  * Picked Tracks (Currently only for Mandop)
* Search
  * Tracks
  * Albums
  * Playlist
  * Artists
  * Podcasts (Shows and Episode)
  * Provide playlists by Categories
* Remote Control
  * Transfer to other activated devices
  * Transfer back to local device
* Playlist
  * Add/remove new tracks to the existing playlist (Coming...)
  * Create a new playlist (Coming...)
  * Shuffle play the playlist (Coming...)
  * Follow/nofollow playlists
* Album
  * Show the existing albums
  * Like/save albums
* Artist
  * Navigate to the artist page
  * Like the artist to store
* Track
  * Like songs in the playlists, album and from playback bar
* Standalone App (Coming...)
  * Electron or CEF?
  * React Native?
  * Tauri?

## How to run this web app?
Before you run this app, you have to register a spotify app on [Spotify Dashboard](https://developer.spotify.com/dashboard/login). And past your ```client_id``` and ```client_secret``` in ```.env.local```. And you must install ```Node JS``` in your machine. Navigate to the root folder, and run ```npm start```. The default port is ```3000```. You can launch your web app by ```http://localhost:3000```. Please also add ```redirect_uri``` to your Spotify dashboard for OAuth2.0 workflow. The default ```redirect_uri``` is ```http://localhost:3000/callback```. For other details, you can reference [Spotify for Developer](https://developer.spotify.com/documentation/web-api/reference/).

### Known issues
* Get null content when launching app in not "Home" page