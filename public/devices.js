'use strict';

/**
 {
  "devices": [
    {
      "id": "string",
      "is_active": true,
      "is_private_session": true,
      "is_restricted": true,
      "name": "Loudest speaker",
      "type": "computer",
      "volume_percent": 59
    }
  ]
}
 */

/**
 * Module exports.
 * @public
 */

var Devices = {
    allDevices: [],
    currentDeviceId: ''
};

function getAvailableDevices(requestConfig) {
    if (!requestConfig) {
        return;
    }

    requestConfig.headers["Content-Type"] = 'application/json';

    fetch('https://api.spotify.com/v1/me/player/devices', requestConfig)
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.devices?.length > 0) {
            generateDevicesDOMElements(data.devices);
            data.devices.forEach(device => {
                if (device.is) {
                    
                }
                console.log(`${device.type}\t${device.name}`);
            });
            Devices.allDevices = [...data.devices];
        }
    })
    .catch(reason => {
        console.error(`getAvailableDevices:\n${reason}`);
    });
}

function updateCurrentPlayingDevice() {

}

function generateDevicesDOMElements(devices) {
    if (devices?.length > 0) {
        let devices_element = document.getElementById('devices');
        if (devices_element) {
            devices_element.innerHTML = "";
            devices.forEach(device => {
                let li = document.createElement("li");
                li.innerHTML = 
                `
                <a href="#" class="link-dark d-inline-flex text-decoration-none rounded">${device.name}</a>
                `;
                devices_element.appendChild(li);
            });
        }
    }
    
}