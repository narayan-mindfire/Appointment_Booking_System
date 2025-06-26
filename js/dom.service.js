import state from "./states.js";
import { SLOTS } from "./constants.js";

// accessing all DOM elements
const form = document.getElementById('myForm');
const doctorEle = document.getElementById('doctor');
const btnHalf = document.getElementById('btn-half');
const btnFull = document.getElementById('btn-full');
const dateEle = document.getElementById("date");
const sortEle = document.getElementById('sort');
const slotEle = document.getElementById('slot');
const appointmentCards = document.getElementById('appointment-cards');
const toast = document.getElementById("toast-message");
const docList = document.getElementById("doc-options");
const nameEle = document.getElementById("name");
const emailEle = document.getElementById("email");
const purposeEle = document.getElementById("purpose");
const slotOptionsEle = document.getElementById("slot-options");
const totalAppEle = document.getElementById("total-appointments");
const appointmentListContainer = document.getElementById("appointment-list-container");
const appointmentTable = document.getElementById('appointment-table')

/**
 * function to add appointment cards in DOMf
 * @param {object} appointment 
 */
function addAppointmentCard(appointment) {
    const card = document.createElement("div");
    card.className = "appointment-card";

    card.innerHTML = `
        <div class="card-content">
            <div class="header-section">
                <h3 class="patient-name" title="patient">${appointment.name}</h3>
                <p class="doctorEle-info" ><span class="doctorEle-name" title="doctorEle"><i class="fa-solid fa-stethoscope"></i> ${appointment.doctor}</span></p>
            </div>

            <p class="purpose-info" title="purpose">${appointment.purpose}</p>

            <div class="details-section">
                <div class="detail-item">
                    <span class="detail-label"> <i class="fa-solid fa-calendar-days" title="date"></i></span>
                    <span class="detail-value" title="date">${appointment.date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label" title="time"><i class="fa-solid fa-clock "></i></span>
                    <span class="detail-value" title="time">${appointment.slot}</span>
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

    appointmentCards.appendChild(card);
}

/**
 * Add appointment to the table view
 * @param {object} appointment
 */
function addAppointmentRow(appointment) {
  const tbody = document.getElementById("appointment-table-body");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${appointment.name}</td>
    <td>${appointment.email}</td>
    <td>${appointment.doctor}</td>
    <td>${appointment.date}</td>
    <td>${appointment.slot}</td>
    <td>${appointment.purpose}</td>
    <td>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </td>
  `;

  row.querySelector(".edit").addEventListener("click", () => editAppointment(appointment.id));
  row.querySelector(".delete").addEventListener("click", () => deleteAppointment(appointment.id));

  tbody.appendChild(row);
}


/**
 * checks and udpdates available slots
 */
function updateAvailableSlots() {
    const date = dateEle.value;
    const doctorVal = doctorEle.value;

    // Clear old options
    slotEle.innerHTML = `<option value="">Select a time slot</option>`;

    if (!date || !doctorVal) return;

    const appointments = state.appointments;
    const bookedSlots = appointments
        .filter(appointment => appointment.date === date && appointment.doctor === doctorVal && appointment.id !== state.editingAppointmentId)
        .map(appointment => appointment.slot);

    const today = new Date();
    const selectedDate = new Date(date);
    const isToday = today.toDateString() === selectedDate.toDateString();

    SLOTS.forEach(slot => {
        const slotHour = Number(slot.split(":")[0]);
        const isDisabled = bookedSlots.includes(slot) || (isToday && slotHour <= today.getHours());

        if (!isDisabled) {
            const option = document.createElement("option");
            option.value = slot;
            option.textContent = slot;
            slotEle.appendChild(option);
        }
    });
}

/**
 * Loads appointment data into form for editing.
 * @param {number} id - Appointment ID
 */
