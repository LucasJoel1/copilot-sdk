# Copilot-SDK

**THIS PROJECT IS NOT AFFILIATED OR ENDORSED BY Microsoft or Github**

---

The Copilot SDK is an sdk written in javascript for nodejs projects allowing users to easily authenticate and interface with github copilot seamlessly through a few function calls

## Installation
The sdk can be installed to you project using npm or an npm based package manager.  Installation through `npm` can be done with the following command

`npm install @lucasjoel1/copilot-sdk`

## Usage
Interfacing with the sdk happens through 2 classes, the `Copilot` class and the `Agent` class by creating instance(s) of these classes. **So far only the Copilot class has been implemented for authentication but the `Agent` class is currently being worked on and will be released at 1.0.0 along with other core features**

### Copilot Class

You can use the copilot class as such

```ts
import { Copilot } from "@lucasjoel1/copilot-sdk"

// create new instance of copilot, each instance holds 1 api key/token
// create multiple instances to have multiple users logged in 
// and tied to their own instances

// create empty copilot instance
const ai = new Copilot();

// holds detail for logging into github
const ghLoginDetails = await ai.GithubLogin();

console.log(ghLoginDetails);
/*
{
    device_code: '<device code>',
    expires_in: <expiration in seconds>,
    interval: <polling interval in seconds>,
    user_code: 'A12B-1234', // code to enter into login page
    verification_uri: 'https://github.com/login/device' // url to follow to login
}
*/

// polls github waiting for user to login and stores copilot login details
await ai.WaitForLogin()
// output github copilot auth details
console.log(ai.GetCopilotAuth())
/*
{
  refreshToken: '<refresh token>',
  copilotAuthKey: '<authentication token>',
  copilotAuthKeyExp: <auth token ttl before needed refresh>,
  isLoggedIn: true, // if user is logged in
  baseUrl: 'https://api.individual.githubcopilot.com' // api endpoint for copilot calls
}
*/
```

Realistically the only function you need output from is the `GithubLogin()` function as that gives you the code and url for login, the other two are just in case the user wants to further extend the sdk beyond its capabilities or access an endpoint that is not currently covered by the sdk

### Agent Class
COMING SOON
