import { supabase } from './supabaseClient';

export interface UserDataRecord {
    key: string;
    value: any;
}

/**
 * Loads all user data records from Supabase for the current user.
 * Returns a map of key -> value.
 */
export const loadUserData = async (): Promise<Record<string, any>> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return {};

    const { data, error } = await supabase
        .from('user_data')
        .select('key, value');

    if (error) {
        console.error('Error loading user data:', error);
        return {};
    }

    const userData: Record<string, any> = {};
    if (data) {
        data.forEach((item) => {
            userData[item.key] = item.value;
        });
    }
    return userData;
};

/**
 * Saves a specific key-value pair to Supabase.
 * Upserts the record (insert or update).
 */
export const saveUserData = async (key: string, value: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.warn('Cannot save user data: No active session');
        return;
    }

    const { error } = await supabase
        .from('user_data')
        .upsert({
            user_id: session.user.id,
            key,
            value,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error(`Error saving user data for key "${key}":`, error);
    }
};
