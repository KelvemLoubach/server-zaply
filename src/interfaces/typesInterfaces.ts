export interface ZaplyMessageRequest {
    message: string;
    number: string;
    media_url?: string;
    media_name?: string;
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
    nome?: string;
    contente: { role: "user" | "assistant"; content: string }[];
  }

  export interface dataFromZaply {
    number: string;
    type: string;
    url_image?: string;
    message: string;    
    
  }

   
export interface User {
  id: string | number;
  number: string | number;
  data_last_payment: string | null;
}
