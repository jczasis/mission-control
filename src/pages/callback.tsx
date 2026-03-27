import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      localStorage.setItem('oauth_error', error);
      navigate('/');
      return;
    }

    if (code) {
      // Guardar el code y redirigir
      localStorage.setItem('google_auth_code', code);
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Procesando autenticación...</p>
    </div>
  );
}
