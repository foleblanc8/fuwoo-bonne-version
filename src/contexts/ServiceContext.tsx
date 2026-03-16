// src/contexts/ServiceContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface Service {
  id: number;
  provider: any;
  category: Category;
  title: string;
  description: string;
  price: string;
  price_unit: string;
  duration: number;
  service_area: string;
  max_distance: number;
  is_active: boolean;
  instant_booking: boolean;
  rating: number;
  total_bookings: number;
  images: any[];
}

interface ServiceContextType {
  categories: Category[];
  services: Service[];
  selectedCategory: Category | null;
  loading: boolean;
  fetchCategories: () => Promise<void>;
  fetchServices: (filters?: any) => Promise<void>;
  searchServices: (query: string) => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('categories/');
      const data = response.data as { results?: Category[] } | Category[];
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (filters?: any) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }

      const response = await axios.get<{ results?: Service[] } | Service[]>(`services/?${params}`);
      const data = response.data;
      setServices(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchServices = async (query: string) => {
    try {
      setLoading(true);
      const response = await axios.get<{ results?: Service[] } | Service[]>(`services/?search=${query}`);
      setServices(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        categories,
        services,
        selectedCategory,
        loading,
        fetchCategories,
        fetchServices,
        searchServices,
        setSelectedCategory,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices doit être utilisé à l\'intérieur d\'un ServiceProvider');
  }
  return context;
};

