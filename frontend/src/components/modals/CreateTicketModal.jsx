import { useState, useEffect } from 'react';

function CreateTicketModal({ setShowPopup, refreshTickets }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [templates, setTemplates] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [assigneeId, setAssigneeId] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
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
            } catch {
                alert('Failed to fetch templates');
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/users', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users);
                }
            } catch {
                alert('Failed to fetch users');
            }
        };

        fetchTemplates();
        fetchUsers();
    }, []);

    const handleTemplateSelect = (templateId) => {
        const selected = templates.find(template => template.id === Number(templateId));
        setTemplateId(templateId);

        if (selected?.fields) {
            setCustomFields(
                selected.fields.map(field => ({
                    name: field.name,
                    type: field.type,
                    options: field.type === 'dropdown' ? field.options : [],
                    value: field.type === 'dropdown' ? field.options[0] : ''
                }))
            );
        } else {
            setCustomFields([]);
        }
    };

    const handleCustomFieldChange = (index, value) => {
        const updatedFields = [...customFields];
        updatedFields[index].value = value;
        setCustomFields(updatedFields);
    };

    const handleSave = async () => {
        if (!title.trim() || !templateId) {
            alert('Title and template are required');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/create-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    description,
                    template_id: templateId,
                    assignee_id: assigneeId || null,
                    custom_fields: customFields.reduce((acc, field) => {
                        acc[field.name] = field.value;
                        return acc;
                    }, {})
                })
            });

            if (response.ok) {
                refreshTickets();
                setShowPopup(false);
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch {
            alert('Failed to create ticket');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create New Ticket</h2>

                <select
                    value={templateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="field-row"
                >
                    <option value="">Select Template</option>
                    {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>

                {templateId && (
                    <>
                        <input
                            className="field-row"
                            type="text"
                            placeholder="Ticket Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className="field-row"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <select
                            value={assigneeId || ''}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="field-row"
                        >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>

                        {customFields.map((field, index) => (
                            <div key={index} className="field-row">
                                <label>{field.name}</label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={field.value}
                                        onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                                    >
                                        {field.options.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={field.value}
                                        onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </>
                )}

                <div className="modal-actions">
                    <button onClick={handleSave} className="btn-save">Save</button>
                    <button onClick={() => setShowPopup(false)} className="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default CreateTicketModal;
