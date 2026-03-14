import { Copilot } from "../copilot/copilot";
import { StandardMessage } from "./agent.types";

export class Agent {
    /**
     *
     * @param _auth copilot object to pass in to authenticate with
     * @param _context predefined context window
     * @param _systemPrompt system prompt for agent
     */
    constructor(_auth: Copilot, _context: StandardMessage[] = [], _systemPrompt: string = "") {
        this.auth = _auth;
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

    private systemPrompt: string;
    private context: StandardMessage[];
    private auth: Copilot;
}
