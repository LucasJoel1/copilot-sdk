export interface GithubCopilotToken {
    token: string;
    expires_at: number;
}

export interface GithubAuthResponse {
    device_code: string;
    expires_in: number;
    interval: number;
    user_code: string;
    verification_uri: string;
}

export interface DeviceTokenSuccessResponse {
	access_token: string;
	token_type?: string;
	scope?: string;
};

export interface DeviceTokenErrorResponse {
	error: string;
	error_description?: string;
	interval?: number;
};

export interface CopilotTokenInfo {
    refresh: string,
    access: string,
    expires: number
}
