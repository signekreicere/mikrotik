import { useState, useEffect } from 'react';

function CreateTicketModal({ setShowPopup, refreshTickets }) {
    const [templateId, setTemplateId] = useState('');
    const [templates, setTemplates] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);

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
        setTemplateId(templateId);

        const selectedTemplate = templates.find(
            template => template.id === Number(templateId)
        );

        if (selectedTemplate?.fields) {
            setTasks([
                {
                    title: '',
                    description: '',
                    assigneeId: '',
                    customFields: selectedTemplate.fields.map(field => ({
                        name: field.name,
                        type: field.type,
                        options: field.type === 'dropdown' ? field.options : [],
                        value: field.type === 'dropdown' ? field.options[0] : ''
                    }))
                }
            ]);
        } else {
            setTasks([]);
        }
    };

    const handleFieldChange = (index, key, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[index][key] = value;
        setTasks(updatedTasks);
    };

    const handleCustomFieldChange = (taskIndex, fieldIndex, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex].customFields[fieldIndex].value = value;
        setTasks(updatedTasks);
    };

    const handleAddAnotherTask = () => {
        if (tasks.length >= 10) {
            alert('You can create up to 10 tasks at once.');
            return;
        }

        setTasks([
            ...tasks,
            {
                title: '',
                description: '',
                assigneeId: '',
                customFields: tasks[0].customFields.map(field => ({
                    ...field,
                    value: field.type === 'dropdown' ? field.options[0] : ''
                }))
            }
        ]);
    };

    const handleRemoveTask = (index) => {
        if (tasks.length === 1) {
            alert("You must have at least one task.");
            return;
        }

        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    const handleSave = async () => {
        if (tasks.some(task => !task.title.trim() || !templateId)) {
            alert('All tasks must have a title and template');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/create-tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(
                    tasks.map(task => ({
                        title: task.title,
                        description: task.description,
                        template_id: templateId,
                        assignee_id: task.assigneeId || null,
                        custom_fields: task.customFields.reduce((acc, field) => {
                            acc[field.name] = field.value;
                            return acc;
                        }, {})
                    }))
                )
            });

            if (response.ok) {
                refreshTickets();
                setShowPopup(false);
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to create tickets');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content scrollable">
                <h2>Create New Ticket(s)</h2>

                {/* Template Selection */}
                <select
                    value={templateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="field-row template-selector"
                >
                    <option value="">Select Template</option>
                    {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>

                {/* Separator */}
                {templateId && <div className="separator" />}

                {/* Task fields only show if template is selected */}
                {templateId && tasks.map((task, index) => (
                    <div key={index} className="task-block">
                        <div className="task-header">
                            {/* Remove button */}
                            {tasks.length > 1 && (
                                <button
                                    onClick={() => handleRemoveTask(index)}
                                    className="btn-remove-task"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <input
                            className="field-row"
                            type="text"
                            placeholder="Ticket Title"
                            value={task.title}
                            onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                        />

                        <textarea
                            className="field-row"
                            placeholder="Description"
                            value={task.description}
                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        />

                        <select
                            value={task.assigneeId || ''}
                            onChange={(e) => handleFieldChange(index, 'assigneeId', e.target.value)}
                            className="field-row"
                        >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>

                        {task.customFields.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="field-row">
                                <label>{field.name}</label>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={field.value}
                                        onChange={(e) =>
                                            handleCustomFieldChange(index, fieldIndex, e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            handleCustomFieldChange(index, fieldIndex, e.target.value)
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                {/* ACTION BUTTONS */}
                {templateId && (
                    <div className="modal-actions">
                        {tasks.length < 10 && (
                            <button onClick={handleAddAnotherTask} className="btn-add-task">
                                + Add Another Task
                            </button>
                        )}
                        <button onClick={handleSave} className="btn-save">Save</button>
                        <button onClick={() => setShowPopup(false)} className="btn-cancel">Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateTicketModal;
