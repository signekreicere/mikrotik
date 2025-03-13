import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTicketModal from './modals/CreateTicketModal';
import ViewTicketModal from './modals/ViewTicketModal';

function Dashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [viewTicketId, setViewTicketId] = useState(null);

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:8000/tickets', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Mikrotik TMS</h1>
                <button className="btn btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-header">
                <h2>All Tasks</h2>
                <div className="button-group">
                    <button className="btn btn-task" onClick={() => setShowPopup(true)} >Create Ticket</button>
                    <button className="btn btn-template" onClick={() => navigate('/templates')}>Templates</button>
                </div>
            </div>

            {showPopup && (
                <CreateTicketModal
                    setShowPopup={setShowPopup}
                    refreshTickets={fetchTickets}
                />
            )}

            {viewTicketId && (
                <ViewTicketModal
                    ticketId={viewTicketId}
                    setShowPopup={() => setViewTicketId(null)}
                    refreshTickets={fetchTickets}
                />
            )}

            <div className="t-list">
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Assignee</th>
                        <th>Status</th>
                        <th>Creator</th>
                        <th>Created At</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}
                            onClick={() => setViewTicketId(ticket.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{ticket.id}</td>
                            <td>{ticket.title}</td>
                            <td>{ticket.assignee_email || 'Unassigned'}</td>
                            <td>{ticket.status}</td>
                            <td>{ticket.creator_email || 'Unknown'}</td>
                            <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
