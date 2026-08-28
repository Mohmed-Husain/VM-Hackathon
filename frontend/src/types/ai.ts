export type AiAssistantSource = {
  topic_id: string;
  title: string;
  source_label: string;
  source_path: string;
  excerpt: string;
};

export type AiChatRequest = {
  message: string;
  session_id?: string;
  application_id?: string;
  current_step?: number;
};

export type AiChatResponse = {
  answer: string;
  session_id: string;
  mode: "rules" | "langchain";
  sources: AiAssistantSource[];
  suggested_prompts: string[];
};
