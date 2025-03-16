import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTemplates } from './hooks/useTemplates';
import { useUsers } from './hooks/useUsers';
import { useStatuses } from './hooks/useStatuses';
import { useTickets } from './hooks/useTickets';
import CreateTicketModal from './modals/CreateTicketModal';
import ViewTicketModal from './modals/ViewTicketModal';
import FilterBar from './parts/FilterBar';
import TicketsList from './parts/TicketsList';

function Dashboard() {
    const navigate = useNavigate();
    const { userRole, logout } = useAuth();
    const { templates, fetchTemplates } = useTemplates();
    const { users, fetchUsers } = useUsers();
    const { statuses, fetchStatuses } = useStatuses();
    const { tickets, fetchTickets } = useTickets();

    const [showPopup, setShowPopup] = useState(false);
    const [viewTicketId, setViewTicketId] = useState(null);

    const [filters, setFilters] = useState({
        orderBy: 'id_desc',
        assignee: '',
        status: '',
        creator: '',
        ticketStatus: 'active'
    });

    const handleArchiveTicket = async (id) => {
        if (confirm('Are you sure you want to archive this ticket?')) {
            try {
                const response = await fetch(`http://localhost:8000/archive-ticket/${id}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    await fetchTickets(filters);
                }
            } catch (error) {
                console.error('Failed to archive ticket:', error);
            }
        }
    };

    useEffect(() => {
        Promise.all([
            fetchTickets(filters),
            fetchUsers(),
            fetchStatuses(),
            fetchTemplates(),
        ]).catch(err => console.error('Failed to fetch data:', err));
    }, [filters]);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Mikrotik TMS</h1>
                <button className="btn btn-logout" onClick={logout}>
                    Logout
                </button>
            </div>

            <div className="dashboard-header">
                <h2>All Tasks</h2>
                <div className="button-group">
                    <button className="btn btn-task" onClick={() => setShowPopup(true)}>Create Ticket</button>
                    <button className="btn btn-template" onClick={() => navigate('/templates')}>Templates</button>
                </div>
            </div>

            {showPopup && (
                <CreateTicketModal
                    setShowPopup={setShowPopup}
                    refreshTickets={() => fetchTickets(filters)}
                />
            )}

            {viewTicketId && (
                <ViewTicketModal
                    ticketId={viewTicketId}
                    setShowPopup={() => setViewTicketId(null)}
                    refreshTickets={() => fetchTickets(filters)}
                />
            )}

            <div className="t-list">

                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    statuses={statuses}
                    users={users}
                    templates={templates}
                />

                <TicketsList
                    tickets={tickets}
                    userRole={userRole}
                    handleArchiveTicket={handleArchiveTicket}
                    setViewTicketId={setViewTicketId}
                    refreshTickets={() => fetchTickets(filters)}
                />

            </div>
        </div>
    );
}

export default Dashboard;