import { useState, useEffect } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { useUsers } from '../hooks/useUsers';

function CreateTicketModal({ setShowPopup, refreshTickets }) {
    const [templateId, setTemplateId] = useState('');
    const { templates, fetchTemplates } = useTemplates();
    const { users, fetchUsers } = useUsers();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
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
        const validateFields = () => {
            const errors = [];

            for (const task of tasks) {
                if (!task.title?.trim()) {
                    errors.push('Each task must have a title');
                }
                if (!task.description?.trim()) {
                    errors.push('Each task must have a description');
                }
                if (!templateId) {
                    errors.push('A template must be selected');
                }

                for (const field of task.customFields) {
                    if (!field.value?.trim()) {
                        errors.push(`Custom field "${field.name}" cannot be empty`);
                    }
                }
            }

            return errors.length > 0 ? errors.join('\n') : null;
        };

        const error = validateFields();
        if (error) {
            alert(error);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/create-tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(
                    tasks.map(task => ({
                        title: task.title.trim(),
                        description: task.description.trim(),
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
                await refreshTickets();
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

                {templateId && <div className="separator" />}

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
