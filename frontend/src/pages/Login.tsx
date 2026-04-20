import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const response = await apiClient.post<{ token: string }>('/auth/login', {
        username,
        password,
      });

      localStorage.setItem('auth_token', response.data.token);
      navigate('/');
    } catch (_error) {
      setErrorMessage('Credenciais inválidas');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '48px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>

        {errorMessage && <p style={{ color: '#b00020' }}>{errorMessage}</p>}

        <button type="submit" style={{ width: '100%', padding: 10 }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;
