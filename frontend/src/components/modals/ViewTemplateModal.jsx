import { useEffect, useState } from 'react';

function ViewTemplateModal({ templateId, setShowPopup }) {
    const [template, setTemplate] = useState(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await fetch(`http://localhost:8000/templates/${templateId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setTemplate(data.template);
                } else {
                    alert('Failed to fetch template details');
                }
            } catch (error) {
                console.error('Failed to load template:', error);
            }
        };

        fetchTemplate();
    }, [templateId]);

    if (!template) return null;

    return (
        <div className="template-modal-overlay">
            <div className="template-modal-content">
                <h2 className="template-modal-title">Template Details</h2>

                <table className="template-table">
                    <tbody>
                    <tr>
                        <td className="template-label">ID:</td>
                        <td className="template-value">{template.id}</td>
                    </tr>
                    <tr>
                        <td className="template-label">Name:</td>
                        <td className="template-value">{template.name}</td>
                    </tr>
                    <tr>
                        <td className="template-label">Created By:</td>
                        <td className="template-value">{template.created_by || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <td className="template-label">Created At:</td>
                        <td className="template-value">{new Date(template.created_at).toLocaleDateString()}</td>
                    </tr>
                    </tbody>
                </table>

                {template.fields?.length > 0 && (
                    <>
                        <h3 className="custom-fields-title">Custom Fields</h3>
                        <table className="custom-fields-table">
                            <tbody>
                            {template.fields.map((field, index) => (
                                <tr key={index}>
                                    <td className="custom-field-label">{field.name}:</td>
                                    <td className="custom-field-value">
                                        <div className="custom-field-info">
                                            {field.type === 'dropdown'
                                                ? `Options: ${field.options.join(', ')}`
                                                : `Type: ${field.type}`}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}

                <div className="template-modal-actions">
                    <button onClick={() => setShowPopup(false)} className="template-close-btn">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewTemplateModal;
