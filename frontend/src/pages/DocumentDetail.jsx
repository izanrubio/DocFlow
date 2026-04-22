import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function DocumentDetail() {
  const { id } = useParams();

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900">Documento #{id}</h1>
      <p className="mt-1 text-sm text-gray-500">Detalle del documento — Sprint 2.</p>
    </Layout>
  );
}
