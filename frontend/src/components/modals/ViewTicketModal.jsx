import { useEffect, useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useTickets } from '../hooks/useTickets';
import { useStatuses } from '../hooks/useStatuses';

function ViewTicketModal({ ticketId, setShowPopup, refreshTickets }) {
    const { users, fetchUsers } = useUsers();
    const { ticket, fetchTicketById } = useTickets();
    const { statuses, fetchStatuses } = useStatuses();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [customFields, setCustomFields] = useState([]);

    useEffect(() => {
        fetchTicketById(ticketId);
        fetchUsers();
        fetchStatuses();
    }, [ticketId]);

    useEffect(() => {
        if (ticket) {
            setTitle(ticket.title || '');
            setDescription(ticket.description || '');
            setStatus(ticket.status || '');
            setAssigneeId(ticket.assignee_id ? String(ticket.assignee_id) : '');

            if (ticket.custom_fields && typeof ticket.custom_fields === 'object') {
                setCustomFields(
                    Object.entries(ticket.custom_fields).map(([name, value]) => ({
                        name,
                        value,
                        type: typeof value === 'string' ? 'text' : 'dropdown',
                        options: []
                    }))
                );
            } else {
                setCustomFields([]);
            }
        }
    }, [ticket]);

    if (!ticket) return null;

    const handleSave = async () => {
        const validateFields = () => {
            const errors = [];

            if (!title?.trim()) errors.push('Title is required');
            if (!description?.trim()) errors.push('Description is required');
            if (!status) errors.push('Status is required');

            const selectedStatusId = statuses.find(
                s => s.name.toLowerCase().trim() === status.toLowerCase().trim()
            )?.id || null;

            if (!selectedStatusId) errors.push('Invalid status');

            for (const field of customFields) {
                if (!field.value?.trim()) {
                    errors.push(`Custom field "${field.name}" cannot be empty`);
                }
            }

            return errors.length > 0 ? errors.join('\n') : null;
        };

        const error = validateFields();
        if (error) {
            alert(error);
            return;
        }

        const selectedStatusId = statuses.find(
            s => s.name === status
        )?.id || null;


        try {
            const response = await fetch(`http://localhost:8000/update-ticket/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    status_id: selectedStatusId,
                    assignee_id: assigneeId || null,
                    custom_fields: customFields.reduce((acc, field) => {
                        acc[field.name] = field.value;
                        return acc;
                    }, {})
                })
            });

            if (response.ok) {
                await refreshTickets();
                setShowPopup(false);
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to update ticket');
        }
    };

    const handleCustomFieldChange = (index, value) => {
        const updatedFields = [...customFields];
        updatedFields[index].value = value;
        setCustomFields(updatedFields);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Ticket</h2>
                <table className="ticket-details">
                    <tbody>
                    <tr>
                        <td><strong>Title:</strong></td>
                        <td>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Description:</strong></td>
                        <td>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                {statuses.map(status => (
                                    <option key={status.id} value={status.name}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Assignee:</strong></td>
                        <td>
                            <select
                                value={assigneeId || ''}
                                onChange={(e) => setAssigneeId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.email}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    {customFields.map((field, index) => (
                        <tr key={index}>
                            <td><strong>{field.name}:</strong></td>
                            <td>
                                {field.type === 'dropdown' ? (
                                    <select
                                        value={field.value}
                                        onChange={(e) =>
                                            handleCustomFieldChange(index, e.target.value)
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
                                        value={field.value || ''}
                                        onChange={(e) =>
                                            handleCustomFieldChange(index, e.target.value)
                                        }
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="modal-actions">
                    <button onClick={handleSave} className="btn-save">Save</button>
                    <button onClick={() => setShowPopup(false)} className="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ViewTicketModal;