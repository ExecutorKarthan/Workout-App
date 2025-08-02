import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ClientDashboard() {
  const [workouts, setWorkouts] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWorkouts = async () => {
      const res = await axios.post('/api/get_workouts/', { token });
      setWorkouts(res.data.workouts);
    };
    fetchWorkouts();
  }, [token]);

  const updateProgress = async (id, progress) => {
    await axios.post('/api/update_workout_progress/', {
      workoutId: id,
      progress,
    });
  };

  return (
    <div>
      <h2>Your Workouts</h2>
      {workouts.map(w => (
        <div key={w._id}>
          <p>{w.date}: {w.exercise}</p>
          <input type="number" placeholder="Reps" onBlur={e => updateProgress(w._id, { ...w.progress, reps: e.target.value })} />
          <input type="number" placeholder="Sets" onBlur={e => updateProgress(w._id, { ...w.progress, sets: e.target.value })} />
          <input type="number" placeholder="Time (min)" onBlur={e => updateProgress(w._id, { ...w.progress, time: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

export default ClientDashboard;