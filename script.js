document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleView");
    const weekView = document.querySelector(".week-view");
    const monthView = document.querySelector(".month-view");
    const dayLabelsContainer = document.querySelector(".day-labels");
    const monthGrid = document.querySelector(".month-grid");

    // Event Schedule (Editable) - Load from localStorage or use default
    // Default Event Schedule
    const defaultEvents = {
        "2025-03-03": [{ name: "Dinner Date", time: "5:00 PM", location: "Lal Mirch" }],
        "2025-03-04": [
            { name: "Apartment cleanup", time: "2:00 PM", location: "Yours" },
            { name: "Gym", time: "2:00 PM", location: "Rec Cen" }
        ],
        "2025-03-07": [{ name: "Weekly Talk", time: "5:00 PM", location: "Mine" }], 
        "2025-03-08": [{ name: "Study Session", time: "12:00 PM", location: "Library" }],
        "2025-03-12": [{ name: "Cooking You Dinner", time: "6:00 PM", location: "My place" }],
        "2025-03-14": [{ name: "Weekly Talk", time: "5:00 PM", location: "My place" }],
        "2025-03-15": [{ name: "Date Night", time: "5:30 PM", location: "Color Me Mine" }],
        "2025-03-16": [{ name: "Study Session", time: "10:00 AM", location: "Library" }],
        "2025-03-17": [{ name: "Gym", time: "12:00 PM", location: "Rec Center" }],
        "2025-03-18": [{ name: "Study Session", time: "10:00 AM", location: "Library" }],
        "2025-03-19": [{ name: "Dinner Date", time: "6:00 PM", location: "Empty Bowl" }],
        "2025-03-20": [{ name: "Flight", time: "10:30 AM", location: "SBA" }],
        "2025-03-21": [{ name: "Weekly Talk on FaceTime", time: "5:00 PM", location: "FT" }],
        "2025-03-28": [{ name: "Weekly Talk on FaceTime", time: "5:00 PM", location: "FT" }]
    };
    
    // Load from localStorage or use defaults
    let eventSchedule = JSON.parse(localStorage.getItem("eventSchedule"));

    // If localStorage is empty or missing events, update it
    if (!eventSchedule || Object.keys(eventSchedule).length === 0) {
        localStorage.setItem("eventSchedule", JSON.stringify(defaultEvents));
        eventSchedule = defaultEvents;
    }

    /*** 🗓️ Function to Populate the Weekly Planner ***/
    function populateWeeklyPlanner() {
        let today = new Date();
        let currentDayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
        let currentDate = today.getDate();
        let currentMonth = today.getMonth();
        let currentYear = today.getFullYear();
    
        let daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
        for (let i = 0; i < 7; i++) {
            let dayDiff = i - currentDayOfWeek;
            let day = new Date(currentYear, currentMonth, currentDate + dayDiff);
            let formattedDate = day.toISOString().split("T")[0];
    
            let dayElement = document.getElementById(daysOfWeek[i]);
            let list = dayElement.querySelector("ul");
            list.innerHTML = "";
    
            if (eventSchedule[formattedDate]) {
                eventSchedule[formattedDate].forEach((event, index) => {
                    let listItem = document.createElement("li");
                    let calendarLink = generateGoogleCalendarLink(event.name, formattedDate, event.time, event.location);
                    listItem.innerHTML = `
                        <a href="${calendarLink}" target="_blank">
                            ${event.name} - ${event.time}
                        </a>
                        <br><small>📍 ${event.location}</small>
                        <button onclick="editEvent('${formattedDate}', ${index})">✏️ Edit</button>
                    `;
                    list.appendChild(listItem);
                });
            }
        }
    }

    /*** 📆 Function to Populate the Monthly Planner ***/
    function populateMonthlyPlanner() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const firstDayIndex = firstDayOfMonth.getDay();

        monthGrid.innerHTML = "";
        dayLabelsContainer.innerHTML = "";

        const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
        dayLabels.forEach(day => {
            let label = document.createElement("div");
            label.textContent = day;
            dayLabelsContainer.appendChild(label);
        });

        for (let i = 0; i < firstDayIndex; i++) {
            let emptyCell = document.createElement("div");
            emptyCell.classList.add("month-day", "hidden");
            monthGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            let dateKey = `${currentYear}-03-${String(day).padStart(2, '0')}`;
            let dayDiv = document.createElement("div");
            dayDiv.classList.add("month-day");
            dayDiv.innerHTML = `<h3>${day}</h3>`;

            if (day === today.getDate()) {
                dayDiv.classList.add("today");
            }

            if (eventSchedule[dateKey]) {
                let eventList = document.createElement("ul");
                eventSchedule[dateKey].forEach((event, index) => {
                    let listItem = document.createElement("li");
                    let calendarLink = generateGoogleCalendarLink(event.name, dateKey, event.time, event.location);
                    listItem.innerHTML = `
                        <a href="${calendarLink}" target="_blank">
                            ${event.name} - ${event.time}
                        </a>
                        <br><small>📍 ${event.location}</small>
                        <button onclick="editEvent('${dateKey}', ${index})">✏️ Edit</button>
                    `;
                    eventList.appendChild(listItem);
                });
                dayDiv.appendChild(eventList);
            }

            monthGrid.appendChild(dayDiv);
        }
    }

    /*** 🔗 Function to Generate Google Calendar Event Link ***/
    function generateGoogleCalendarLink(eventName, eventDate, eventTime, eventLocation) {
        let baseUrl = "https://calendar.google.com/calendar/r/eventedit";
        let formattedDateTime = formatGoogleCalendarDateTime(eventDate, eventTime);

        let params = new URLSearchParams({
            text: eventName,
            dates: formattedDateTime,
            details: "Planned via Our Cute Planner 💖",
        });

        if (eventLocation) {
            params.append("location", eventLocation);
        }

        return `${baseUrl}?${params.toString()}`;
    }

    /*** 📅 Function to Format Date & Time for Google Calendar ***/
    function formatGoogleCalendarDateTime(eventDate, eventTime) {
        let [year, month, day] = eventDate.split("-");
        let eventDateTime = new Date(year, month - 1, day);

        if (eventTime !== "All Day") {
            let [hour, minutePart] = eventTime.split(":");
            let minute = minutePart.replace(/\D/g, "");
            let isPM = /PM/.test(eventTime);
            hour = parseInt(hour);

            if (isPM && hour < 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;

            eventDateTime.setHours(hour, parseInt(minute), 0, 0);
        } else {
            eventDateTime.setHours(0, 0, 0, 0);
        }

        let formattedStart = eventDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        let endDateTime = new Date(eventDateTime);
        endDateTime.setHours(eventDateTime.getHours() + 1);
        let formattedEnd = endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        return `${formattedStart}/${formattedEnd}`;
    }

    /*** ✏️ Function to Edit Events ***/
    window.editEvent = function(dateKey, index) {
        let newTime = prompt("Enter new time (e.g., 7:30 PM):");
        if (newTime) {
            const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)$/i;
            if (timeRegex.test(newTime)) {
                eventSchedule[dateKey][index].time = newTime;
                localStorage.setItem("eventSchedule", JSON.stringify(eventSchedule));
                populateWeeklyPlanner();
                populateMonthlyPlanner();
            } else {
                alert("Incorrect time format. Please enter a time such as: 3:00 PM.");
            }
        }
    };

    /*** 🔄 Function to Toggle Between Views ***/
    toggleButton.addEventListener("click", () => {
        weekView.style.display = weekView.style.display === "none" ? "flex" : "none";
        monthView.style.display = monthView.style.display === "none" ? "grid" : "none";
        toggleButton.textContent = weekView.style.display === "none" ? "Switch to Weekly View" : "Switch to Monthly View";
    });

    /*** 🎀 Expanding Navigation Menu ***/
    const menuButton = document.querySelector(".menu-button");
    const navMenu = document.querySelector(".nav-menu");

    menuButton.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    populateWeeklyPlanner();
    populateMonthlyPlanner();
});


