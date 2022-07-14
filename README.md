# Light Spotify Web App

## Snapshots
![snapshot](./readme/Screen%20Shot%202022-07-13%20at%2012.04.50%20AM.png)

## Description
This is a web app which was created by Spotify Web API and Spotify Web Playback SDK. Since the official Spotify app has only dark theme. I would like to create a light theme web app.:)

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
* Search
  * Tracks
  * Albums (Coming...)
  * Playlist (Coming...)
  * Artists (Coming...)
* Remote Control
  * Transfer to other activated devices
  * Transfer back to local device
* Playlist
  * Add/remove new tracks to the existing playlist (Coming...)
  * Create a new playlist (Coming...)
  * Shuffle play the playlist (Coming...)
* Album
  * Show the existing albums
  * Like/save albums (Coming...)
* Artist
  * Navigate to the artist page
  * Like the artist to store (Coming...)
* Standalone App (Coming...)
  * Electron or CEF?
  * React Native?
  * Tauri?

## How to run this web app?
Before you run this app, you have to register a spotify app on [Spotify Dashboard](https://developer.spotify.com/dashboard/login). And past your ```client_id``` and ```client_secret``` in ```auth.json```. And you must install ```Node JS``` in your machine. Navigate to the root folder, and run ```npm start```. The default port is ```4000```. You can launch your web app by ```http://localhost:4000```. Please also add ```redirect_uri``` to your Spotify dashboard for OAuth2.0 workflow. The default ```redirect_uri``` is ```http://localhost:4000/callback```. For other details, you can reference [Spotify for Developer](https://developer.spotify.com/documentation/web-api/reference/).
