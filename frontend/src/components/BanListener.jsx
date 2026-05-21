import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { notify } from '../utils/notifications';

const BanListener = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        let channel;
        let loggingOut = false;

        const removeCurrentChannel = () => {
            if (channel) {
                supabase.removeChannel(channel);
                channel = undefined;
            }
        };

        const handleLogout = async () => {
            if (loggingOut) return;
            loggingOut = true;
            removeCurrentChannel();
            await supabase.auth.signOut();
            notify("You have been banned by the admin.", "error");
            navigate('/', { replace: true });
        };

        const checkBanStatus = async (user) => {
            if (!active || !user) {
                removeCurrentChannel();
                return;
            }

            removeCurrentChannel();

            // Initial check
            const { data, error } = await supabase
                .from('users')
                .select('is_banned')
                .eq('id', user.id)
                .maybeSingle();

            if (!active) return;

            if (error) {
                console.warn("Could not check ban status:", error.message);
                return;
            }

            if (data?.is_banned) {
                handleLogout();
                return;
            }

            // Real-time subscription to own user record
            const channelId =
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`;

            channel = supabase
                .channel(`user-ban-check-${user.id}-${channelId}`)
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

        supabase.auth.getSession().then(({ data: { session } }) => {
            checkBanStatus(session?.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            checkBanStatus(session?.user);
        });

        return () => {
            active = false;
            subscription.unsubscribe();
            removeCurrentChannel();
        };
    }, [navigate]);

    return null; // This component doesn't render anything
};

export default BanListener;
