import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const TodoStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    personalTodos: 0,
    teamTodos: 0,
    highPriority: 0,
    completionRate: 0
  });

  const [completionChart, setCompletionChart] = useState({
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#f44336'],
      borderColor: ['#43A047', '#E53935'],
      borderWidth: 1
    }]
  });

  const [todoTypeChart, setTodoTypeChart] = useState({
    labels: ['Personal', 'Team'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#2196F3', '#FF9800'],
      borderColor: ['#1E88E5', '#FB8C00'],
      borderWidth: 1
    }]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/todos/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats(response.data);
        
        // Update completion chart
        setCompletionChart(prev => ({
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: [response.data.completed, response.data.pending]
          }]
        }));

        // Update todo type chart
        setTodoTypeChart(prev => ({
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: [response.data.personalTodos, response.data.teamTodos]
          }]
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom align="center">
        Todo Statistics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ height: 250 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Completion Status
            </Typography>
            <Pie data={completionChart} options={chartOptions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ height: 250 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Todo Types
            </Typography>
            <Doughnut data={todoTypeChart} options={chartOptions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
              Summary
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total Todos: {stats.total}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Completed: {stats.completed}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Pending: {stats.pending}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Personal Todos: {stats.personalTodos}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Team Todos: {stats.teamTodos}
            </Typography>
            <Typography variant="body1" gutterBottom>
              High Priority: {stats.highPriority}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Completion Rate: {Math.round(stats.completionRate)}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TodoStats;
