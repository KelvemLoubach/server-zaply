import { supabase } from '../config/configSupabase';

export const incrementFreePhoto = async (number: string): Promise<boolean> => {
    try {
      // Busca o registro atual para obter o valor atual de free_photo
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('free_photo')
        .eq('user_id', number)
        .single();
      
      if (fetchError) {
        console.error('Erro ao buscar registro para incrementar free_photo:', fetchError);
        return false;
      }
      
      // Incrementa o valor (ou define como 1 se for null/undefined)
      const currentValue = data?.free_photo || 0;
      const newValue = currentValue + 1;
      
      // Atualiza o registro com o novo valor
      const { error: updateError } = await supabase
        .from('messages')
        .update({ free_photo: newValue })
        .eq('user_id', number);
      
      if (updateError) {
        console.error('Erro ao incrementar free_photo:', updateError);
        return false;
      }
      
      console.log(`free_photo incrementado para ${newValue} para o usuário ${number}`);
      return true;
    } catch (error) {
      console.error('Erro ao processar incremento de free_photo:', error);
      return false;
    }
  };
  