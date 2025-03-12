import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTemplateModal from './modals/CreateTemplateModal';

function Templates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('http://localhost:8000/templates', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const handleArchiveTemplate = async (id) => {
        if (confirm('Are you sure you want to archive this template?')) {
            try {
                const response = await fetch(`http://localhost:8000/archive-template/${id}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    fetchTemplates();
                }
            } catch (error) {
                console.error('Error archiving template:', error);
            }
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Mikrotik TMS</h1>
                <div className="button-group">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
                    <button className="btn btn-logout" onClick={() => console.log('Logout')}>Logout</button>
                </div>
            </div>

            <div className="dashboard-header">
                <h2>All Templates</h2>
                <div className="button-group">
                    <button onClick={() => setShowPopup(true)}>+ Create Template</button>

                    {showPopup && (
                        <CreateTemplateModal
                            setShowPopup={setShowPopup}
                            refreshTemplates={fetchTemplates}
                        />
                    )}
                </div>
            </div>

            <div className="t-list">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Created By</th>
                        <th>Created At</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {templates.map((template) => (
                        <tr key={template.id}>
                            <td>{template.id}</td>
                            <td>{template.name}</td>
                            <td>{template.created_by || 'Unknown'}</td>
                            <td>{new Date(template.created_at).toLocaleDateString()}</td>
                            <td className="template-actions">
                                    <span
                                        className="delete-icon"
                                        onClick={() => handleArchiveTemplate(template.id)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Templates;
