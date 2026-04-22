import CodigoForm from './CodigoForm';

export default function NuevoCodigoPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
          NUEVO CÓDIGO PROMOCIONAL
        </h1>
        <p className="text-gray-400">
          Crea un nuevo código de descuento para los clientes
        </p>
      </div>

      <div className="max-w-2xl">
        <CodigoForm />
      </div>
    </div>
  );
}
