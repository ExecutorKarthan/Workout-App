import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function TrainerDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clients, setClients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState({ clientId: '', exercise: '', reps: 0, sets: 0, time: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/clients_exercises/', { headers: { Authorization: token } });
        setClients(res.data.clients);
        setExercises(res.data.exercises);
      } catch {
        alert('Session expired');
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchMeta();
  }, [navigate]);

  const handleSelectSlot = ({ start }) => setSelectedDate(start);

  const assignWorkout = async () => {
    const token = localStorage.getItem('token');
    await axios.post('/api/assign_workout/', {
      ...form,
      date: selectedDate.toISOString().slice(0, 10),
    }, { headers: { Authorization: token } });
    alert('Workout assigned');
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div>
      <h2>Trainer Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <Calendar
        localizer={localizer}
        selectable
        onSelectSlot={handleSelectSlot}
        defaultView="month"
        style={{ height: 400, marginBottom: 20 }}
      />
      <div>
        <select onChange={e => setForm({ ...form, exercise: e.target.value })}>
          <option value="">Select Exercise</option>
          {exercises.map(e => <option key={e._id} value={e.name}>{e.name}</option>)}
        </select>
        <select onChange={e => setForm({ ...form, clientId: e.target.value })}>
          <option value="">Select Client</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.username}</option>)}
        </select>
        <input type="number" placeholder="Reps" onChange={e => setForm({ ...form, reps: Number(e.target.value) })} />
        <input type="number" placeholder="Sets" onChange={e => setForm({ ...form, sets: Number(e.target.value) })} />
        <input type="number" placeholder="Time (mins)" onChange={e => setForm({ ...form, time: Number(e.target.value) })} />
        <button onClick={assignWorkout}>Assign Workout</button>
      </div>
    </div>
  );
}

export default TrainerDashboard;