import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_NESSIE_API_KEY;
const BASE_URL = 'https://api.nessieisreal.com';

export default function App() {
  // Configuración de Estados
  const [role, setRole] = useState('elder'); // 'elder' | 'copilot'
  const [isSubordinated, setIsSubordinated] = useState(true); // Vinculación Copiloto - Papá
  const [showCopilotMenu, setShowCopilotMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Datos de Nessie
  const [customer, setCustomer] = useState(null);
  const [checkingAccount, setCheckingAccount] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funcionalidades
  const [virtualCards, setVirtualCards] = useState([
    { id: 'vcard-1', name: 'Tarjeta Cuidadora (Luz)', limit: 50, active: true }
  ]);
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 'app-1', merchant: 'Joyería Ficticia Online', amount: 250, date: 'Hoy' }
  ]);
  const [enoMessages, setEnoMessages] = useState([
    { sender: 'eno', text: '¡Hola! Soy ENO. La cuenta de Don Roberto está protegida por su Copiloto (Hijo).' }
  ]);
  const [enoInput, setEnoInput] = useState('');

  // Carga Inicial con Nessie API
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        let res = await fetch(`${BASE_URL}/customers?key=${API_KEY}`);
        let customers = await res.json();
        let currentCustomer = customers[0];

        if (!currentCustomer) {
          const newCustRes = await fetch(`${BASE_URL}/customers?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              first_name: 'Roberto',
              last_name: 'García',
              address: { street_number: '50', street_name: 'Av. Reforma', city: 'CDMX', state: 'DF', zip: '01000' }
            })
          });
          currentCustomer = await newCustRes.json();
        }
        setCustomer(currentCustomer);

        let accRes = await fetch(`${BASE_URL}/customers/${currentCustomer._id}/accounts?key=${API_KEY}`);
        let accounts = await accRes.json();
        let currentAccount = accounts[0];

        if (!currentAccount) {
          const newAccRes = await fetch(`${BASE_URL}/customers/${currentCustomer._id}/accounts?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'Checking',
              nickname: '360 Checking',
              rewards: 60.80,
              balance: 2134.78
            })
          });
          currentAccount = await newAccRes.json();
        }
        setCheckingAccount(currentAccount);

        // Cargar suscripciones
        let billsRes = await fetch(`${BASE_URL}/accounts/${currentAccount._id}/bills?key=${API_KEY}`);
        let billsData = await billsRes.json();
        if (Array.isArray(billsData) && billsData.length === 0) {
          await fetch(`${BASE_URL}/accounts/${currentAccount._id}/bills?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'pending',
              payee: 'Stream TV Premium',
              nickname: 'Suscripción No Reconocida',
              payment_date: '2026-10-01',
              recurring_date: 1,
              payment_amount: 29.99
            })
          });
          billsRes = await fetch(`${BASE_URL}/accounts/${currentAccount._id}/bills?key=${API_KEY}`);
          billsData = await billsRes.json();
        }
        setBills(Array.isArray(billsData) ? billsData : []);

      } catch (err) {
        console.error('Error al conectar con Nessie:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Cancelar Suscripción con Nessie
  const handleCancelBill = async (billId) => {
    try {
      await fetch(`${BASE_URL}/bills/${billId}?key=${API_KEY}`, { method: 'DELETE' });
      setBills(bills.filter(b => b._id !== billId));
      alert('Suscripción cancelada con éxito mediante Nessie API.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Autorizar cargo sospechoso
  const handleApproveTransaction = (id) => {
    setPendingApprovals(pendingApprovals.filter(a => a.id !== id));
    alert('Transacción autorizada por el Copiloto.');
  };

  // Crear Tarjeta Virtual
  const handleCreateVirtualCard = () => {
    const name = prompt('Nombre de la tarjeta virtual (ej. Cuidadora Martha):');
    const limit = prompt('Límite máximo ($):');
    if (name && limit) {
      setVirtualCards([...virtualCards, { id: `vcard-${Date.now()}`, name, limit: Number(limit), active: true }]);
    }
  };

  // Chat ENO AI
  const handleSendEnoMessage = (e) => {
    e.preventDefault();
    if (!enoInput.trim()) return;
    const userText = enoInput;
    setEnoMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setEnoInput('');
    setTimeout(() => {
      let reply = 'Estoy monitoreando la cuenta. Todas las transacciones mayores a $100 requieren aprobación del Copiloto.';
      if (userText.toLowerCase().includes('suscripcion') || userText.toLowerCase().includes('leak')) {
        reply = 'Se detectó 1 cobro recurrente no reconocido de $29.99. Puedes cancelarlo en el menú de Copiloto.';
      }
      setEnoMessages(prev => [...prev, { sender: 'eno', text: reply }]);
    }, 800);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b132b', color: 'white', fontFamily: 'sans-serif' }}>Cargando Capital One App...</div>;

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
      
      {/* MARCO DE SMARTPHONE (MOCKUP CAPITAL ONE) */}
      <div style={{
        width: '100%',
        maxWidth: '412px',
        height: '870px',
        background: '#ffffff',
        borderRadius: '45px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '12px solid #101828',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>

        {/* STATUS BAR SUPERIOR */}
        <div style={{ padding: '12px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>📶</span><span>📶</span><span>🔋</span>
          </div>
        </div>

        {/* HEADER CON LOGO CAPITAL ONE */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0 15px', borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/98/Capital_One_logo.svg" 
            alt="Capital One" 
            style={{ height: '28px' }} 
          />
          <button 
            onClick={() => setRole(role === 'elder' ? 'copilot' : 'elder')}
            style={{ position: 'absolute', right: '15px', fontSize: '11px', background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
          >
            {role === 'elder' ? '👴 Papá' : '👨‍✈️ Copiloto'}
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE DE LA APP */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* BANNER DE PROTECCIÓN COPILOTO */}
          {isSubordinated && (
            <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0369a1' }}>
              <span>🛡️ <strong>Modo Copiloto Activo:</strong> Vinculado con {role === 'elder' ? 'Hijo (Copiloto)' : 'Don Roberto (Padre)'}</span>
            </div>
          )}

          {/* TARJETA 1: QUICKSILVER */}
          <div style={{
            background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
            borderRadius: '16px',
            padding: '18px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', letterSpacing: '1px', opacity: 0.9, fontWeight: '600' }}>QUICKSILVER...0501</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold' }}>$524.63</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Current balance</div>
              </div>
            </div>
            <button 
              onClick={handleCreateVirtualCard}
              style={{ marginTop: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.7)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              Get your virtual card
            </button>
          </div>

          {/* TARJETA 2: 360 CHECKING (DESDE NESSIE API) */}
          <div style={{
            background: 'linear-gradient(135deg, #0f4c81 0%, #072ac8 100%)',
            borderRadius: '16px',
            padding: '18px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', letterSpacing: '0.5px', opacity: 0.9, fontWeight: '600' }}>
                {checkingAccount?.nickname || '360 Checking'}...0622
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                  ${checkingAccount?.balance ? checkingAccount.balance.toLocaleString() : '2,134.78'}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Available balance</div>
              </div>
            </div>
            <button style={{ marginTop: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.7)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              View your debit card
            </button>
          </div>

          {/* BOTÓN OPEN NEW ACCOUNT */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            color: '#1e293b',
            background: '#ffffff',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <span style={{ fontSize: '18px', color: '#0f4c81' }}>⊕</span> Open a new account
          </div>

          {/* REWARDS & BENEFITS */}
          <div style={{ background: '#086788', borderRadius: '16px', padding: '16px', color: 'white' }}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Explore rewards and benefits</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0 12px' }}>$60.80</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', fontSize: '11px', textAlign: 'center' }}>
              <div>✈️<br/>Travel</div>
              <div>🍴<br/>Dining</div>
              <div>🎟️<br/>Entertainment</div>
            </div>
          </div>

          {/* CREDITWISE SCORE */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#0f4c81', fontSize: '15px' }}>creditwise</span>
              <span>∧</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Your credit score:</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>780</span>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Very Good</span>
            </div>
            <div style={{ height: '6px', background: '#16a34a', borderRadius: '3px', marginTop: '10px' }}></div>
          </div>

        </div>

        {/* NAVEGACIÓN INFERIOR NATIVA */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          padding: '10px 20px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          background: '#ffffff',
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <div style={{ color: '#0f4c81', fontWeight: 'bold' }}>🏠<br/>Home</div>
          <div>✨<br/>Benefits</div>
          <div>💬<br/>Help</div>
          <div>👤<br/>Profile</div>
        </div>

        {/* 🚀 BOTÓN FLOTANTE INFERIOR DERECHA: CO-PILOT SHIELD & ENO */}
        <button
          onClick={() => setShowCopilotMenu(!showCopilotMenu)}
          style={{
            position: 'absolute',
            bottom: '75px',
            right: '20px',
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d03027 0%, #00205b 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 99
          }}
        >
          <span style={{ fontSize: '22px' }}>🛡️</span>
          <span style={{ fontSize: '9px', fontWeight: 'bold' }}>COPILOT</span>
        </button>

        {/* 🎛️ PANEL MODAL SUPERPUESTO DEL COPILOTO */}
        {showCopilotMenu && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            zIndex: 100,
            padding: '20px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>🛡️ Co-Pilot Control Center</h2>
              <button onClick={() => setShowCopilotMenu(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* VINCULACIÓN / SUBORDINACIÓN */}
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Subordinación de Cuenta Padre - Hijo:</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={isSubordinated} 
                  onChange={(e) => setIsSubordinated(e.target.checked)} 
                />
                Activar tutela financiera y autorizaciones
              </label>
            </div>

            {/* ALERTAS PENDIENTES */}
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#fcd34d', fontSize: '13px' }}>🚨 Compras Sospechosas (&gt;$100)</h4>
              {pendingApprovals.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#4ade80' }}>Sin alertas pendientes.</div>
              ) : (
                pendingApprovals.map(app => (
                  <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', fontSize: '12px' }}>
                    <div>
                      <div><strong>{app.merchant}</strong></div>
                      <div>${app.amount} MXN</div>
                    </div>
                    <button onClick={() => handleApproveTransaction(app.id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Aprobar</button>
                  </div>
                ))
              )}
            </div>

            {/* SUBSCRIPTION LEAKS (NESSIE API) */}
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#f87171', fontSize: '13px' }}>💧 Fuga de Suscripciones (Nessie API)</h4>
              {bills.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>No hay suscripciones no reconocidas.</div>
              ) : (
                bills.map(b => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', fontSize: '12px', marginBottom: '6px' }}>
                    <div>
                      <div><strong>{b.payee}</strong></div>
                      <div style={{ color: '#ef4444' }}>${b.payment_amount}/mes</div>
                    </div>
                    <button onClick={() => handleCancelBill(b._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                ))
              )}
            </div>

            {/* CHAT ENO AI */}
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px' }}>🤖 Asistente ENO AI</h4>
              <div style={{ flex: 1, maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {enoMessages.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? '#0284c7' : 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '8px', fontSize: '11px' }}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendEnoMessage} style={{ display: 'flex', gap: '4px' }}>
                <input 
                  type="text" 
                  placeholder="Pregunta a ENO..." 
                  value={enoInput} 
                  onChange={(e) => setEnoInput(e.target.value)} 
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', fontSize: '11px' }}
                />
                <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px' }}>OK</button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}