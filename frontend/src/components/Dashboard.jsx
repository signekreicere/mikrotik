import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
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
                    <button className="btn btn-task">Create Ticket</button>
                    <button className="btn btn-template" onClick={() => navigate('/templates')}>Templates</button>
                </div>
            </div>

            <div className="t-list">
            </div>
        </div>
    );
}

export default Dashboard;
