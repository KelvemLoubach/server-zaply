import { supabase } from "../config/configSupabase";
import { User } from "../interfaces/typesInterfaces";

/**
 * Verifica e atualiza o status de pagamento dos usuários
 * Usuários com data_last_payment igual ou menor que a data atual terão payment = false
 * @returns Objeto com informações sobre a operação
 */
export const checkExpiredPayments = async (): Promise<{
  success: boolean;
  updatedCount?: number;
  error?: string;
}> => {
  try {
    console.log("Iniciando verificação de pagamentos expirados...");
    
    // Obter a data atual sem a parte de hora/minuto/segundo
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    console.log(`Data atual para comparação: ${currentDate.toISOString().split('T')[0]}`);
    
    // Buscar usuários com payment = true
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id, number, data_last_payment")
      .eq("payment", true);
    
    if (fetchError) {
      console.error("Erro ao buscar usuários:", fetchError.message);
      return { success: false, error: fetchError.message };
    }
    
    console.log(`Encontrados ${users?.length || 0} usuários com payment = true`);
    
    if (!users || users.length === 0) {
      console.log("Nenhum usuário com payment = true encontrado.");
      return { success: true, updatedCount: 0 };
    }
    
    // Filtrar usuários com data_last_payment igual ou menor que a data atual
    const expiredUsers = users.filter((user: User) => {
      if (!user.data_last_payment) return false;
      
      // Converter a data_last_payment para objeto Date e remover a parte de hora
      const paymentDate = new Date(user.data_last_payment);
      const paymentDateOnly = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth(),
        paymentDate.getDate()
      );
      
      // Comparar apenas as datas (sem hora/minuto/segundo)
      return paymentDateOnly <= currentDate;
    });
    
    console.log(`Encontrados ${expiredUsers.length} usuários com pagamento expirado`);
    
    if (expiredUsers.length === 0) {
      console.log("Nenhum usuário com pagamento expirado encontrado.");
      return { success: true, updatedCount: 0 };
    }
    
    // Extrair IDs dos usuários expirados
    const expiredUserIds = expiredUsers.map((user: User) => user.id);
    console.log("IDs dos usuários com pagamento expirado:", expiredUserIds);
    
    // Atualizar o campo payment para false para os usuários expirados
    const { error: updateError } = await supabase
      .from("users")
      .update({ payment: false })
      .in("id", expiredUserIds);
    
    if (updateError) {
      console.error("Erro ao atualizar usuários:", updateError.message);
      return { success: false, error: updateError.message };
    }
    
    console.log(`${expiredUsers.length} usuários atualizados com payment = false`);
    
    return {
      success: true,
      updatedCount: expiredUsers.length
    };
  } catch (error) {
    console.error("Erro inesperado ao verificar pagamentos expirados:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

