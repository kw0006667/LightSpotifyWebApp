import Cookies from "cookies";
import { parse } from "cookie";
import { PersonalData } from "../types";
import axiosInstance from "./axios-instance";



export default class Authorization {
    // static access_token: string | undefined = "BQDnw-pN_Sc1WcC9liqw-CIDfml_nyj-tK1rsglQAepfSQleWJbsSwdk1quXGjbN4WfiyNEV8uizk6YcwuLROLwOEvvYBnFatBOE_1paQpHC7PCCPjxJfAHfBRxzjQV6h_FWfRJLQ10FrLf1qus4KbfAY_2clG7gNqoLF_prckVQN9S7R5hy4bLI8ACSFEEaNLAH8wKb76Dc1RNX5pHLr_Z7_OLj3kCN8bC9X50JZ-00RyMAb1IsztdDIrgljo2yzC6BUUaqwDMh1uRxbQYzOeZBoydNrnKIbNe08jt6lfHb5mM6rbvL5aCNyYsr";
    // static refresh_token: string | undefined = "AQB0YQp-vGYu6ZeL-EEEOL70nTWWNxJGRRqT8TaZJo4rWvwKE-m1AnCj5fvxh2heF5C8cR-ro521EBXhpm2Fs2EW9SzUnQ6pumlGTh0zpI3jpIktRNWZ4CVDE9ZvuD927Fg";
    static userId: string = "kw0006667";
    static instance: Authorization;
    loggedIn: boolean = false;
    access_token: string = "";
    refresh_token: string = "";
    personalData: PersonalData | null = null;
    isGettingNewToken: boolean = false;
    currentDeviceId: string = "";

    async RefreshToken() {
        const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "";
        return fetch(hostUrl + '/api/refresh_token_api')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        });
        // .then(data => {
        //     this.access_token = data.access_token;
        //     this.loggedIn = true;
        //     this.isGettingNewToken = false;
        // });
    }

    constructor() {
        const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "";
        axiosInstance.get(hostUrl + '/api/refresh_token_api')
        .then(response => {
            this.access_token = response.data.access_token;
            let requestConfig = {
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                },
                method: 'GET'
            };
            axiosInstance.request(requestConfig)
            .then(response => {
                this.personalData = response.data;
            });
        });
    }
    
    static create() {
        return new Authorization();
    }

    login() {
        location.assign('/api/login');
    }

    setUserData(personalData: PersonalData) {
        if (personalData) {
            this.personalData = personalData;
        }
    }

    checkIsLoggedIn() {
        const cookies = parse(document.cookie);
        if (cookies) {
            this.access_token = cookies.access_token;
            this.refresh_token = cookies.refresh_token;
            console.log(this.access_token);

            if (!this.refresh_token) {
                this.loggedIn = false;
                // location.assign('/api/login');
            }

            if (!this.access_token) {
                this.RefreshToken();
            }

            let requestConfig = {
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                }
            };

            fetch('https://api.spotify.com/v1/me', requestConfig)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    this.RefreshToken()
                    .then(data => {
                        this.access_token = data.access_token;
                    });
                }           
            })
            .then(data => {
                this.personalData = data;
                this.loggedIn = true;
            })
            .catch(reason => {
                console.error(`fetchPersonalData:\n${reason}`);
            });
        }
    }
}