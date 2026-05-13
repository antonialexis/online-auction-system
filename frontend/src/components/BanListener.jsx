import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const BanListener = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let channel;

        const checkBanStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Initial check
            const { data, error } = await supabase
                .from('users')
                .select('is_banned')
                .eq('id', user.id)
                .single();

            if (data?.is_banned) {
                handleLogout();
                return;
            }

            // Real-time subscription to own user record
            channel = supabase
                .channel(`user-ban-check-${user.id}`)
                .on('postgres_changes', 
                    { 
                        event: 'UPDATE', 
                        schema: 'public', 
                        table: 'users', 
                        filter: `id=eq.${user.id}` 
                    }, 
                    (payload) => {
                        if (payload.new.is_banned) {
                            handleLogout();
                        }
                    }
                )
                .subscribe();
        };

        const handleLogout = async () => {
            await supabase.auth.signOut();
            alert("You have been banned by the admin.");
            navigate('/');
        };

        checkBanStatus();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [navigate]);

    return null; // This component doesn't render anything
};

export default BanListener;
