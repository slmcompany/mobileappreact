import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Combo } from '../models/sector';

export function useCombo(id: number) {
  return useQuery<Combo>({
    queryKey: ['combo', id],
    queryFn: async () => {
      const response = await axios.get(`https://api.slmglobal.vn/api/pre_quote/combo/${id}`);
      return response.data;
    },
    enabled: !!id
  });
} 