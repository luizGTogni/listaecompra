export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiChatParams {
  system: string
  messages: AiMessage[]
}

export interface AiDriver {
  chat(params: AiChatParams): Promise<string>
}
