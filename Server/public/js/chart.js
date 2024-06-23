$( async function() {
  /* ChartJS
   * -------
   * Data and config for chartjs
   */
  const ID = localStorage.getItem('userID');
  const sendData = { ID:ID };

  const response = await fetch('/loginAdmin/updateCharts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sendData)
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  
        // Assuming `recivedData` is the data received from the server
        const recivedData = await response.json();

        // Extract dates and counts
        const dates = recivedData.user.last7DaysLoginCounts.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }); // Format MM-DD
      });
        const counts = recivedData.user.last7DaysLoginCounts.map(item => item.count);


        // Create the data object for Chart.js
        var data = {
            labels: dates,
            datasets: [{
                label: 'First Logins in Last 7 Days',
                data: counts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(75, 192, 192, 0.2)' // added extra color for 7th day
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(75, 192, 192, 1)' // added extra border color for 7th day
                ],
                borderWidth: 1,
                fill: false
            }]
        };
  var options = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0
      }
    }

  };
  // Get context with jQuery - using jQuery's .get() method.
  if ($("#revenue").length) {
    var barChartCanvas = $("#revenue").get(0).getContext("2d");
    // This will get the first returned node in the jQuery collection.
    var barChart = new Chart(barChartCanvas, {
      type: 'bar',
      data: data,
      options: options
    });
  }

  if ($("#errorEvents").length) {
    var barChartCanvas = $("#errorEvents").get(0).getContext("2d");
    // This will get the first returned node in the jQuery collection.
    var barChart = new Chart(barChartCanvas, {
      type: 'bar',
      data: data,
      options: options
    });
  }

  if ($("#newUser").length) {
    var lineChartCanvas = $("#newUser").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }

  if ($("#activeUser").length) {
    var lineChartCanvas = $("#activeUser").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }

  if ($("#returningUser").length) {
    var lineChartCanvas = $("#returningUser").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }

  if ($("#transactions").length) {
    var lineChartCanvas = $("#transactions").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }

  if ($("#sessions").length) {
    var lineChartCanvas = $("#sessions").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }

  if ($("#errorEvents").length) {
    var lineChartCanvas = $("#errorEvents").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }
});