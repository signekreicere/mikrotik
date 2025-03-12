import { useState } from 'react';

function Login({ setIsAuthenticated }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setFeedbackMessage('Please enter email and password.');
            return;
        }

        setFeedbackMessage('');

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setIsAuthenticated(true);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 100);
                return;
            }

            setFeedbackMessage(data.message);
        } catch (error) {
            setFeedbackMessage('Failed to connect to server. Please try again.');
        }
    };

    return (
        <div className="app-main">
            <div className="container">
                <h1>Mikrotik TMS</h1>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn" type="submit">Login</button>
                </form>
                <div className="feedback" style={{ visibility: feedbackMessage ? 'visible' : 'hidden' }}>
                    {feedbackMessage}
                </div>
            </div>
        </div>
    );
}

export default Login;
