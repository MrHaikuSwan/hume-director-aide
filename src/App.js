import React, { useState } from 'react';
import Player from './Player.js'
import './App.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [joyData, setJoyData] = useState([]);
  const [confusionData, setConfusionData] = useState([]);

  const renderChartData = {
    labels: Array.from({length: joyData.length}, (_, index) => index + 1),
    datasets: [
      {
        label: 'Joy',
        data: joyData,
        fill: false,
        borderColor: 'rgb(73, 222, 73)',
        tension: 0.1
      },
      {
        label: 'Confusion',
        data: confusionData,
        fill: false,
        borderColor: 'rgb(227, 61, 61)',
        tension: 0.1
      }
    ]
  }

  return (
    <div>
      <div>
        <Line 
          data={renderChartData} 
          height={300}
          options={{ 
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Sentiment vs. Time (seconds)'
              }
            }
          }} 
        />
      </div>
      <Player setJoyData={setJoyData} setConfusionData={setConfusionData} />
    </div>
  );
}

export default App;
