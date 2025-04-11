// User model based on API response
export interface User {
  id: number;
  role_id: number;
  email: string | null;
  password: string;
  created_at: string;
  commission_rate: number | null;
  name: string;
  phone: string;
  parent_id: number | null;
  total_commission: number | null;
  role: {
    name: string;
    description: string | null;
    id: number;
  };
  address?: string;
  idNumber?: string;
  birthDate?: string;
  gender?: string;
  issueDate?: string;
  issuePlace?: string;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login credentials interface
export interface LoginCredentials {
  phone: string;
  password: string;
}

export default User; 