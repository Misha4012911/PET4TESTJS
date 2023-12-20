import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  const [users, setUsers] = useState([]);

  useEffect(()=>{
    axios
      .get('http://localhost:5000/api/users')
      .then(response => {
        console.log(response.data);
        setUsers(response.data);
      })
      .catch(error => {
        console.log('Error fetching data:', error);
      })
  }, []);
 
  return (
    <div className='App'>
      {users.map(user => {
        return (
          <p key={user.id}>{user.username} под логином {user.login}</p>  
        );
      })}
    </div>
  );
}

export default App;