export const COPILOT_HEADERS = {
	"User-Agent": "GitHubCopilotChat/0.35.0",
	"Editor-Version": "vscode/1.107.0",
	"Editor-Plugin-Version": "copilot-chat/0.35.0",
	"Copilot-Integration-Id": "vscode-chat",
} as const;

export const CLIENT_ID = new TextDecoder().decode(Buffer.from("SXYxLmI1MDdhMDhjODdlY2ZlOTg=", "base64"))
