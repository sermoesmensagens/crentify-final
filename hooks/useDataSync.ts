import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveUserData } from '../services/userDataService';

const DEBOUNCE_MS = 2000;

/**
 * Hook to automatically save state to Supabase when it changes.
 * Debounced to prevent excessive API calls.
 */
export const useDataSync = (key: string, value: any) => {
    const { user } = useAuth();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        // Se não houver usuário logado, não faz nada
        if (!user) return;

        // Pula a primeira renderização para evitar salvar o estado inicial (que pode ser o padrão ou vindo do localStorage)
        // Queremos salvar apenas quando o usuário faz alterações
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        // Limpa o timer anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Agenda o salvamento
        timeoutRef.current = setTimeout(() => {
            saveUserData(key, value).catch(err => console.error(`Failed to sync ${key}`, err));
        }, DEBOUNCE_MS);

        // Limpeza ao desmontar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, key, user]);
};
