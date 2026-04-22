import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Bienvenido, {user?.name}</p>
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">Sprint 2: aquí aparecerán tus documentos.</p>
      </div>
    </Layout>
  );
}
