export interface ZaplyMessageRequest {
    message: string;
    number: string;
}


// Interface para o corpo da requisição
export interface MessageRequest {
    message: string;
    number: string;
}

// Interface para a resposta da API
export interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}


  export interface Conversation {
    number: string;
    type: string;
    url_image?: string;
    contente: { role: "user" | "assistant"; content: string }[];
  }

  export interface dataFromZaply {
    number: string;
    type: string;
    url_image?: string;
    message: string;    
    
  }