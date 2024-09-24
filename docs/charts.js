// Function to parse CSV and extract blood pressure data
function parseCsvAndRenderChart(csvData) {
  const bpData = { dates: [], systolic: [], diastolic: [] };

  // Use PapaParse to parse the CSV data
  Papa.parse(csvData, {
    header: true, // Treat the first row as headers
    complete: function(results) {
      // Loop through the rows and extract the relevant blood pressure data
      results.data.forEach(row => {
        if (row['Habit'].includes('Take Blood Pressure')) {
          const bpValues = row['Memo'].match(/\d+\/\d+/);
          if (bpValues) {
            const [systolic, diastolic] = bpValues[0].split('/');
            bpData.dates.push(row['Date']);
            bpData.systolic.push(parseInt(systolic));
            bpData.diastolic.push(parseInt(diastolic));
          }
        }
      });

      // Now render the chart using the extracted data
      renderChart(bpData);
    },
    error: function(error) {
      console.error('Error parsing CSV:', error);
    }
  });
}

// Function to render chart using Chart.js
function renderChart(bpData) {
  const ctx = document.getElementById('bpChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: bpData.dates,  // Dates for the x-axis
      datasets: [
        {
          label: 'Systolic Pressure',
          data: bpData.systolic,  // Systolic pressure values
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: false,
        },
        {
          label: 'Diastolic Pressure',
          data: bpData.diastolic,  // Diastolic pressure values
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: false,
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Fetch the CSV file from the data directory
fetch('habits.csv')
  .then(response => response.text())
  .then(csvData => parseCsvAndRenderChart(csvData))
  .catch(error => console.error('Error fetching CSV file:', error));

