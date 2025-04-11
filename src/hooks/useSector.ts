import { useQuery } from '@tanstack/react-query';
import { sectorApi } from '../services/api';
import { Sector } from '../models/sector';

// Query keys
export const sectorKeys = {
  all: ['sectors'] as const,
  detail: (id: number) => [...sectorKeys.all, id] as const,
};

export const useSectors = () => {
  return useQuery({
    queryKey: sectorKeys.all,
    queryFn: sectorApi.getAllSectors,
    retry: 3, // Retry failed requests 3 times
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};

export const useSector = (sectorId: number) => {
  return useQuery({
    queryKey: sectorKeys.detail(sectorId),
    queryFn: () => sectorApi.getSectorById(sectorId),
    enabled: !!sectorId,
    retry: 3,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}; 