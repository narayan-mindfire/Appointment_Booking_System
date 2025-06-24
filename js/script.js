// configuration for form validation: true-> for 
export const validationConfig = {
    "name": true,
    "date": true,
    "doctor": true,
    "slot": true,
    "purpose": true,
}

// doctor list
export const docs = [
  "Aarya Sharma",
  "Rohan Mehta",
  "Meera Nair",
  "Vihaan Kapoor",
  "Kavya Sinha",
  "Arjun Patel",
  "Isha Reddy",
  "Dev Malhotra",
  "Ananya Iyer",
  "Neil Deshmukh",
  "Tara Joshi",
  "Kunal Bansal",
  "Riya Choudhury",
  "Yash Verma",
  "Sneha Bhatt",
  "Aryan Singh",
  "Pooja Das",
  "Rahul Jain",
  "Nikita Roy",
  "Aditya Chauhan"
];

const form = document.getElementById('myForm');
const slots = ["10:00", "11:00", "12:00", "1:00"];
let editingAppointmentId = null;

// Initialize on load
initialize();

/**
 * Initialize the application.
 */
function initialize() {
    setMinDateForInput("date");
    markRequiredFields();
    setDoctors();
    reloadAppointmentList();

    form.addEventListener('submit', handleForm);
    document.getElementById("doctor").addEventListener("change", updateAvailableSlots);
    document.getElementById("date").addEventListener("change", updateAvailableSlots);

    document.addEventListener('click', handleDoctorDropdownClick);
    document.getElementById('doctor').addEventListener('click', handleDoctorInputFieldClick);
}

/**
 * Sets the minimum date for the appointment date input to today.
 * @param {string} inputId - The ID of the date input element.
 */
function setMinDateForInput(inputId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;

    document.getElementById(inputId).setAttribute("min", minDate);
}

/**
 * Displays asterisk for required fields.
 */
function markRequiredFields() {
    Object.keys(validationConfig).forEach(field => {
        if (validationConfig[field]) {
            const label = document.getElementById(`required-${field}`);
            if (label) label.textContent = '*';
        }
    });
}

/**
 * Handles doctor dropdown toggle visibility.
 */
function handleDoctorDropdownClick(event) {
    doctorSelectedRecently = false;
    const doctorInput = document.getElementById("doctor");
    const docList = document.getElementById("doc-options");
    if (!doctorInput.contains(event.target)) {
        docList.style.display = "none";
    }
}
let doctorSelectedRecently = false;
function handleDoctorInputFieldClick(){
    // debugger
    if(!doctorSelectedRecently) {
        document.getElementById("doc-options").style.display = "block"   
    }
}

/**
 * Handles form submission, including validation, creating and updating appointments.
 * @param {Event} event 
 */
function handleForm(event) {
    event.preventDefault();

    const fields = getFormFields();
    resetErrorMessages();

    let isValid = true;
    for (let key in fields) {
        if (validationConfig[key] && !fields[key]) {
            isValid = false;
            const errorElement = document.getElementById(`${key}-error`);
            if (errorElement) {
                errorElement.textContent = `${key} is required.`;
            }
        }
    }

    if (!isValid) return;

    let appointments = getAppointments();

    if (editingAppointmentId) {
        const index = appointments.findIndex(app => app.id === editingAppointmentId);
        if (index !== -1) {
            appointments[index] = { id: editingAppointmentId, ...fields };
            editingAppointmentId = null;
            form.querySelector("#submit").value = "Book Appointment";
        } else {
            alert("Appointment you're editing no longer exists, please create a new one.");
            return;
        }
    } else {
        appointments.push({ id: Date.now(), ...fields });
    }

    setAppointments(appointments);
    form.reset();
    updateAvailableSlots();
    reloadAppointmentList();
}

/**
 * Returns form field values as an object.
 */
function getFormFields() {
    return {
        name: document.getElementById("name").value,
        date: document.getElementById("date").value,
        doctor: document.getElementById("doctor").value,
        slot: document.getElementById("slot").value,
        purpose: document.getElementById("purpose").value
    };
}

/**
 * Clears all validation error messages.
 */
function resetErrorMessages() {
    document.querySelectorAll(".error-message").forEach(ele => ele.textContent = "");
}

/**
 * Populates available time slots based on selected date and doctor.
 */
