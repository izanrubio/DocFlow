import { useParams } from 'react-router-dom';

export default function SignDocument() {
  const { token } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Firmar documento</h1>
        <p className="mt-1 text-sm text-gray-500">Token: {token}</p>
        <p className="mt-4 text-gray-500">Formulario de firma — Sprint 2.</p>
      </div>
    </div>
  );
}
