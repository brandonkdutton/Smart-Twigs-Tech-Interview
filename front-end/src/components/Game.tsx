import React, { useState, FC, useEffect } from 'react';

type user = {
  id: number,
  name: string,
  wins: number,
  cumulative_points: number
}
interface props {
  update: () => void,
  a: user | null,
  b: user | null,
  server: user | null
}

const Game: FC<props> = ({ a, b, server, update }) => {

  type pointState = Record<string, number>;

  const [round, setRound] = useState<number>(1);
  const [localServer, setLocalServer] = useState<user | null>(server);
  const [winner, setWinner] = useState<user | null>();
  const [lastServeSwitch, setLastServeSwitch] = useState<number>(0);
  const [points, setPoints] = useState<pointState>({
    'a': 0,
    'b': 0
  });

  useEffect(() => {
    if (points['a'] > 10 && points['b'] < 10) {
      setWinner(a);
    } else if (points['b'] > 10 && points['a'] < 10) {
      setWinner(b);
    } else if (points['b'] >= 10 && points['a'] >= 10) {
      if (points['a'] - points['b'] >= 2) {
        setWinner(a);
      } else if (points['b'] - points['a'] >= 2) {
        setWinner(b);
      }
    }
  }, [round]);

  const incrementRound = (winner: string): void => {
    const oldRound = round;
    const newPoints = Object.assign({}, points);
    newPoints[winner] += 1;
    setPoints(newPoints);
    setRound(round + 1);

    if (round - lastServeSwitch >= 2) {
      setLastServeSwitch(oldRound);
      const newServer = localServer === a ? b : a;
      setLocalServer(newServer);
    }


  };

  useEffect(() => {
    if (winner) {
      const handleWinning = async (): Promise<void> => {
        const uri = 'http://localhost:5000/updateWinner';
        const body: user = Object.assign({}, winner);
        const winnerPoints: number = points['a'] > points['b'] ? points['a'] : points['b'];
        debugger;
        body['cumulative_points'] += winnerPoints;

        const result = await fetch(uri, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const jsonResult = await result.json();
        const updatedUser: user = jsonResult['user'];
        update();
      }
      handleWinning();
    }
  }, [winner]);


  return (
    <div>
      {winner && <h1>{winner.name} Wins!</h1>}
      <h3>Round: {round}, Server: {localServer?.name}</h3>
      <h4>A points: {points['a']}</h4>
      <button onClick={() => incrementRound('a')}>+1 point to A</button>
      <h4>B points: {points['b']}</h4>
      <button onClick={() => incrementRound('b')}>+1 point to B</button>
    </div>
  );
}

export default Game;