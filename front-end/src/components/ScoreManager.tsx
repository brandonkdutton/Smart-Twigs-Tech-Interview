import React, { useState, useEffect, FC, FormEvent } from 'react';
import Game from './Game';

const ScoreManager: FC = ({ }) => {

  type user = {
    id: number,
    name: string,
    wins: number,
    cumulative_points: number
  }
  type userState = user[];
  type selectedUsers = {
    a: user | null,
    b: user | null,
    server: user | null
  }

  const [users, setUsers] = useState<userState>();
  const [leaders, setLeaders] = useState<userState>();
  const [updateBoard, setUpdateBoard] = useState<number>(0);
  const [newUserName, setNewUserName] = useState<string>();
  const [selectedUsersState, setSelectedUsersState] = useState<selectedUsers>({
    a: null,
    b: null,
    server: null
  });

  useEffect(() => {
    const getUsers = async (): Promise<void> => {
      const uri = 'http://localhost:5000/getUsers';
      const result = await fetch(uri);
      const jsonResult = await result.json();

      if (result.status >= 200 && result.status < 400) {
        setUsers(jsonResult['users']);
      } else {
        alert('failed to fetch users');
      }

    };
    getUsers();
  }, []);

  useEffect(() => {
    const getLeaders = async (): Promise<void> => {
      const uri = 'http://localhost:5000/getLeaderboard';
      const result = await fetch(uri);
      const jsonResult = await result.json();

      if (result.status >= 200 && result.status < 400) {
        setLeaders(jsonResult['users']);
      } else {
        alert('failed to fetch leader board');
      }
    };
    getLeaders();
  }, [updateBoard]);

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const uri = 'http://localhost:5000/createUser';
    const body = { name: newUserName };

    const result = await fetch(uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const jsonResult = await result.json();
    const addedUser: user = jsonResult['user'];

    if (result.status >= 200 && result.status < 400) {
      const newUsers = users?.slice();
      newUsers?.push(addedUser);
      setUsers(newUsers);
    }

  };

  const handleSelected = (userObj: user, user: string) => {
    const newSelected = Object.assign({}, selectedUsersState);
    //@ts-ignore
    newSelected[user] = userObj;
    setSelectedUsersState(newSelected);
  }



  const bothUsersSelected = selectedUsersState.a && selectedUsersState.a && selectedUsersState.server;

  return (
    <>
      <h3>Select User or create a new one</h3>
      <h4>User A selected: {selectedUsersState.a?.name}</h4>
      <h4>User B selected: {selectedUsersState.b?.name}</h4>
      <h4>Server: {selectedUsersState.server?.name}</h4>
      <button onClick={() => window.location.reload()}>Terminate Game</button>
      <ul>
        {users?.map((user: user) => (
          <li key={user.id}>
            {user.name}
            {!selectedUsersState!.a && <button onClick={() => handleSelected(user, 'a')}>Select User for player a</button>}
            {!selectedUsersState!.b && <button onClick={() => handleSelected(user, 'b')}>Select User for player b</button>}
            {!selectedUsersState!.server && <button onClick={() => handleSelected(user, 'server')}>Select as server</button>}
          </li>
        ))}
      </ul>
      <form onSubmit={e => handleCreateUser(e)}>
        <label htmlFor="newUserName">New user name</label>
        <input type="text" id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
        <input type="submit" value="Create User" />
      </form>

      {
        bothUsersSelected ? <Game update={() => { setUpdateBoard(updateBoard + 1) }} a={selectedUsersState.a} b={selectedUsersState.b} server={selectedUsersState.server} /> : <h3>Select players and server to continue</h3>
      }

      <h3>Leader boards</h3>
      <ul>
        {leaders?.map((user: user) => {
          return <li key={user.id}>{user.name}, wins: {user.wins}, points: {user.cumulative_points}</li>
        })}
      </ul>

    </>
  );
};

export default ScoreManager;
