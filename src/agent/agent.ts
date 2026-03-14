import { readFile } from "fs/promises";
import { Copilot } from "../copilot/copilot";
import { BaseMessage, FileUploadMessage, StandardMessage } from "./agent.types";
import { readFileSync } from "fs";
import { COPILOT_HEADERS } from "../globals";
import { randomUUID } from "crypto";

export class Agent {
    /**
     *
     * @param _auth copilot object to pass in to authenticate with
     * @param _model model to be used with agent
     * @param _systemPrompt system prompt for agent
     * @param _context predefined context window
     */
    constructor(_auth: Copilot, _model: string, _systemPrompt: string = "", _context: StandardMessage[] = []) {
        this.auth = _auth;
        this.model = _model;
        this.systemPrompt = _systemPrompt;
        this.context = _context;
    }

    /**
     *
     * @param _systemPrompt system prompt for agent
     */
    public SetSystemPrompt(_systemPrompt: string) {
        this.systemPrompt = _systemPrompt;
    }

    /**
     * @brief Set the authenticated user to use with agent
     * @param _auth
     */
    public SetCopilot(_auth: Copilot) {
        this.auth = _auth
    }

    /**
     *
     * @param prompt prompt text
     * @param auth optional different user to use than one defaulted with agent
     * @returns message sent back by agent
     */
    public async PromptText(prompt: string, auth?: Copilot): Promise<BaseMessage> {
        if (auth === undefined) auth = this.auth
        await auth.RefreshTokenIfNeeded()
        const authInfo = auth.GetCopilotAuth();
        this.context.push({
            role: "user",
            content: prompt,
            id: randomUUID(),
            timestamp: Date.now(),
            metaData: {
                model: this.model
            }
        } as BaseMessage)
        const body = {
            model: this.model,
            messages: [
                { role: "system", content: this.systemPrompt },
                ...this.context.map((m) => (
                    { "role": m.role, "content": m.content }
                ))
            ],
            stream: false
        }

        const res = await fetch("https://api.githubcopilot.com/chat/completions", {
            method: "POST",
            headers: {
                ...COPILOT_HEADERS,
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Host": "github.com",
                "Authorization": `Bearer ${authInfo.copilotAuthKey}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        const responseMessage: BaseMessage = {
            id: randomUUID(),
            timestamp: Date.now(),
            role: "assistant",
            content: data.choices[0].message.content,
            metaData: {
                model: this.model
            }
        }

        this.context.push(responseMessage);
        return responseMessage
    }

    public async PromptFile(prompt: FileUploadMessage, auth?: Copilot) {
        if (auth === undefined) auth = this.auth

    }

    private systemPrompt: string;
    private context: StandardMessage[];
    private model: string;
    private auth: Copilot;
}
