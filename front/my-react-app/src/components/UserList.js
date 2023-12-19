import React, { useState, useEffect } from 'react';

function UserList() {


  useEffect(() => {
    fetch('http//localhost:5000/users', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        setData(data);
      });
    });
  }, []);

  return (
    <table border="1">
      <tr>
        <td>Login</td>
        <td>Name</td>
      </tr>
      {data.map((user) => {
        return(
          <tr>
            <td>{data.login}</td>
            <td>{data.name}</td>
          </tr>
        );
      })}
    </table>
  );
}

export default UserList;