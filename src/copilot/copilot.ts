import { COPILOT_HEADERS, CLIENT_ID } from "../globals";
import type { CopilotTokenInfo, DeviceTokenErrorResponse, DeviceTokenSuccessResponse, GithubAuthResponse, GithubCopilotToken, CopilotRefreshTokenInfo } from "./copilot.types"

/**
 * @brief Base class for interfacing with the Copilot SDK
 */
export class Copilot {
    /**
     * @brief allows for passing in params if logged in from previous session to recreate Copilot object
     * @param _refreshToken github copilot refresh token
     * @param _copilotAuthKey github copilot auth key
     * @param _expiration copilot auth key expiration in unix time ms
     */
    constructor(_refreshToken?: string, _copilotAuthKey?: string, _expiration?: number, _baseURL?: string) {
        if (_refreshToken) this.refreshToken = _refreshToken;
        if (_copilotAuthKey) this.copilotAuthKey = _copilotAuthKey;
        if (_expiration) this.expiration = _expiration;
        if (_baseURL) this.baseURL = _baseURL;
    }

    /**
     * @brief generates a login for github
     * @returns Authentication information for github
     */
    public async GithubLogin() {
        const data = await fetch('https://github.com/login/device/code', {
                method: "POST",
                headers: {
                    ...COPILOT_HEADERS,
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Host": "github.com"
                },
                body: JSON.stringify({
                    "client_id": CLIENT_ID,
                    "scope": "read:user"
                })
        })



        if (!data || typeof data !== "object") {
            throw new Error("Invalid device code")
        }

        const params = new URLSearchParams(await data.text())

        const outputData: GithubAuthResponse = {
            device_code: params.get("device_code")!,
            expires_in: Number(params.get("expires_in")),
            interval: Number(params.get("interval")),
            user_code: params.get("user_code")!,
            verification_uri: params.get("verification_uri")!
        }
        this.currAuthResponse = outputData;

        return outputData
    }

    /**
     *
     * @param res response from GithubLogin (can be empty if GithubLogin was already run)
     * @returns github copilot refresh token
     */
    public async WaitForLogin(res?: GithubAuthResponse): Promise<CopilotTokenInfo> {
        if (res === undefined) {
            if (this.currAuthResponse === undefined) {
                throw new Error("Please either go through the GithubLogin function or pass in an AuthResponse object")
            } else {
                res = this.currAuthResponse
            }
        }

        let sleepTime = 5000;
        const expiresAt = Date.now() + Number(res.expires_in) * 1000;
        while (Date.now() < expiresAt) {
            const raw = await (await fetch("https://github.com/login/oauth/access_token", {
                method: "POST",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "GitHubCopilotChat/0.35.0",
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    device_code: res.device_code,
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                }),
            })).json()

            if (raw && typeof raw === "object" && typeof (raw as DeviceTokenSuccessResponse).access_token === "string") {
                this.refreshToken = (raw as DeviceTokenSuccessResponse).access_token
                return await this.GetGithubCopilotToken();
            }

      		if (raw && typeof raw === "object" && typeof (raw as DeviceTokenErrorResponse).error === "string") {
    			const err = (raw as DeviceTokenErrorResponse).error;
    			if (err === "authorization_pending") {
                    await this.sleep(sleepTime);
    				continue;
    			}

                if (err === "slow_down") {
                    sleepTime += 5000
                    continue;
                }

                sleepTime += 5000
                await this.sleep(sleepTime)

    			throw new Error(`Device flow failed: ${err}`);
            }
            await this.sleep(sleepTime);
        }
       	throw new Error("Device flow timed out");
    }

    public GetCopilotAuth() {
        if (!this.isLoggedIn) throw new Error("Not logged in to Github Copilot")
        return {
            refreshToken: this.refreshToken,
            copilotAuthKey: this.copilotAuthKey,
            copilotAuthKeyExp: this.expiration,
            isLoggedIn: this.isLoggedIn,
            baseUrl: this.baseURL
        }
    }

    public SetRefreshCallback(callback: (tokenInfo: CopilotRefreshTokenInfo) => any) {
        this.refreshCallback = callback({ access: this.copilotAuthKey, expires: this.expiration, refresh: this.refreshToken, baseURL: this.baseURL, isLoggedIn: this.isLoggedIn })
    }

    public async RefreshTokenIfNeeded(force?: boolean) {
        if (!force) {
            if (this.expiration > Date.now()) return;
        }
        await this.GetGithubCopilotToken();
        if (this.refreshCallback) {
            this.refreshCallback({
                access: this.copilotAuthKey,
                expires: this.expiration,
                refresh: this.refreshToken,
                baseURL: this.baseURL,
                isLoggedIn: this.isLoggedIn
            });
        }
    }

    private async GetGithubCopilotToken() {
        const domain = "https://api.github.com/copilot_internal/v2/token";

        const tokenRes = await fetch(domain, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${this.refreshToken}`,
                ...COPILOT_HEADERS
            },
        });

        if (!tokenRes || typeof tokenRes !== 'object') {
            throw new Error("Invalid github token");
        }

        const data = await tokenRes.json();

        const token = (data as GithubCopilotToken).token;
        const expiresAt = (data as GithubCopilotToken).expires_at;
       	if (typeof token !== "string" || typeof expiresAt !== "number") {
            throw new Error("Invalid Copilot token response fields");
        }

        this.copilotAuthKey = token;
        this.expiration = (expiresAt * 1000) - (300 * 1000)
        this.isLoggedIn = true;
        this.GenerateGithubBaseURL()
        return {
            refresh: this.refreshToken,
            access: this.copilotAuthKey,
            expires: this.expiration
        }
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private GenerateGithubBaseURL() {
        const match = this.copilotAuthKey.match(/proxy-ep=([^;]+)/);
    	if (!match) return null;
    	const proxyHost = match[1];
    	const apiHost = proxyHost.replace(/^proxy\./, "api.");
        const url = `https://${apiHost}`;
        if (url) this.baseURL = url;
        else this.baseURL = "https://api.individual.githubcopilot.com";
    }

    private refreshToken: string = "";
    private copilotAuthKey: string = "";
    private expiration: number = 0;
    private currAuthResponse: GithubAuthResponse | undefined;
    private baseURL: string = "";
    private isLoggedIn: boolean = false;
    private refreshCallback: ((tokenInfo: CopilotRefreshTokenInfo) => any) | undefined;
}
