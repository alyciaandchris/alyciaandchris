document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleView");
    const weekView = document.querySelector(".week-view");
    const monthView = document.querySelector(".month-view");
    const dayLabelsContainer = document.querySelector(".day-labels");
    const monthGrid = document.querySelector(".month-grid");

    // ✅ Event Schedule - Now automatically updates when you modify this object!
    const defaultEvents = {
        "2025-04-03": [{ name: "Flight Arrives", time: "5:50 PM", location: "Airport" }],
        "2025-04-06": [{ name: "Cook Dinner", time: "6:00 PM", location: "Your Apt" }],
        "2025-04-07": [{ name: "Gyn", time: "10:00 AM", location: "Rec Cen" }],
        "2025-04-08": [{ name: "Gym", time: "2:00 PM", location: "Rec Cen" },
            { name: "Weekly Talk", time: "1:00 PM", location: "Car Ride" }],
        "2025-04-09": [{ name: "Gym", time: "2:00 PM", location: "Rec Cen" },
            { name: "Date Night", time: "5:00 PM", location: "Surprise" }],
        "2025-04-10": [{ name: "Date Night", time: "5:00 PM", location: "Surprise" }],
        "2025-04-13": [{ name: "Comedy Show", time: "7:00 PM", location: "LA" },
            { name: "Lunch Date", time: "1:00 PM", location: "K-Town" }]
    };

    /*** 🗓️ Function to Populate the Weekly Planner ***/
    function populateWeeklyPlanner() {
        let today = new Date();
        let currentYear = today.getFullYear();
        let currentMonth = today.getMonth();
        let currentDate = today.getDate();
        let currentDayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    
        let daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
        for (let i = 0; i < 7; i++) {
            let dayDiff = i - currentDayOfWeek;
            let day = new Date(currentYear, currentMonth, currentDate + dayDiff);
            let formattedDate = day.toISOString().split("T")[0];
    
            let dayElement = document.getElementById(daysOfWeek[i]);
            let list = dayElement.querySelector("ul");
            list.innerHTML = "";
    
            if (defaultEvents[formattedDate]) {
                defaultEvents[formattedDate].forEach(event => {
                    let listItem = document.createElement("li");
                    let calendarLink = generateGoogleCalendarLink(event.name, formattedDate, event.time, event.location);
                    listItem.innerHTML = `
                        <a href="${calendarLink}" target="_blank">
                            ${event.name} - ${event.time}
                        </a>
                        <br><small>📍 ${event.location}</small>
                    `;
                    list.appendChild(listItem);
                });
            }
        }
    }

    /*** 📆 Function to Populate the Monthly Planner ***/
    function populateMonthlyPlanner() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

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
            let dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let dayDiv = document.createElement("div");
            dayDiv.classList.add("month-day");
            dayDiv.innerHTML = `<h3>${day}</h3>`;

            if (day === today.getDate()) {
                dayDiv.classList.add("today");
            }

            if (defaultEvents[dateKey]) {
                let eventList = document.createElement("ul");
                defaultEvents[dateKey].forEach(event => {
                    let listItem = document.createElement("li");
                    let calendarLink = generateGoogleCalendarLink(event.name, dateKey, event.time, event.location);
                    listItem.innerHTML = `
                        <a href="${calendarLink}" target="_blank">
                            ${event.name} - ${event.time}
                        </a>
                        <br><small>📍 ${event.location}</small>
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
        });

        if (eventLocation) {
            params.append("location", eventLocation);
        }

        return `${baseUrl}?${params.toString()}`;
    }

    /*** 📅 Function to Format Date & Time for Google Calendar ***/
    function formatGoogleCalendarDateTime(eventDate, eventTime) {
        let [year, month, day] = eventDate.split("-"); // Extract YYYY-MM-DD
        let eventDateTime = new Date(year, month - 1, day); // Create local date (month is 0-based)
    
        if (eventTime !== "All Day") {
            let [hour, minutePart] = eventTime.split(":");
            let minute = minutePart.replace(/\D/g, ""); // Extract minutes
            let isPM = /PM/.test(eventTime);
            hour = parseInt(hour);
    
            if (isPM && hour < 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
    
            eventDateTime.setHours(hour, parseInt(minute), 0, 0); // Set local hours
        } else {
            eventDateTime.setHours(0, 0, 0, 0); // Midnight for all-day event
        }
    
        // Ensure Google Calendar gets correct format (YYYYMMDDTHHmmSS)
        let formattedStart = eventDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        let endDateTime = new Date(eventDateTime);
        endDateTime.setHours(eventDateTime.getHours() + 1); // Default 1-hour duration
        let formattedEnd = endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
        return `${formattedStart}/${formattedEnd}`;
    }

    /*** 🔄 Function to Toggle Between Views (Defaults to Monthly) ***/
    toggleButton.addEventListener("click", () => {
        if (weekView.style.display === "none") {
            weekView.style.display = "flex";
            monthView.style.display = "none";
            toggleButton.textContent = "Switch to Monthly View";
        } else {
            weekView.style.display = "none";
            monthView.style.display = "grid";
            toggleButton.textContent = "Switch to Weekly View";
        }
    });

    // ✅ Default view is Monthly
    weekView.style.display = "none";
    monthView.style.display = "grid";

    populateWeeklyPlanner();
    populateMonthlyPlanner();
});