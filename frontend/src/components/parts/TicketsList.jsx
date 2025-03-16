import React from 'react';

function TicketsList({ tickets, userRole, handleArchiveTicket, setViewTicketId, refreshTickets }) {
    return (
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Creator</th>
                <th>Template</th>
                <th>Created At</th>
                {userRole === 'admin' && <th></th>}
            </tr>
            </thead>
            <tbody>
            {tickets.map((ticket) => (
                <tr
                    key={ticket.id}
                    onClick={(e) => {
                        if (!e.target.closest('.delete-icon')) {
                            setViewTicketId(ticket.id);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <td>{ticket.id}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.assignee_email || 'Unassigned'}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.creator_email || 'Unknown'}</td>
                    <td>{ticket.template_name || 'N/A'}</td>
                    <td>{new Date(ticket.created_at).toLocaleString()}</td>
                    {userRole === 'admin' && (
                        <td>
                            <button
                                className="delete-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveTicket(ticket.id);
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
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
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

export default TicketsList;