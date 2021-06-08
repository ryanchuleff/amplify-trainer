import React, { useState, useEffect } from 'react';
import { AmplifyAuthenticator, AmplifyAuthContainer, AmplifySignOut } from '@aws-amplify/ui-react'
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { API, graphqlOperation } from 'aws-amplify'
import { createTask } from './graphql/mutations'
import { listTasks } from './graphql/queries'
import './App.css';

function App() {
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
      console.log(authData);
    });
  }, []);

  const initialState = { title: '', description: '' }
  const [formState, setFormState] = useState(initialState)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    fetchTasks()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTasks() {
    try {
      const taskData = await API.graphql(graphqlOperation(listTasks))
      const tasks = taskData.data.listTasks.items
      setTasks(tasks)
    } catch (err) { console.log('error fetching tasks') }
  }

  async function addTask() {
    try {
      if (!formState.title || !formState.description) return
      const task = { ...formState }
      setTasks([...tasks, task])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTask, {input: task}))
    } catch (err) {
      console.log('error creating task:', err)
    }
  }

  return authState === AuthState.SignedIn && user ? (
    <div className="App">
      <h1>Hello, {user.attributes.email}</h1>
      <input
        onChange={event => setInput('title', event.target.value)}
        style={styles.input}
        value={formState.title}
        placeholder="Title"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTask}>Create Task</button>
      {
        tasks.map((task, index) => (
          <div key={task.id ? task.id : index} style={styles.task}>
            <p style={styles.taskName}>{task.title}</p>
            <p style={styles.taskDescription}>{task.description}</p>
          </div>
        ))
      }
      <AmplifySignOut />
    </div>
  ) : (
    <AmplifyAuthContainer>
      <AmplifyAuthenticator />
    </AmplifyAuthContainer>
  );
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  task: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  taskName: { fontSize: 20, fontWeight: 'bold' },
  taskDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App;
