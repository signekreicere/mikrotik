import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from './hooks/useTemplates';
import { useAuth } from './hooks/useAuth';
import CreateTemplateModal from './modals/CreateTemplateModal';
import ViewTemplateModal from './modals/ViewTemplateModal';
import TemplatesList from "./parts/TemplatesList.jsx";

function Templates() {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [viewTemplateId, setViewTemplateId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const { templates, fetchTemplates } = useTemplates();
    const { userRole, logout } = useAuth();

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

    const filteredTemplates = templates.filter(template =>
        showArchived ? true : !template.is_archived
    );

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Mikrotik TMS</h1>
                <div className="button-group">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </button>
                    <button className="btn btn-logout" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-header">
                <h2>All Templates</h2>
                <div className="button-group">
                    {userRole === 'admin' && (
                        <button onClick={() => setShowPopup(true)}>+ Create Template</button>
                    )}

                    <label style={{ marginLeft: '1rem' }}>
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={() => setShowArchived(prev => !prev)}
                        />
                        Show Archived
                    </label>

                    {showPopup && (
                        <CreateTemplateModal
                            setShowPopup={setShowPopup}
                            refreshTemplates={fetchTemplates}
                        />
                    )}
                </div>
            </div>

            <div className="t-list">
                <TemplatesList
                    templates={filteredTemplates}
                    userRole={userRole}
                    handleArchiveTemplate={handleArchiveTemplate}
                    setViewTemplateId={setViewTemplateId}
                />
            </div>

            {viewTemplateId && (
                <ViewTemplateModal
                    templateId={viewTemplateId}
                    setShowPopup={() => setViewTemplateId(null)}
                />
            )}
        </div>
    );
}

export default Templates;