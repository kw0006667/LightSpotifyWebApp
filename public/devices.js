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

var _isRender = false;
var _isAllDeviceListOpened = false;
let _fetchAllDevicesInterval = 1;

function getAvailableDevices(requestConfig) {
    if (!requestConfig) {
        return;
    }

    requestConfig.headers["Content-Type"] = 'application/json';

    setTimeout(() => {
        fetch('https://api.spotify.com/v1/me/player/devices', requestConfig)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 401) {
                refreshToken();
                return;
            }
        })
        .then(data => {
            if (data?.devices?.length > 0) {
                Devices.allDevices = [];

                generateDevicesDOMElements(data.devices);
                data.devices.forEach(device => {
                    console.log(`${device.type}\t${device.name}`);
                });
                Devices.allDevices = [...data.devices];
            }
        })
        .catch(reason => {
            console.error(`getAvailableDevices:\n${reason}`);
        })
        .finally(() => {
            _fetchAllDevicesInterval = 5000;
            getAvailableDevices(requestConfig);
        });
    }, _fetchAllDevicesInterval);
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

        let devicesContainer = document.getElementById('hiddenPopoverContent');
        if (devicesContainer && !_isRender) {
            let allDevicesHtmlStr = "";
            devices.forEach(device => {
                let activeCss = "";
                if (Devices.currentDeviceId === device.id) {
                    activeCss = "active-device";
                }
                allDevicesHtmlStr += `
                <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-1 ${activeCss}" aria-current="true" data-deviceid="${device.id}" onclick="transferPlayDevice(this)">
                    <span style="font-size: 30px;"><i class="bi bi-laptop" ></i></span>
                    <div>
                        <span style="font-size: 14px;">${device.name}</span>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-speaker"></i>
                            <span style="margin-left: 5px; font-size: 12px;">${device.type}</span>
                        </div>
                    </div>
                </a>
                `;
            });
            devicesContainer.innerHTML = allDevicesHtmlStr;
        }
        // let allDevices = devices.map(device => 
        //     <DeviceDOM key={device.id} device={device} />
        // );
        // ReactDOM.render(
        //     <div data-name="popover-content">
        //         {allDevices}
        //     </div>
        //     , devicesContainer
        // );
    }    
}

function openAllDevicesList() {
    let allDeviceList_Element = document.getElementById('allDeviceList');
    if (!allDeviceList_Element) {
        return;
    }

    if (_isAllDeviceListOpened) {
        allDeviceList_Element.classList.remove('connect-device-list-container-visible');    
    } else {
        allDeviceList_Element.classList.add('connect-device-list-container-visible');
    }

    _isAllDeviceListOpened = !_isAllDeviceListOpened;
}

function transferPlayDevice(element) {
    let id = element.getAttribute("data-deviceid");
    if (Devices.currentDeviceId === id) {
        return;
    }

    let currentRequestConfig = Object.assign({}, globalRequestConfig);
    currentRequestConfig.headers["Content-Type"] = 'application/json';
    let body = {
        device_ids: [id],
        play: true
    };
    currentRequestConfig.body = JSON.stringify(body);
    currentRequestConfig.method = "PUT";

    fetch('https://api.spotify.com/v1/me/player', currentRequestConfig)
    .then(response => {
        if (response.status == 204) {
            console.log(`playOnLocal:\t${response}`);
        }
    })
    .catch(reason => {
        console.error(`playOnLocal:\n${reason}`);
    });
}