function editAppointment(id) {
    showToast("Appointment set to edit", "success");
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });

    const appointments = state.appointments;
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;

    state.editingAppointmentId = id;

    // highlight card view
    document.querySelectorAll(".appointment-card").forEach(card => {
        const cardName = card.querySelector(".patient-name")?.textContent.trim();
        const cardDate = card.querySelector(".detail-item:nth-child(1) .detail-value")?.textContent.trim();
        const cardTime = card.querySelector(".detail-item:nth-child(2) .detail-value")?.textContent.trim();

        if (
            cardName === appointment.name &&
            cardDate === appointment.date &&
            cardTime === appointment.slot
        ) {
            card.classList.add("highlighted");
        } else {
            card.classList.remove("highlighted");
        }
    });

    // highlight table row (optional)
    document.querySelectorAll("#appointment-table-body tr").forEach(row => {
        const cells = row.getElementsByTagName("td");
        const name = cells[0]?.textContent.trim();
        const email = cells[1]?.textContent.trim();
        const doctor = cells[2]?.textContent.trim();
        const date = cells[3]?.textContent.trim();
        const slot = cells[4]?.textContent.trim();

        if (
            name === appointment.name &&
            email === appointment.email &&
            doctor === appointment.doctor &&
            date === appointment.date &&
            slot === appointment.slot
        ) {
            row.classList.add("highlighted");
        } else {
            row.classList.remove("highlighted");
        }
    });

    // pre-fill form
    nameEle.value = appointment.name;
    emailEle.value = appointment.email;
    dateEle.value = appointment.date;
    doctorEle.value = appointment.doctor;
    updateAvailableSlots(); // must come before setting slot
    slotEle.value = appointment.slot;
    purposeEle.value = appointment.purpose;

    resetErrorMessages();
    form.querySelector("#submit").value = "Update Appointment";
}


/**
 * Clears all validation error messages.
 */
function resetErrorMessages() {
    document.querySelectorAll(".error-message").forEach(ele => ele.textContent = "");
}

/**
 * Updates the total appointment count.
 */
function updateAppointmentCount() {
    totalAppEle.textContent = state.appointments.length;
}

/**
 * Load and render all appointments.
 */
function reloadAppointmentList() {
    const appointments = state.appointments;
    console.log(appointments)
    console.log("at reload app list")
    appointmentCards.innerHTML = "";
    document.getElementById("appointment-table-body").innerHTML = "";


    if(state.sortAppointmentsBy){
        // all comparisions are done among strings for now
        console.log("sorting by: ", state.sortAppointmentsBy)
        
        switch(state.sortAppointmentsBy){
            case "date": 
                appointments.sort((a, b) => {
                    return a["date"].localeCompare(b["date"]);
                });
                break;
            case "dateR": 
                appointments.sort((a, b) => {
                    return b["date"].localeCompare(a["date"]);
                });
                break;
            case "doctor": 
                appointments.sort((a, b) => {
                    return a["doctor"].toLowerCase().localeCompare(b["doctor"].toLowerCase());
                });
                break;
            case "doctorR": 
                appointments.sort((a, b) => {
                    return b["doctor"].toLowerCase().localeCompare(a["doctor"].toLowerCase());
                });
                break;
            case "name": 
                appointments.sort((a, b) => {
                    return a["name"].toLowerCase().localeCompare(b["name"].toLowerCase());
                });
                break;
            case "nameR": 
                appointments.sort((a, b) => {
                    return b["name"].toLowerCase().localeCompare(a["name"].toLowerCase());
                });
                break;
        }
    }

    appointments.forEach(app => {
        addAppointmentCard(app);
        addAppointmentRow(app);
    });

    updateAppointmentCount();
}

/**
 * function to show toast messages in the dom
 * @param {string} message 
 * @param {string} type 
 */
function showToast(message, type = "success") {
    const toast = document.getElementById("toast-message");
    toast.textContent = message;
    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-visible");

    toast.style.backgroundColor = {
      success: "green",
      warning: "orange",
      error: "red"
    }[type] || "gray";

    setTimeout(() => {
      toast.classList.remove("toast-visible");
      toast.classList.add("toast-hidden");
    }, 3000);
}

/**
 * function to delete appointments using id
 * @param {string} id 
 * @returns 
 */
function deleteAppointment(id) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    const updatedAppointments = state.appointments.filter(app => app.id !== id);
    state.setAppointments(updatedAppointments);

    appointmentCards.innerHTML = "";
    document.getElementById("appointment-table-body").innerHTML = "";

    reloadAppointmentList();
    showToast("Appointment deleted.", "success");
}


export {
    form,
    doctorEle, 
    btnHalf, 
    btnFull, 
    dateEle, 
    sortEle, 
    slotEle, 
    appointmentCards, 
    toast, 
    docList,
    nameEle,
    emailEle,
    purposeEle,
    slotOptionsEle,
    totalAppEle,
    appointmentListContainer,
    appointmentTable,
    addAppointmentCard,
    addAppointmentRow,
    updateAppointmentCount,
    reloadAppointmentList,
    showToast,
    deleteAppointment,
    updateAvailableSlots,
    resetErrorMessages
};