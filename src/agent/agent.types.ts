export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface BaseMessage {
    id?: string;
    timestamp?: number;
    role: MessageRole;
    content?: string;
    metaData?: Record<string, any>
}

export interface FileUploadMessage extends BaseMessage {
    role: MessageRole;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileURL?: string;
    fileContent?: ArrayBuffer | string;
}

export interface ToolCallMessage extends BaseMessage {
    role: 'tool'
    toolName: string;
    parameters: Record<string, any>
}

export type StandardMessage = BaseMessage | FileUploadMessage | ToolCallMessage
