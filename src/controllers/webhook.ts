import { Request, Response } from "express";
import { supabase } from "../config/configSupabase"; // Certifique-se de que o supabase está importado corretamente

// Função para verificar e atualizar/criar usuário
export const webhook = async (req: Request, res: Response) => {
  try {
    console.log(req.body.created_at);
    console.log(req.body.customer.phone_number);
    console.log(req.body);
  // Exibe os headers de forma legível


    // Verificar se o corpo da requisição contém os campos necessários
    if (!req.body.created_at || !req.body.customer.phone_number) {
      console.error("Erro: Corpo da requisição inválido ou incompleto");
      return res.status(400).json({
        success: false,
        error: "Corpo da requisição inválido ou incompleto"
      });
    }
  
    const phone_number = req.body.customer.phone_number;
    const created_at = req.body.created_at;
    
    // Formatar o número do telefone
    const userId = `${phone_number}@c.us`; // Formato do número
    console.log(`ID do usuário formatado: ${userId}`);
    
    // Verifica se o usuário já existe
    console.log("Verificando se o usuário já existe...");
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("number", userId)
      .single(); // Obtém um único usuário
    
    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 é o código para "nenhum resultado encontrado"
      console.error("Erro ao buscar usuário:", fetchError.message, fetchError.code);
      return res.status(500).json({
        success: false,
        error: fetchError.message
      });
    }
    
    // Extrair apenas a parte da data (yyyy-mm-dd) do timestamp
    const paymentDateString = created_at.split(' ')[0];
    
    // Criar um objeto Date a partir da string de data
    const paymentDate = new Date(paymentDateString);
    
    // Adicionar 30 dias à data
    paymentDate.setDate(paymentDate.getDate() + 30);
    
    // Formatar a data para yyyy-mm-dd
    const expirationDate = paymentDate.toISOString().split('T')[0];
    
    console.log(`Data original: ${created_at}`);
    console.log(`Data do pagamento: ${paymentDateString}`);
    console.log(`Data de expiração (+ 30 dias): ${expirationDate}`);
    
    if (existingUser) {
      // Se o usuário existir, atualiza os campos
      console.log(`Usuário encontrado com ID: ${existingUser.id}. Atualizando...`);
      const { error: updateError } = await supabase
        .from("users")
        .update({
          payment: true,
          data_last_payment: paymentDate,
        })
        .eq("id", existingUser.id); // Atualiza o usuário encontrado
      
      if (updateError) {
        console.error("Erro ao atualizar usuário:", updateError.message);
        return res.status(500).json({
          success: false,
          error: updateError.message
        });
      }
      
      console.log("Usuário atualizado com sucesso:", existingUser.id);
      return res.status(200).json({
        success: true,
        message: "Usuário atualizado com sucesso."
      });
    } else {
      // Se o usuário não existir, cria um novo
      console.log("Usuário não encontrado. Criando novo usuário...");
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([{ 
          number: userId, 
          payment: true, 
          data_last_payment: paymentDate,
          created_at: new Date() // Data de criação do registro
        }])
        .select(); // Retorna os dados inseridos
      
      if (insertError) {
        console.error("Erro ao criar usuário:", insertError.message);
        return res.status(500).json({
          success: false,
          error: insertError.message
        });
      }
      
      console.log("Usuário criado com sucesso:", newUser ? newUser[0]?.id : userId);
      return res.status(201).json({ // 201 Created
        success: true,
        message: "Usuário criado com sucesso.",
        data: newUser
      });
    }
  } catch (error) {
    // Captura qualquer erro não tratado
    console.error("Erro inesperado no webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
};