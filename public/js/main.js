const rides = [
  {
    id: 1,
    start: "New York",
    destination: "Boston",
    date: "14-07-2024",
    time: "10:00 AM",
    seats: 3,
  },
  {
    id: 2,
    start: "Los Angeles",
    destination: "San Francisco",
    date: "14-07-2024",
    time: "12:30 PM",
    seats: 2,
  },
  {
    id: 3,
    start: "Chicago",
    destination: "Detroit",
    date: "14-07-2024",
    time: "9:00 AM",
    seats: 4,
  },
  {
    id: 4,
    start: "Miami",
    destination: "Orlando",
    date: "14-07-2024",
    time: "2:00 PM",
    seats: 1,
  },
];

// Function to display rides
function displayRides(rideData) {
  const rideList = document.getElementById("ride-list");
  rideList.innerHTML = ""; // Clear existing rides
  rideData.forEach((ride) => {
    rideList.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${ride.start} to ${ride.destination}</h5>
                                <p class="card-text">Time: ${ride.date}</p>
                                <p class="card-text">Time: ${ride.time}</p>
                                <p class="card-text">Available Seats: ${ride.seats}</p>
                                <a href="#" class="btn btn-primary">Book Now</a>
                            </div>
                        </div>
                    </div>
                `;
  });
}

// Display all rides on page load
// displayRides(rides);

// Search form submission
document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const startLocation = document
    .getElementById("start-location")
    .value.toLowerCase();
  const destinationLocation = document
    .getElementById("destination-location")
    .value.toLowerCase();

  const filteredRides = rides.filter(
    (ride) =>
      ride.start.toLowerCase().includes(startLocation) &&
      ride.destination.toLowerCase().includes(destinationLocation)
  );

  displayRides(filteredRides);
});
