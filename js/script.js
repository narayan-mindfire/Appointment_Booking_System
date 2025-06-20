const form = document.getElementById('myForm');
let editingAppointmentId = null;

// Attaching form submit handler
form.addEventListener('submit', handleForm);

// Loading appointments on page load
reloadAppointmentList();

// Handling form submission
function handleForm(event) {
    event.preventDefault(); 

    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const doctor = document.getElementById("doctor").value;
    const slot = document.getElementById("slot").value;
    const purpose = document.getElementById("purpose").value;

    if (!name || !date || !doctor || !slot || !purpose) {
        alert("Please enter all the data");
        return;
    }

    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    if (editingAppointmentId) {
        // Update existing appointment
        const index = appointments.findIndex(app => app.id === editingAppointmentId);
        if (index !== -1) {
            appointments[index] = {
                id: editingAppointmentId,
                name,
                date,
                doctor,
                slot,
                purpose
            };
        }
        editingAppointmentId = null;
        document.getElementById("submit").value = "Book Appointment";
    } else {
        // Create new appointment
        const appointment = {
            id: Date.now(),
            name,
            date,
            doctor,
            slot,
            purpose
        };
        appointments.push(appointment);
    }

    localStorage.setItem('appointments', JSON.stringify(appointments));
    form.reset();
    reloadAppointmentList();
}

// Saving appointment to table
function addAppointmentToList(appointment) {
    const table = document.querySelector(".appointment-list table");
    const row = document.createElement("tr");

    row.setAttribute("data-id", appointment.id);

    row.innerHTML = `
        <td>${appointment.name}</td>
        <td>${appointment.doctor}</td>
        <td>${appointment.date}</td>
        <td>${appointment.slot}</td>
        <td><button class="edit">✏️</button></td>
        <td><button class="delete">❌</button></td>
    `;

    // Delete button
    row.querySelector(".delete").addEventListener("click", () => {
        deleteAppointment(appointment.id);
    });

    // Edit button
    row.querySelector(".edit").addEventListener("click", () => {
        editAppointment(appointment.id);
    });

    table.appendChild(row);
}

// Deleteting the appointment
function deleteAppointment(id) {
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    appointments = appointments.filter(app => app.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    reloadAppointmentList();
}

// Editing appointment
function editAppointment(id) {
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;

    document.getElementById("name").value = appointment.name;
    document.getElementById("date").value = appointment.date;
    document.getElementById("doctor").value = appointment.doctor;
    document.getElementById("slot").value = appointment.slot;
    document.getElementById("purpose").value = appointment.purpose;
    document.getElementById("submit").value = "Update Appointment";

    editingAppointmentId = id;
}

// Updating appointment count
function updateAppointmentCount() {
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];
    document.getElementById("total-appointments").textContent = appointments.length;
}

// Clearing and reloading the full appointment list
function reloadAppointmentList() {
    const table = document.querySelector(".appointment-list table");
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Slot</th>
            <th>Edit</th>
            <th>Delete</th>
        </tr>
    `;

    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    appointments.forEach(app => addAppointmentToList(app));
    updateAppointmentCount();
}
