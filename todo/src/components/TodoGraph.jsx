import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTodo } from '../contexts/todoContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const TodoGraph = () => {
  const { todos } = useTodo();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const processData = () => {
      const completionStatus = todos.reduce((acc, todo) => {
        if (todo.completed) {
          acc.completed++;
        } else {
          acc.pending++;
        }
        return acc;
      }, { completed: 0, pending: 0 });

      return {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [completionStatus.completed, completionStatus.pending],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
          ],
          borderWidth: 1,
        }],
      };
    };

    if (todos.length > 0) {
      setChartData(processData());
    }
  }, [todos]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          padding: 15,
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Task Completion Status',
        color: 'white',
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: {
          bottom: 15
        }
      }
    }
  };

  if (!chartData || todos.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-gray-400">
          Add tasks to see completion status
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <div className="h-[250px]">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TodoGraph;
