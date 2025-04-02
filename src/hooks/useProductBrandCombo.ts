import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Combo } from '../models/sector';

interface ProductBrandCombo {
  id: number;
  name: string;
  type: string;
  image: string;
  total_price: number;
  power_output: string;
  description?: string;
}

export function useProductBrandCombo(comboId: number) {
  return useQuery<ProductBrandCombo, Error>({
    queryKey: ['productBrandCombo', comboId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/product-brands/combos/${comboId}`);
      return data;
    },
    enabled: !!comboId,
  });
} 