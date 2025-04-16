import axios from 'axios';
import { Sector } from '../models/sector';

const API_BASE_URL = 'https://api.slmglobal.vn/api';

export const sectorApi = {
  /**
   * Fetch all sectors with their combos and contents
   */
  getAllSectors: async (): Promise<Sector[]> => {
    const response = await axios.get<Sector[]>(`${API_BASE_URL}/sector`);
    return response.data;
  },

  /**
   * Fetch a specific sector by ID
   */
  getSectorById: async (sectorId: number): Promise<Sector> => {
    const response = await axios.get<Sector[]>(`${API_BASE_URL}/sector`);
    const sector = response.data.find(s => s.id === sectorId);
    if (!sector) {
      throw new Error(`Sector with ID ${sectorId} not found`);
    }
    return sector;
  }
}; 