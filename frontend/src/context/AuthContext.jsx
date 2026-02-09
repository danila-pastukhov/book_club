import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsername } from '@/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Используем React Query как единственный источник истины для auth данных
  const { data, isLoading, error } = useQuery({
    queryKey: ['username'],
    queryFn: getUsername,
    staleTime: 1000 * 60 * 5, // 5 минут
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, // Не повторяем запрос при ошибке (401)
  });

  // Вычисляемые значения на основе данных из React Query
  const isAuthenticated = !!data?.username;
  const username = data?.username || null;
  const isSuperuser = data?.is_superuser || false;

  // Функции для управления состоянием аутентификации
  const login = () => {
    // Инвалидируем кэш, чтобы запустить повторный запрос
    queryClient.invalidateQueries({ queryKey: ['username'] });
  };

  const logout = () => {
    // Очищаем все данные аутентификации
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    // Сбрасываем кэш React Query
    queryClient.setQueryData(['username'], null);
    queryClient.invalidateQueries({ queryKey: ['username'] });
    // Очищаем весь кэш для безопасности
    queryClient.clear();
  };

  const value = {
    isAuthenticated,
    username,
    isSuperuser,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
