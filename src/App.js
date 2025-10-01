import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', startDate: '', dueDate: '', status: 'Pendiente' });
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', degree: '', activities: '' });

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ type: '', id: null });

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

  const startEditEmployee = (employee) => {
    setEditingEmployee(employee);
  };

  const saveEditEmployee = () => {
    setEmployees(employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
    setEditingEmployee(null);
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    setConfirmDelete({ type: '', id: null });
  };

  const addTask = () => {
    if (newTask.title && newTask.assignedTo) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ title: '', description: '', assignedTo: '', startDate: '', dueDate: '', status: 'Pendiente' });
    }
  };

  const toggleTaskStatus = (task) => {
    const statusOrder = ['Pendiente', 'En proceso', 'Completada'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
  };

  const startEditTask = (task) => {
    setEditingTask(task);
  };

  const saveEditTask = () => {
    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setConfirmDelete({ type: '', id: null });
  };

  const getTaskColor = (status) => {
    switch(status) {
      case 'Pendiente': return '#7f8c8d';
      case 'En proceso': return '#f1c40f';
      case 'Completada': return '#27ae60';
      default: return '#2ecc71';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AGENDA WF</h1>
      </header>

      <div className="container">

        
        <div className="section">
          <h2>Agregar Nuevo Empleado</h2>
          <div className="form">
            <input type="text" placeholder="Nombre" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} />
            <input type="text" placeholder="Puesto" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} />
            <input type="text" placeholder="Licenciatura" value={newEmployee.degree} onChange={(e) => setNewEmployee({...newEmployee, degree: e.target.value})} />
            <input type="text" placeholder="Actividades" value={newEmployee.activities} onChange={(e) => setNewEmployee({...newEmployee, activities: e.target.value})} />
            <button onClick={addEmployee}>Agregar Empleado</button>
          </div>
        </div>

        
        <div className="section">
          <h2>Empleados</h2>
          <div className="employee-list">
            {employees.map(employee => (
              <div key={employee.id} className="employee-card">
                {editingEmployee?.id === employee.id ? (
                  <div className="edit-form">
                    <input value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} placeholder="Nombre" />
                    <input value={editingEmployee.position} onChange={e => setEditingEmployee({...editingEmployee, position: e.target.value})} placeholder="Puesto" />
                    <input value={editingEmployee.degree} onChange={e => setEditingEmployee({...editingEmployee, degree: e.target.value})} placeholder="Licenciatura" />
                    <input value={editingEmployee.activities} onChange={e => setEditingEmployee({...editingEmployee, activities: e.target.value})} placeholder="Actividades" />
                    <div className="card-buttons">
                      <button className="edit-btn" onClick={saveEditEmployee}>Guardar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{employee.name}</h3>
                    <p><strong>Puesto:</strong> {employee.position}</p>
                    <p><strong>Licenciatura:</strong> {employee.degree}</p>
                    <p><strong>Actividades:</strong> {employee.activities}</p>
                    <div className="card-buttons">
                      <button className="edit-btn" onClick={() => startEditEmployee(employee)}>Editar</button>
                      <button className="delete-btn" onClick={() => setConfirmDelete({type:'employee', id: employee.id})}>Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      
        <div className="section">
          <h2>Agregar Nueva Tarea</h2>
          <div className="form">
            <input type="text" placeholder="Título de tarea" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            <input type="text" placeholder="Descripción" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
              <option value="">Seleccionar empleado</option>
              {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
            </select>
            <label>Fecha de inicio</label>
            <input type="date" value={newTask.startDate} onChange={e => setNewTask({...newTask, startDate: e.target.value})} />
            <label>Fecha de vencimiento</label>
            <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
            <button onClick={addTask}>Agregar Tarea</button>
          </div>
        </div>

        
        <div className="section">
          <h2>Tareas</h2>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card" style={{backgroundColor: getTaskColor(task.status)}}>
                {editingTask?.id === task.id ? (
                  <div className="edit-form">
                    <input value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} placeholder="Título" />
                    <input value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} placeholder="Descripción" />
                    <select value={editingTask.assignedTo} onChange={e => setEditingTask({...editingTask, assignedTo: e.target.value})}>
                      <option value="">Seleccionar empleado</option>
                      {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                    </select>
                    <label>Fecha de inicio</label>
                    <input type="date" value={editingTask.startDate} onChange={e => setEditingTask({...editingTask, startDate: e.target.value})} />
                    <label>Fecha de vencimiento</label>
                    <input type="date" value={editingTask.dueDate} onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} />
                    <div className="card-buttons">
                      <button className="edit-btn" onClick={saveEditTask}>Guardar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{task.title}</h3>
                    <p><strong>Descripción:</strong> {task.description}</p>
                    <p><strong>Asignada a:</strong> {task.assignedTo}</p>
                    <p><strong>Fecha de inicio:</strong> {task.startDate}</p>
                    <p><strong>Fecha de vencimiento:</strong> {task.dueDate}</p>
                    <p><strong>Estado:</strong> {task.status}</p>
                    <div className="card-buttons">
                      <button className="status-btn" onClick={() => toggleTaskStatus(task)}>Cambiar Estado</button>
                      <button className="edit-btn" onClick={() => startEditTask(task)}>Editar</button>
                      <button className="delete-btn" onClick={() => setConfirmDelete({type:'task', id: task.id})}>Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    
      {confirmDelete.id && (
        <div className="confirm-dialog">
          <p>¿Seguro que quieres eliminar este {confirmDelete.type === 'employee' ? 'empleado' : 'tarea'}?</p>
          <div>
            <button className="delete-btn" onClick={() => confirmDelete.type === 'employee' ? deleteEmployee(confirmDelete.id) : deleteTask(confirmDelete.id)}>Sí, eliminar</button>
            <button className="edit-btn" onClick={() => setConfirmDelete({type:'', id:null})}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;