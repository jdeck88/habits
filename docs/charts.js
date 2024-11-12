// Function to parse CSV files and extract both blood pressure and other habits data
document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvData = e.target.result;
      parseCsvAndRenderChart(csvData);
    };
    reader.readAsText(file);
  }
});

function parseCsvAndRenderChart(csvData) {
  const bpData = { dates: [], systolic: [], diastolic: [] };
  const habitData = {}; // Store each habit's completion status by date
  const uniqueDates = new Set(); // Store all unique dates
  const dateHabitCompletion = {}; // Store completion status of all habits for each date

  // Use PapaParse to parse the CSV data
  Papa.parse(csvData, {
    header: true, // Treat the first row as headers
    complete: function(results) {
      results.data.forEach(row => {
        const date = row['Date'] ? row['Date'] : null;
        const value = row['Value'] ? parseInt(row['Value']) : 0;
        const habit = row['Habit'];

        if (date) {
          uniqueDates.add(date);

          // Initialize habit completion tracking for the date
          if (!dateHabitCompletion[date]) {
            dateHabitCompletion[date] = { totalHabits: 0, completedHabits: 0 };
          }

          // Track total habits and completed habits per date
          dateHabitCompletion[date].totalHabits += 1;
          if (value > 0) {
            dateHabitCompletion[date].completedHabits += 1;
          }

          // Extract blood pressure readings
          if (habit.includes('Take Blood Pressure')) {
            const bpValues = row['Memo'].match(/\d+\/\d+/);
            if (bpValues && date) {
              const [systolic, diastolic] = bpValues[0].split('/');
              if (!bpData.dates.includes(date)) {
                bpData.dates.push(date);
                bpData.systolic.push(parseInt(systolic));
                bpData.diastolic.push(parseInt(diastolic));
              }
            }
          }
        }
      });

      // Convert uniqueDates set to a sorted array
      const sortedDates = Array.from(uniqueDates).sort();

      // Create a dataset for dots where all habits were completed
      const allHabitsCompletedData = sortedDates.map(date => {
        const habitCompletion = dateHabitCompletion[date];
        // Only mark a dot if all habits were completed for this date
        return habitCompletion && habitCompletion.totalHabits === habitCompletion.completedHabits
          ? { x: date, y: 150 } // Position the dot at y = 150 for visibility
          : { x: date, y: null };
      });

      // Render the chart with updated data
      renderChart(sortedDates, bpData, allHabitsCompletedData);
    },
    error: function(error) {
      console.error('Error parsing CSV:', error);
    }
  });
}


function renderChart(sortedDates, bpData, allHabitsCompletedData) {
  const ctx = document.getElementById('bpChart').getContext('2d');

  const systolicData = sortedDates.map(date => {
    const index = bpData.dates.indexOf(date);
    return index > -1 ? bpData.systolic[index] : null;
  });

  const diastolicData = sortedDates.map(date => {
    const index = bpData.dates.indexOf(date);
    return index > -1 ? bpData.diastolic[index] : null;
  });

  const datasets = [
    {
      label: 'Systolic Pressure',
      data: systolicData,
      borderColor: 'rgba(255, 99, 132, 1)',
      fill: false,
    },
    {
      label: 'Diastolic Pressure',
      data: diastolicData,
      borderColor: 'rgba(54, 162, 235, 1)',
      fill: false,
    },
    {
      label: 'All Habits Completed',
      data: allHabitsCompletedData,
      type: 'scatter',
      borderColor: 'rgba(0, 200, 50, 1)',
      backgroundColor: 'rgba(0, 200, 50, 0.7)',
      pointRadius: 6,
      fill: false,
    }
  ];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedDates,
      datasets: datasets,
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          max: 200,
        },
      },
      responsive: true,
    },
  });
}


