import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_NESSIE_API_KEY;
const BASE_URL = 'https://api.nessieisreal.com';

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de nuevo cliente
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // NUEVO: Estado para el dinero/saldo
  const [balance, setBalance] = useState('5000');

  // Función para obtener los clientes de la API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/customers?key=${API_KEY}`);
      if (!response.ok) throw new Error('Error al conectar con Nessie API');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Función para enviar los datos a Nessie (Cliente + Cuenta con Saldo)
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      // PASO 1: Crear el Cliente
      const responseCustomer = await fetch(`${BASE_URL}/customers?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          address: {
            street_number: streetNumber,
            street_name: streetName,
            city: city,
            state: state,
            zip: zip
          }
        })
      });

      if (!responseCustomer.ok) throw new Error('No se pudo crear el cliente');
      const customerData = await responseCustomer.json();
      
      // Capturamos el ID generado por Capital One
      const newCustomerId = customerData.objectCreated._id;

      // PASO 2: Asignar la Cuenta Bancaria con el Saldo elegido
      const responseAccount = await fetch(`${BASE_URL}/customers/${newCustomerId}/accounts?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Checking',
          nickname: 'Cuenta Principal',
          rewards: 0,
          balance: Number(balance)
        })
      });

      if (!responseAccount.ok) throw new Error('Cliente creado, pero falló la asignación de dinero.');

      // Alerta con el ID para copiarlo fácilmente
      alert(`¡Éxito!\nCliente: ${firstName} ${lastName}\nSaldo asignado: $${balance}\nID de Nessie: ${newCustomerId}`);

      // Limpiar el formulario
      setFirstName('');
      setLastName('');
      setStreetNumber('');
      setStreetName('');
      setCity('');
      setState('');
      setZip('');
      setBalance('5000');

      // Recargar la lista automáticamente
      fetchCustomers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Dashboard - Capital One Nessie API</h1>

      {/* Formulario para agregar nuevo cliente */}
      <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', background: '#fdfdfd' }}>
        <h2>Crear Nuevo Cliente + Asignar Saldo</h2>
        <form onSubmit={handleCreateCustomer} style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: '1fr 1fr' }}>
          <input 
            type="text" 
            placeholder="Nombre" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Apellido" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Número de Calle (ej. 123)" 
            value={streetNumber} 
            onChange={(e) => setStreetNumber(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Nombre de Calle (ej. Main St)" 
            value={streetName} 
            onChange={(e) => setStreetName(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Ciudad" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Estado (ej. VA)" 
            value={state} 
            onChange={(e) => setState(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Código Postal (ZIP)" 
            value={zip} 
            onChange={(e) => setZip(e.target.value)} 
            required 
          />

          {/* Campo para meter la cantidad de dinero exacta */}
          <input 
            type="number" 
            placeholder="Saldo Inicial ($)" 
            value={balance} 
            onChange={(e) => setBalance(e.target.value)} 
            required 
            style={{ border: '2px solid #0070f3', fontWeight: 'bold' }}
          />

          <button type="submit" style={{ gridColumn: 'span 2', padding: '0.8rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Registrar Cliente y Asignar Saldo
          </button>
        </form>
      </div>

      {/* Visualización de la lista */}
      {loading && <p>Cargando datos del banco...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <div>
          <h2>Lista de Clientes ({customers.length})</h2>
          {customers.length === 0 ? (
            <p>No hay clientes creados. Utiliza el formulario superior para añadir el primero.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {customers.map((customer) => (
                <div 
                  key={customer._id} 
                  style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{customer.first_name} {customer.last_name}</h3>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#555' }}>
                    <strong>ID:</strong> {customer._id}
                  </p>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#555' }}>
                    <strong>Dirección:</strong> {customer.address.street_number} {customer.address.street_name}, {customer.address.city}, {customer.address.state}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;