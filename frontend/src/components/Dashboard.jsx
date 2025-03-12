function Dashboard() {
    const handleLogout = async () => {
        await fetch('http://localhost:8000/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '/login';
    };

    return (
        <div>
            <h1>Mikrotik task management system</h1>
            <h2>This is the Dashboard!</h2>
        </div>
    );
}

export default Dashboard;



