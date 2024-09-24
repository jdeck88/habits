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

// Function to ensure all unique dates are in place and data is consolidated for rendering
function parseCsvAndRenderChart(csvData) {
  const bpData = { dates: [], systolic: [], diastolic: [] };
  const habitData = {}; // Object to store each habit's completion status by date
  const uniqueDates = new Set(); // Store all unique dates

  // Use PapaParse to parse the CSV data
  Papa.parse(csvData, {
    header: true, // Treat the first row as headers
    complete: function(results) {
      results.data.forEach(row => {
        const date = row['Date'] ? row['Date'] : null; // Check if Date exists
        const value = row['Value'] ? parseInt(row['Value']) : 0; // If Value is missing, assume 0
        const habit = row['Habit'];

        if (date) {
          uniqueDates.add(date); // Add to unique date set
        }

        // Extract blood pressure readings (ignore missing dates for blood pressure)
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
        } else {
          // For other habits, assume Value is 0 if no date exists
          if (!habitData[habit]) {
            habitData[habit] = [];
          }

          // Add habit values only if date exists
          if (date) {
            if (value > 0) {
              habitData[habit].push({ x: date, y: 50 }); // Scale habit value for visibility
            } else {
              habitData[habit].push({ x: date, y: null }); // Mark null if habit wasn't done
            }
          }
        }
      });

      // Convert uniqueDates set to a sorted array
      const sortedDates = Array.from(uniqueDates).sort();

      // Now render the chart with both blood pressure and habit data
      renderChart(sortedDates, bpData, habitData);
    },
    error: function(error) {
      console.error('Error parsing CSV:', error);
    }
  });
}

// Function to render chart using Chart.js
function renderChart(sortedDates, bpData, habitData) {
  const ctx = document.getElementById('bpChart').getContext('2d');

  // Ensure the blood pressure data aligns with sorted dates
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
    }
  ];

  // Add datasets for each habit, showing "Exercise for 20 minutes" by default
  Object.keys(habitData).forEach(habit => {
    datasets.push({
      label: habit, // Habit name
      data: habitData[habit], // Habit completion status
      type: 'scatter', // Scatter plot for habit completion
      borderColor: habit === 'Exercise for 20 minutes' ? 'rgba(0, 200, 50, 1)' : 'rgba(0, 0, 0, 1)',
      backgroundColor: habit === 'Exercise for 20 minutes' ? 'rgba(0, 200, 50, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      pointRadius: 5, // Customize marker size
      fill: false,
      hidden: habit !== 'Exercise for 20 minutes' // Show "Exercise for 20 minutes" by default
    });
  });

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedDates, // Sorted unique dates for the x-axis
      datasets: datasets // Combine all datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          max: 200 // Set max scale to 200 to fit blood pressure and habit scaling
        }
      },
      responsive: true,
    }
  });
}

