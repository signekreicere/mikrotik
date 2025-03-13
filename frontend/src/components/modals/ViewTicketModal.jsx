import { useEffect, useState } from 'react';

function ViewTicketModal({ ticketId, setShowPopup, refreshTickets }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('New');
    const [assigneeId, setAssigneeId] = useState('');
    const [customFields, setCustomFields] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await fetch(`http://localhost:8000/tickets/${ticketId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();

                    setTitle(data.ticket.title);
                    setDescription(data.ticket.description);
                    setStatus(data.ticket.status);
                    setAssigneeId(data.ticket.assignee_id ? String(data.ticket.assignee_id) : '');

                    if (data.ticket.custom_fields && typeof data.ticket.custom_fields === 'object') {
                        setCustomFields(
                            Object.entries(data.ticket.custom_fields).map(([name, value]) => ({
                                name,
                                value,
                                type: typeof value === 'string' ? 'text' : 'dropdown',
                                options: []
                            }))
                        );
                    } else {
                        setCustomFields([]);
                    }
                } else {
                    alert('Failed to fetch ticket details');
                }
            } catch {
                alert('Failed to load ticket');
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
                alert('Failed to load users');
            }
        };

        fetchTicket();
        fetchUsers();
    }, [ticketId]);

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:8000/update-ticket/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    description,
                    status,
                    assignee_id: assigneeId || null,
                    custom_fields: customFields.reduce((acc, field) => {
                        acc[field.name] = field.value;
                        return acc;
                    }, {})
                })
            });

            if (response.ok) {
                setShowPopup(false);
                refreshTickets();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch {
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
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting">Waiting</option>
                                <option value="Done">Done</option>
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
                                {users.map((user) => (
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
                                        {field.options.map((option) => (
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