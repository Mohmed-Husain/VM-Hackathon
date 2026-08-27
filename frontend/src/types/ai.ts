export type AiAssistantSource = {
  topic_id: string;
  title: string;
  source_label: string;
  source_path: string;
  excerpt: string;
};

export type AiChatRequest = {
  message: string;
  application_id?: string;
  current_step?: number;
};

export type AiChatResponse = {
  answer: string;
  mode: "rules" | "openai";
  sources: AiAssistantSource[];
  suggested_prompts: string[];
};