function updateAvailableSlots() {
    const date = document.getElementById("date").value;
    const doctor = document.getElementById("doctor").value;
    const slotSelect = document.getElementById("slot");

    slotSelect.innerHTML = '<option value="">Select a slot</option>';
    if (!date || !doctor) return;

    const appointments = getAppointments();
    const bookedSlots = appointments
        .filter(appointment => appointment.date === date && appointment.doctor === doctor && appointment.id !== editingAppointmentId)
        .map(appointment => appointment.slot);

    const todayStr = new Date().toISOString().split('T')[0];

    const availableSlots = slots.filter(slot => {
        const isBooked = bookedSlots.includes(slot);
        const isToday = date === todayStr;
        return !isBooked && (!isToday || isSlotAvailable(slot));
    });

    if (availableSlots.length === 0) {
        slotSelect.innerHTML = '<option value="">No slots available</option>';
        return;
    }

    availableSlots.forEach(slot => {
        const option = document.createElement("option");
        option.value = slot;
        option.textContent = slot;
        slotSelect.appendChild(option);
    });
}

/**
 * Checks if a slot is available today (based on current time).
 * @param {string} slot 
 * @returns {boolean}
 */
function isSlotAvailable(slot) {
    const slotHour = Number(slot.split(":")[0]);
    return slotHour > new Date().getHours();
}

/**
 * Load doctors into dropdown with search filter.
 */
function setDoctors() {
    const doctorInput = document.getElementById("doctor");
    const docOptions = document.getElementById("doc-options");

    renderDoctorOptions(docs);

    doctorInput.addEventListener("input", function () {
        const filteredDocs = docs.filter(doc =>
            doc.toLowerCase().includes(this.value.toLowerCase())
        );
        docOptions.style.display = "block"
        renderDoctorOptions(filteredDocs);
    });

    docOptions.addEventListener("click", function (event) {
        event.stopPropagation()
        // debugger
        if (event.target.classList.contains("doctor-option")) {
            doctorInput.value = event.target.textContent;
            updateAvailableSlots();
            docOptions.style.display = "none";
            doctorSelectedRecently = true;
        }
    });
}

/**
 * Renders a list of doctor options.
 * @param {string[]} list 
 */
function renderDoctorOptions(list) {
    const docOptions = document.getElementById("doc-options");
    docOptions.innerHTML = "";
    list.forEach(doc => {
        const div = document.createElement("div");
        div.textContent = doc;
        div.className = "doctor-option";
        div.style.borderBottom = "1px solid black";
        docOptions.appendChild(div);
    });
}

/**
 * Load and render all appointments.
 */
function reloadAppointmentList() {
    const cardContainer = document.getElementById("appointment-cards");
    cardContainer.innerHTML = "";

    const appointments = getAppointments();
    appointments.forEach(app => {
        addAppointmentCard(app);
    });

    updateAppointmentCount();
}

/**
 * Get appointments from localStorage.
 * @returns {Object[]} appointments
 */
function getAppointments() {
    const data = localStorage.getItem("appointments");
    return data ? JSON.parse(data) : [];
}

/**
 * Saves appointments to localStorage.
 * @param {Object[]} appointments 
 */
function setAppointments(appointments) {
    localStorage.setItem("appointments", JSON.stringify(appointments));
}

/**
 * Updates the total appointment count.
 */
function updateAppointmentCount() {
    document.getElementById("total-appointments").textContent = getAppointments().length;
}

/**
 * Add appointment entry to the card view.
 * @param {Object} appointment 
 */
function addAppointmentCard(appointment) {
    const cardContainer = document.getElementById("appointment-cards");
    const card = document.createElement("div");
    card.className = "appointment-card";

    // NEW MODERN CARD HTML STRUCTURE
    card.innerHTML = `
        <div class="card-content">
            <div class="header-section">
                <h3 class="patient-name">${appointment.name}</h3>
                <p class="doctor-info">with Dr. <span class="doctor-name">${appointment.doctor}</span></p>
            </div>

            <p class="purpose-info">${appointment.purpose}</p>

            <div class="details-section">
                <div class="detail-item">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${appointment.date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${appointment.slot}</span>
                </div>
            </div>
        </div>

        <div class="card-buttons">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
        </div>
    `;

    card.querySelector(".edit").addEventListener("click", () => editAppointment(appointment.id));
    card.querySelector(".delete").addEventListener("click", () => deleteAppointment(appointment.id));

    cardContainer.appendChild(card);
}
/**
 * Deletes an appointment by ID after confirmation.
 * @param {number} id - Appointment ID
 */
function deleteAppointment(id) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    const appointments = getAppointments().filter(app => app.id !== id);
    setAppointments(appointments);
    reloadAppointmentList();
}

/**
 * Loads appointment data into form for editing.
 * @param {number} id - Appointment ID
 */
function editAppointment(id) {
    const appointments = getAppointments();
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;

    editingAppointmentId = id;

    document.getElementById("name").value = appointment.name;
    document.getElementById("date").value = appointment.date;
    document.getElementById("doctor").value = appointment.doctor;
    updateAvailableSlots(); // Updating before setting slot to reflect correct availability
    document.getElementById("slot").value = appointment.slot;
    document.getElementById("purpose").value = appointment.purpose;

    form.querySelector("#submit").value = "Update Appointment";
}
