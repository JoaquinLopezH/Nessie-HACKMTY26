import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_NESSIE_API_KEY;
const BASE_URL = 'https://api.nessieisreal.com';

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del cliente
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [balance, setBalance] = useState('5000');

  // Nuevos Estados: 3 Suscripciones (Nombre y Monto)
  const [sub1Name, setSub1Name] = useState('Netflix');
  const [sub1Amount, setSub1Amount] = useState('199');

  const [sub2Name, setSub2Name] = useState('Spotify');
  const [sub2Amount, setSub2Amount] = useState('129');

  const [sub3Name, setSub3Name] = useState('Gimnasio');
  const [sub3Amount, setSub3Amount] = useState('500');

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

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      // PASO 1: Crear el Cliente
      const resCustomer = await fetch(`${BASE_URL}/customers?key=${API_KEY}`, {
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

      if (!resCustomer.ok) throw new Error('No se pudo crear el cliente');
      const customerData = await resCustomer.json();
      const newCustomerId = customerData.objectCreated._id;

      // PASO 2: Crear la Cuenta Bancaria
      const resAccount = await fetch(`${BASE_URL}/customers/${newCustomerId}/accounts?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Checking',
          nickname: 'Cuenta Principal',
          rewards: 0,
          balance: Number(balance)
        })
      });

      if (!resAccount.ok) throw new Error('Falló la asignación de dinero.');
      const accountData = await resAccount.json();
      const newAccountId = accountData.objectCreated._id;

      // PASO 3: Crear las 3 Suscripciones (Bills) ligadas a la Cuenta
      const subscriptions = [
        { name: sub1Name, amount: sub1Amount, day: 1 },
        { name: sub2Name, amount: sub2Amount, day: 5 },
        { name: sub3Name, amount: sub3Amount, day: 15 }
      ];

      for (const sub of subscriptions) {
        if (sub.name && sub.amount) {
          await fetch(`${BASE_URL}/accounts/${newAccountId}/bills?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'pending',
              payee: sub.name,
              nickname: sub.name,
              payment_date: '2026-09-15',
              recurring_date: Number(sub.day),
              payment_amount: Number(sub.amount)
            })
          });
        }
      }

      alert(`¡Éxito!\nCliente y 3 suscripciones creadas correctamente.\nID Nessie: ${newCustomerId}`);

      // Limpiar Formulario
      setFirstName(''); setLastName(''); setStreetNumber('');
      setStreetName(''); setCity(''); setState(''); setZip('');
      setBalance('5000');
      fetchCustomers();

    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Dashboard - Capital One Nessie API</h1>

      <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', background: '#fdfdfd' }}>
        <h2>Crear Cliente + Saldo + 3 Suscripciones</h2>
        <form onSubmit={handleCreateCustomer} style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: '1fr 1fr' }}>
          <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <input type="text" placeholder="Número de Calle" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} required />
          <input type="text" placeholder="Nombre de Calle" value={streetName} onChange={(e) => setStreetName(e.target.value)} required />
          <input type="text" placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} required />
          <input type="text" placeholder="Estado" value={state} onChange={(e) => setState(e.target.value)} required />
          <input type="text" placeholder="Código Postal" value={zip} onChange={(e) => setZip(e.target.value)} required />
          
          <input 
            type="number" 
            placeholder="Saldo Inicial ($)" 
            value={balance} 
            onChange={(e) => setBalance(e.target.value)} 
            required 
            style={{ border: '2px solid #0070f3', fontWeight: 'bold' }}
          />

          <div style={{ gridColumn: 'span 2', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <h3>Suscripciones Recurrentes</h3>
            
            {/* Suscripción 1 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Suscripción 1 (ej. Netflix)" value={sub1Name} onChange={(e) => setSub1Name(e.target.value)} required style={{ flex: 2 }} />
              <input type="number" placeholder="Costo ($)" value={sub1Amount} onChange={(e) => setSub1Amount(e.target.value)} required style={{ flex: 1 }} />
            </div>

            {/* Suscripción 2 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Suscripción 2 (ej. Spotify)" value={sub2Name} onChange={(e) => setSub2Name(e.target.value)} required style={{ flex: 2 }} />
              <input type="number" placeholder="Costo ($)" value={sub2Amount} onChange={(e) => setSub2Amount(e.target.value)} required style={{ flex: 1 }} />
            </div>

            {/* Suscripción 3 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Suscripción 3 (ej. Gimnasio)" value={sub3Name} onChange={(e) => setSub3Name(e.target.value)} required style={{ flex: 2 }} />
              <input type="number" placeholder="Costo ($)" value={sub3Amount} onChange={(e) => setSub3Amount(e.target.value)} required style={{ flex: 1 }} />
            </div>
          </div>

          <button type="submit" style={{ gridColumn: 'span 2', padding: '0.8rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Registrar Cliente, Saldo y Suscripciones
          </button>
        </form>
      </div>

      {loading && <p>Cargando datos del banco...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <div>
          <h2>Lista de Clientes ({customers.length})</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {customers.map((customer) => (
              <div key={customer._id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', background: '#ffffff' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{customer.first_name} {customer.last_name}</h3>
                <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#555' }}>
                  <strong>ID:</strong> {customer._id}
                </p>
                <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#555' }}>
                  <strong>Dirección:</strong> {customer.address.street_number} {customer.address.street_name}, {customer.address.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;