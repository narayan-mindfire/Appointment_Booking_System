const form = document.getElementById('myForm');
let editingAppointmentId = null;

// setting four time slots
const slots = ["10:00", "11:00", "12:00", "1:00"];

form.addEventListener('submit', handleForm);
document.getElementById("doctor").addEventListener("change", updateAvailableSlots);
document.getElementById("date").addEventListener("change", updateAvailableSlots);

// fetching local storage data upon load/reload
reloadAppointmentList();

function handleForm(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const doctor = document.getElementById("doctor").value;
    const slot = document.getElementById("slot").value;
    const purpose = document.getElementById("purpose").value;

    let isValid = true;

    // Reset error messages
    resetErrorMessages();

    // showing error messages individually
    if (!name) {
        isValid = false;
        document.getElementById("name-error").textContent = "Name is required.";
    }
    if (!date) {
        isValid = false;
        document.getElementById("date-error").textContent = "Date is required.";
    }
    if (!doctor) {
        isValid = false;
        document.getElementById("doctor-error").textContent = "Doctor selection is required.";
    }
    if (!slot) {
        isValid = false;
        document.getElementById("slot-error").textContent = "Slot selection is required.";
    }
    if (!isValid) {
        return;
    }

    // Save or update appointment
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    if (editingAppointmentId) {
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
    updateAvailableSlots();
    reloadAppointmentList();
}

function resetErrorMessages() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(message => message.textContent = "");
}


// appointment list
function addAppointmentToList(appointment) {
    const table = document.querySelector(".appointment-list table");
    const row = document.createElement("tr");

    row.setAttribute("data-id", appointment.id);

    row.innerHTML = `
        <td>${appointment.name}</td>
        <td>${appointment.doctor}</td>
        <td>${appointment.date}</td>
        <td>${appointment.slot}</td>
        <td><button class="edit">✏️</button>
            <button class="delete">❌</button>
        </td>
    `;

    // adding click event listeners on deletion and edit buttons
    row.querySelector(".delete").addEventListener("click", () => {
        deleteAppointment(appointment.id);
    });

    row.querySelector(".edit").addEventListener("click", () => {
        editAppointment(appointment.id);
    });

    table.appendChild(row);
}

// deleting appointment
function deleteAppointment(id) {
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    appointments = appointments.filter(app => app.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    reloadAppointmentList();
}

// edit functionality
function editAppointment(id) {
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;

    document.getElementById("name").value = appointment.name;
    document.getElementById("date").value = appointment.date;
    document.getElementById("doctor").value = appointment.doctor;
    // setting the edit id for changing button text
    editingAppointmentId = id;

    updateAvailableSlots();
    document.getElementById("slot").value = appointment.slot;
    document.getElementById("purpose").value = appointment.purpose;
    document.getElementById("submit").value = "Update Appointment";
}

// total appointment count
function updateAppointmentCount() {
    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];
    document.getElementById("total-appointments").textContent = appointments.length;
}

// reloading appointment list
function reloadAppointmentList() {
    const table = document.querySelector(".appointment-list table");
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Slot</th>
            <th>activity</th>
        </tr>
    `;

    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    appointments.forEach(app => addAppointmentToList(app));
    updateAppointmentCount();
}

// slot availability updation
function updateAvailableSlots() {
    const date = document.getElementById("date").value;
    const doctor = document.getElementById("doctor").value;
    const slotSelect = document.getElementById("slot");

    slotSelect.innerHTML = '<option value="">Select a slot</option>';

    if (!date || !doctor) return;

    let appointments = localStorage.getItem('appointments');
    appointments = appointments ? JSON.parse(appointments) : [];

    // checking for booked slots
    const bookedSlots = appointments
        .filter(app => app.date === date && app.doctor === doctor && app.id !== editingAppointmentId)
        .map(app => app.slot);

    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

    // setting available slots in the ui
    availableSlots.forEach(slot => {
        const option = document.createElement("option");
        option.value = slot;
        option.textContent = slot;
        slotSelect.appendChild(option);
    });
}
