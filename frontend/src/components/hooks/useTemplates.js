import { useState, useEffect } from 'react';

export function useTemplates() {
    const [templates, setTemplates] = useState([]);
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/templates', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates);
            } else {
                throw new Error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateById = async (templateId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8000/templates/${templateId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setTemplate(data.template);
            } else {
                throw new Error('Failed to fetch template details');
            }
        } catch (error) {
            console.error('Failed to load template:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return {
        templates,
        template,
        loading,
        error,
        fetchTemplates,
        fetchTemplateById,
    };
}