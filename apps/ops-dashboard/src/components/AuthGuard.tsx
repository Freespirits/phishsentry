import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: ReactNode;
}

function AuthGuard({ children }: Props) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoading, user, navigate, location.pathname]);

  if (isLoading) {
    return <div className="p-8 text-slate-500">Checking authentication…</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
