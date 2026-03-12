import { StandardMessage } from "./agent.types";

export class Agent {
    constructor(_context: StandardMessage[] = []) {
        this.context = _context;
    }

    private context: StandardMessage[];
}
