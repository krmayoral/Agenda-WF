import React, { useState, useEffect } from 'react';
import './App.css';


const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!dueDate) return null;
    
    const difference = new Date(dueDate) - new Date();
    
    if (difference <= 0) {
      return { expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    if (!dueDate) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (!dueDate) {
    return <p><strong>Tiempo restante:</strong> Sin fecha de vencimiento</p>;
  }

  if (timeLeft?.expired) {
    return <p style={{color: '#e74c3c', fontWeight: 'bold'}}>⏰ Tarea vencida</p>;
  }

  if (!timeLeft) {
    return <p><strong>Tiempo restante:</strong> Calculando...</p>;
  }

  return (
    <p>
      <strong>Tiempo restante:</strong> {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </p>
  );
};


const OverdueIndicator = ({ task }) => {
  const isOverdue = () => {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== 'Completada';
  };

  if (!isOverdue()) {
    return null;
  }

  return (
    <div className="overdue-indicator" title="Tarea vencida y no completada">
      <span className="overdue-cross">✕</span>
    </div>
  );
};


const PriorityIndicator = ({ task }) => {
  if (!task.isPriority) {
    return null;
  }

  return (
    <div className="priority-indicator" title="Tarea prioritaria">
      <span className="priority-star">⭐</span>
    </div>
  );
};


const TaskStatusCounter = ({ tasks }) => {
  const countTasksByStatus = () => {
    const counts = {
      Pendiente: 0,
      'En proceso': 0,
      Completada: 0
    };

    tasks.forEach(task => {
      if (counts.hasOwnProperty(task.status)) {
        counts[task.status]++;
      }
    });

    return counts;
  };

  const taskCounts = countTasksByStatus();

  return (
    <div className="task-status-counter">
      <h3>Resumen de tareas</h3>
      <div className="counter-grid">
        <div className="counter-item pending">
          <span className="counter-number">{taskCounts.Pendiente}</span>
          <span className="counter-label">Pendientes</span>
        </div>
        <div className="counter-item in-progress">
          <span className="counter-number">{taskCounts['En proceso']}</span>
          <span className="counter-label">En proceso</span>
        </div>
        <div className="counter-item completed">
          <span className="counter-number">{taskCounts.Completada}</span>
          <span className="counter-label">Completadas</span>
        </div>
      </div>
      <div className="counter-total">
        Total de tareas: {tasks.length}
      </div>
    </div>
  );
};


const DueSoonNotifications = ({ tasks, onAcknowledge }) => {
  const [acknowledgedTasks, setAcknowledgedTasks] = useState([]);

  const isDueSoon = (task) => {
    if (!task.dueDate || task.status === 'Completada') return false;
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff <= 2 && daysDiff >= 0;
  };

  const handleAcknowledge = (taskId) => {
    setAcknowledgedTasks(prev => [...prev, taskId]);
    if (onAcknowledge) {
      onAcknowledge(taskId);
    }
  };

  const dueSoonTasks = tasks.filter(task => 
    isDueSoon(task) && !acknowledgedTasks.includes(task.id)
  );

  if (dueSoonTasks.length === 0) {
    return null;
  }

  return (
    <div className="due-soon-notifications">
      <h3>📢 Tareas próximas a vencer</h3>
      {dueSoonTasks.map(task => (
        <div key={task.id} className="due-soon-notification">
          <div className="notification-content">
            <h4>{task.title}</h4>
            <p><strong>Asignada a:</strong> {task.assignedTo}</p>
            <p><strong>Vence:</strong> {task.dueDate}</p>
            <p><strong>Estado:</strong> {task.status}</p>
            <p className="due-soon-warning">⏳ Esta tarea está próxima a vencer</p>
          </div>
          <button 
            className="acknowledge-btn"
            onClick={() => handleAcknowledge(task.id)}
          >
            Enterado
          </button>
        </div>
      ))}
    </div>
  );
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', startDate: '', dueDate: '', status: 'Pendiente', isPriority: false });
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', degree: '', activities: '' });

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ type: '', id: null });

  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResultsEmployees, setSearchResultsEmployees] = useState([]);
  const [searchResultsTasks, setSearchResultsTasks] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [employeeDegreeFilter, setEmployeeDegreeFilter] = useState('');
  const [employeePositionFilter, setEmployeePositionFilter] = useState('');

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


  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResultsEmployees([]);
      setSearchResultsTasks([]);
      setSearchPerformed(false);
    }
  }, [searchTerm]);

  
  const getUniqueDegrees = () => {
    const degrees = employees.map(emp => emp.degree).filter(degree => degree.trim() !== '');
    return [...new Set(degrees)]; 
  };


  const getUniquePositions = () => {
    const positions = employees.map(emp => emp.position).filter(position => position.trim() !== '');
    return [...new Set(positions)]; 
  };

  const getSortedTasks = (tasksArray) => {
    return tasksArray.slice().sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB; 
    });
  };

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
      setNewTask({ title: '', description: '', assignedTo: '', startDate: '', dueDate: '', status: 'Pendiente', isPriority: false });
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


  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const empResults = employees.filter(emp =>
      emp.name.toLowerCase().includes(term)
    );
    const taskResults = tasks.filter(task =>
      task.title.toLowerCase().includes(term)
    );
    setSearchResultsEmployees(empResults);
    setSearchResultsTasks(taskResults);
    setSearchPerformed(true);
  };

  const getFilteredTasks = () => {
    if (!taskStatusFilter) return tasks;
    return tasks.filter(task => task.status === taskStatusFilter);
  };

  const getFilteredEmployees = () => {
    let filtered = employees;
    
    if (employeeDegreeFilter) {
      filtered = filtered.filter(emp => emp.degree === employeeDegreeFilter);
    }
    
    if (employeePositionFilter) {
      filtered = filtered.filter(emp => emp.position === employeePositionFilter);
    }
    
    return filtered;
  };

  const clearFilters = () => {
    setTaskStatusFilter('');
    setEmployeeDegreeFilter('');
    setEmployeePositionFilter('');
  };

  const handleAcknowledgeNotification = (taskId) => {
    
    console.log(`Notificación para tarea ${taskId} marcada como vista`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Agenda wf</h1>
      </header>

      <div className="container">

        
        <DueSoonNotifications 
          tasks={tasks} 
          onAcknowledge={handleAcknowledgeNotification}
        />

      
        <div className="section">
          <h2>Buscar empleado o tarea</h2>
          <div className="search-form">
            <input 
              type="text" 
              placeholder="Ingrese nombre del empleado o título de tarea" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button onClick={handleSearch}>Buscar</button>
          </div>

          {searchPerformed && (searchResultsEmployees.length === 0 && searchResultsTasks.length === 0) && (
            <p className="no-results">No hay resultados</p>
          )}

          {searchResultsEmployees.length > 0 && (
            <div className="search-results">
              <h3>Empleados encontrados</h3>
              <div className="employee-list">
                {searchResultsEmployees.map(emp => (
                  <div key={emp.id} className="employee-card">
                    <h3>{emp.name}</h3>
                    <p><strong>Puesto:</strong> {emp.position}</p>
                    <p><strong>Licenciatura:</strong> {emp.degree}</p>
                    <p><strong>Actividades:</strong> {emp.activities}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResultsTasks.length > 0 && (
            <div className="search-results">
              <h3>Tareas encontradas</h3>
              <div className="task-list">
                {getSortedTasks(searchResultsTasks).map(task => (
                  <div key={task.id} className="task-card" style={{backgroundColor: getTaskColor(task.status)}}>
                    <OverdueIndicator task={task} />
                    <PriorityIndicator task={task} />
                    <h3 className="task-title">{task.title}</h3>
                    <p><strong>Descripción:</strong> {task.description}</p>
                    <p><strong>Asignada a:</strong> {task.assignedTo}</p>
                    <p><strong>Fecha de inicio:</strong> {task.startDate}</p>
                    <p><strong>Fecha de vencimiento:</strong> {task.dueDate}</p>
                    <p><strong>Estado:</strong> {task.status}</p>
                    {task.isPriority && <p><strong>🔴 Prioritaria</strong></p>}
                    
                    <CountdownTimer dueDate={task.dueDate} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      
        <div className="section">
          <h2>Filtros</h2>
          <div className="filters-container">
            <div className="filter-group">
              <label>Filtrar tareas por estado:</label>
              <select 
                value={taskStatusFilter} 
                onChange={(e) => setTaskStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completada">Completada</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Filtrar empleados por licenciatura:</label>
              <select 
                value={employeeDegreeFilter} 
                onChange={(e) => setEmployeeDegreeFilter(e.target.value)}
              >
                <option value="">Todas las licenciaturas</option>
                {getUniqueDegrees().map((degree, index) => (
                  <option key={index} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Filtrar empleados por puesto:</label>
              <select 
                value={employeePositionFilter} 
                onChange={(e) => setEmployeePositionFilter(e.target.value)}
              >
                <option value="">Todos los puestos</option>
                {getUniquePositions().map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>

        
          {(taskStatusFilter || employeeDegreeFilter || employeePositionFilter) && (
            <div className="filter-results">
              {taskStatusFilter && (
                <div className="filtered-section">
                  <h3>Tareas filtradas ({getFilteredTasks().length})</h3>
                  <div className="task-list">
                    {getSortedTasks(getFilteredTasks()).map(task => (
                      <div key={task.id} className="task-card" style={{backgroundColor: getTaskColor(task.status)}}>
                        <OverdueIndicator task={task} />
                        <PriorityIndicator task={task} />
                        <h3 className="task-title">{task.title}</h3>
                        <p><strong>Descripción:</strong> {task.description}</p>
                        <p><strong>Asignada a:</strong> {task.assignedTo}</p>
                        <p><strong>Fecha de inicio:</strong> {task.startDate}</p>
                        <p><strong>Fecha de vencimiento:</strong> {task.dueDate}</p>
                        <p><strong>Estado:</strong> {task.status}</p>
                        {task.isPriority && <p><strong>🔴 Prioritaria</strong></p>}
                        
                        <CountdownTimer dueDate={task.dueDate} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(employeeDegreeFilter || employeePositionFilter) && (
                <div className="filtered-section">
                  <h3>Empleados filtrados ({getFilteredEmployees().length})</h3>
                  <div className="employee-list">
                    {getFilteredEmployees().map(employee => (
                      <div key={employee.id} className="employee-card">
                        <h3>{employee.name}</h3>
                        <p><strong>Puesto:</strong> {employee.position}</p>
                        <p><strong>Licenciatura:</strong> {employee.degree}</p>
                        <p><strong>Actividades:</strong> {employee.activities}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="section">
          <h2>Agregar nuevo empleado</h2>
          <div className="form">
            <input type="text" placeholder="Nombre" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} />
            <input type="text" placeholder="Puesto" value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} />
            <input type="text" placeholder="Licenciatura" value={newEmployee.degree} onChange={(e) => setNewEmployee({...newEmployee, degree: e.target.value})} />
            <input type="text" placeholder="Actividades" value={newEmployee.activities} onChange={(e) => setNewEmployee({...newEmployee, activities: e.target.value})} />
            <button onClick={addEmployee}>Agregar empleado</button>
          </div>
        </div>

        <div className="section">
          <h2>Lista de empleados ({employees.length})</h2>
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
          <h2>Agregar nueva tarea</h2>
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
            <div className="priority-checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={newTask.isPriority} 
                  onChange={e => setNewTask({...newTask, isPriority: e.target.checked})} 
                />
                <span className="checkbox-label">Marcar como tarea prioritaria</span>
              </label>
            </div>
            <button onClick={addTask}>Agregar tarea</button>
          </div>
        </div>

        <div className="tasks-container">
          <div className="tasks-main-section">
            <div className="section">
              <h2>Lista de tareas ({tasks.length})</h2>
              <div className="task-list">
                {getSortedTasks(tasks).map(task => (
                  <div key={task.id} className="task-card" style={{backgroundColor: getTaskColor(task.status)}}>
                    <OverdueIndicator task={task} />
                    <PriorityIndicator task={task} />
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
                        <div className="priority-checkbox">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={editingTask.isPriority} 
                              onChange={e => setEditingTask({...editingTask, isPriority: e.target.checked})} 
                            />
                            <span className="checkbox-label">Marcar como tarea prioritaria</span>
                          </label>
                        </div>
                        <div className="card-buttons">
                          <button className="edit-btn" onClick={saveEditTask}>Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="task-title">{task.title}</h3>
                        <p><strong>Descripción:</strong> {task.description}</p>
                        <p><strong>Asignada a:</strong> {task.assignedTo}</p>
                        <p><strong>Fecha de inicio:</strong> {task.startDate}</p>
                        <p><strong>Fecha de vencimiento:</strong> {task.dueDate}</p>
                        <p><strong>Estado:</strong> {task.status}</p>
                        {task.isPriority && <p><strong>🔴 Prioritaria</strong></p>}
                      
                        <CountdownTimer dueDate={task.dueDate} />
                        <div className="card-buttons">
                          <button className="status-btn" onClick={() => toggleTaskStatus(task)}>Cambiar estado</button>
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

          <div className="tasks-sidebar">
            <TaskStatusCounter tasks={tasks} />
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
