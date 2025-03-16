import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/checkAuth', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUserRole(data.user.role);
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const logout = async () => {
        await fetch('http://localhost:8000/logout', { method: 'POST' });
        navigate('/login');
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return { userRole, fetchCurrentUser, logout };
};