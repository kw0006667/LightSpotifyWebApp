import React from "react";
import { Device } from "../types"

type DeviceProps = {
    device: Device,
    callback: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void
}

function DeviceItemDOM(props: DeviceProps) {

    return(
        <a href="#" className={"list-group-item list-group-item-action d-flex gap-3 py-1 " + (props.device.is_active ? "active-device" : "")} aria-current="true" data-deviceid={props.device.id} onClick={(e) => {props.callback(e, props.device.id)}}>
            <span style={{fontSize: "30px"}}><i className="bi bi-laptop" ></i></span>
            <div>
                <span style={{fontSize: "14px"}}>{props.device.name}</span>
                <div className="d-flex align-items-center">
                    <i className="bi bi-speaker"></i>
                    <span style={{marginLeft: "5px", fontSize: "12px"}}>{props.device.type}</span>
                </div>
            </div>
        </a>
    );
}

export default DeviceItemDOM;