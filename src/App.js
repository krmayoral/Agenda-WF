import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', degree: '', activities: '' });

  
  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    const storedTasks = localStorage.getItem('tasks');
    if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
    if (storedTasks) setTasks(JSON.parse(storedTasks));
  }, []);

  
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.position) {
      setEmployees([...employees, { ...newEmployee, id: Date.now() }]);
      setNewEmployee({ name: '', position: '', degree: '', activities: '' });
    }
  };

  const addTask = () => {
    if (newTask.title && newTask.assignedTo) {
      setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }]);
      setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Agenda WF</h1>
      </header>

      <div className="container">
        <div className="section">
          <h2>Agregar Nuevo Empleado</h2>
          <div className="form">
            <input
              type="text"
              placeholder="Nombre"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Puesto"
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
            />
            <input
              type="text"
              placeholder="Licenciatura"
              value={newEmployee.degree}
              onChange={(e) => setNewEmployee({...newEmployee, degree: e.target.value})}
            />
            <input
              type="text"
              placeholder="Actividades"
              value={newEmployee.activities}
              onChange={(e) => setNewEmployee({...newEmployee, activities: e.target.value})}
            />
            <button onClick={addEmployee}>Agregar Empleado</button>
          </div>
        </div>
        <div className="section">
          <h2>Empleados</h2>
          <div className="employee-list">
            {employees.map(employee => (
              <div key={employee.id} className="employee-card">
                <h3>{employee.name}</h3>
                <p><strong>Puesto:</strong> {employee.position}</p>
                <p><strong>Licenciatura:</strong> {employee.degree}</p>
                <p><strong>Actividades:</strong> {employee.activities}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="section">
          <h2>Agregar Nueva Tarea</h2>
          <div className="form">
            <input
              type="text"
              placeholder="Título de tarea"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
            >
              <option value="">Seleccionar empleado</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
            />
            <button onClick={addTask}>Agregar Tarea</button>
          </div>
        </div>
        <div className="section">
          <h2>Tareas</h2>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p><strong>Descripción:</strong> {task.description}</p>
                <p><strong>Asignada a:</strong> {task.assignedTo}</p>
                <p><strong>Fecha de vencimiento:</strong> {task.dueDate}</p>
                <p><strong>Estado:</strong> {task.completed ? 'Completada' : 'Pendiente'}</p>
                <button onClick={() => toggleTaskCompletion(task.id)}>
                  {task.completed ? 'Marcar como Pendiente' : 'Marcar como Completada'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;