$(async function() {
  const ID = localStorage.getItem('userID');
  const sendData = { ID: ID };

  // Fetch new users data
  const responseNewUser = await fetch('/loginAdmin/updateCharts', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendData)
  });

  if (!responseNewUser.ok) {
      throw new Error('Network response was not ok');
  }

  const recivedDataNewUser = await responseNewUser.json();
  const newUsersCounts = recivedDataNewUser.user.last7DaysLoginCounts.map(item => item.count);

  // Fetch active users data
  const responseActiveUser = await fetch('/userManager/getActiveUser', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendData)
  });

  if (!responseActiveUser.ok) {
      throw new Error('Network response was not ok');
  }

  const recivedDataActive = await responseActiveUser.json();
  const activeUserCounts = recivedDataActive.activeUserCounts.map(item => item.count);

  // Fetch returning users data
  const responseReturningUser = await fetch('/userManager/getReturningUser', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendData)
  });

  if (!responseReturningUser.ok) {
      throw new Error('Network response was not ok');
  }

  const recivedDataReturning = await responseReturningUser.json();
  const returningUserCount = recivedDataReturning.returningUserCount;

  // Get dates for the last 7 days including today
  const today = new Date();
  const dates = [];
  for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }));
  }

  // Create the data object for new users Chart.js
  const newUsersData = {
      labels: dates,
      datasets: [{
          label: 'New Users in Last 7 Days',
          data: newUsersCounts,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false
      }]
  };

  // Create the data object for active users Chart.js
  const activeUsersData = {
      labels: dates,
      datasets: [{
          label: 'Active Users in Last 7 Days',
          data: activeUserCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false
      }]
  };

  // Create the data object for returning users Chart.js
  const returningUsersData = {
      labels: dates,
      datasets: [{
          label: 'Returning Users in Last 7 Days',
          data: [0, 0, 0, 0, 0, 0, returningUserCount], // Assuming returning user count for the 7th day
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false
      }]
  };

  // Chart options
  var options = {
      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true
              }
          }]
      },
      legend: {
          display: true
      },
      elements: {
          point: {
              radius: 0
          }
      }
  };

  // Initialize new users chart if the element is present
  if ($("#newUser").length) {
      var lineChartCanvasNewUser = $("#newUser").get(0).getContext("2d");
      var lineChartNewUser = new Chart(lineChartCanvasNewUser, {
          type: 'line',
          data: newUsersData,
          options: options
      });
  }

  // Initialize active users chart if the element is present
  if ($("#activeUser").length) {
      var lineChartCanvasActiveUser = $("#activeUser").get(0).getContext("2d");
      var lineChartActiveUser = new Chart(lineChartCanvasActiveUser, {
          type: 'line',
          data: activeUsersData,
          options: options
      });
  }

  // Initialize returning users chart if the element is present
  if ($("#returningUser").length) {
      var lineChartCanvasReturningUser = $("#returningUser").get(0).getContext("2d");
      var lineChartReturningUser = new Chart(lineChartCanvasReturningUser, {
          type: 'line',
          data: returningUsersData,
          options: options
      });
  }
});


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
