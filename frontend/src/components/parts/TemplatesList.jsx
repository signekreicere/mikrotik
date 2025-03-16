import React from 'react';

function TemplatesList({ templates, userRole, handleArchiveTemplate, setViewTemplateId }) {
    return (
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Created By</th>
                <th>Created At</th>
                {userRole === 'admin' && <th></th>}
            </tr>
            </thead>
            <tbody>
            {templates.map((template) => (
                <tr
                    key={template.id}
                    onClick={(e) => {
                        if (!e.target.closest('.delete-icon')) {
                            setViewTemplateId(template.id);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <td>{template.id}</td>
                    <td>{template.name}</td>
                    <td>{template.created_by || 'Unknown'}</td>
                    <td>{new Date(template.created_at).toLocaleDateString()}</td>
                    {userRole === 'admin' && (
                        <td>
                            <button
                                className="delete-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveTemplate(template.id);
                                }}
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
                            </button>
                        </td>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default TemplatesList;