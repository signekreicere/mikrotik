import { useState, useEffect } from 'react';

export const useStatuses = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStatuses = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/statuses', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setStatuses(data.statuses);
            } else {
                throw new Error('Failed to load statuses');
            }
        } catch (error) {
            console.error('Failed to load statuses:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    return { statuses, loading, error, fetchStatuses };
};