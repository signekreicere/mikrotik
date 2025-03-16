import { useState, useEffect } from 'react';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/users', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading, error, fetchUsers };
};