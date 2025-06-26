import { getAppointments, setAppointments } from "./storage.service.js";
import state from "./states.js";
import { slots } from "./constants.js";

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
 * checks and udpdates available slots
 */
function updateAvailableSlots() {
    const date = dateEle.value;
    const doctorVal = doctorEle.value;

    // Clear old options
    slotEle.innerHTML = `<option value="">Select a time slot</option>`;

    if (!date || !doctorVal) return;

    const appointments = getAppointments();
    const bookedSlots = appointments
        .filter(appointment => appointment.date === date && appointment.doctor === doctorVal && appointment.id !== state.editingAppointmentId)
        .map(appointment => appointment.slot);

    const today = new Date();
    const selectedDate = new Date(date);
    const isToday = today.toDateString() === selectedDate.toDateString();

    slots.forEach(slot => {
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
    showToast("appointment set to edit", "success");
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    const appointments = getAppointments();
    const appointment = appointments.find(app => app.id === id);

    const allCards = document.querySelectorAll(".appointment-card");
    allCards.forEach(card => {
        const cardName = card.querySelector(".patient-name")?.textContent.trim();
        const cardDate = card.querySelector(".detail-item:nth-child(1) .detail-value")?.textContent.trim();
        const cardTime = card.querySelector(".detail-item:nth-child(2) .detail-value")?.textContent.trim(); 

        if (
            cardName === appointment.name &&
            cardDate === appointment.date &&
            cardTime === appointment.slot
        ) {
            console.log("found the card for : ", cardName, cardDate, cardTime)
            card.classList.add("highlighted");
        } else {
            console.log("didnt find the appointment card")
            card.classList.remove("highlighted");
        }
    });

    if (!appointment) return;

    state.editingAppointmentId = id;

    nameEle.value = appointment.name;
    emailEle.value = appointment.email;
    dateEle.value = appointment.date;
    doctorEle.value = appointment.doctorEle;
    updateAvailableSlots(); // Updating before setting slot to reflect correct availability
    slotEle.value = appointment.slot;
    purposeEle.value = appointment.purpose;

    form.querySelector("#submit").value = "Update Appointment";
}

/**
 * Updates the total appointment count.
 */
function updateAppointmentCount() {
    totalAppEle.textContent = getAppointments().length;
}

/**
 * Load and render all appointments.
 */
function reloadAppointmentList() {
    const appointments = getAppointments();
    console.log("at reload app list")
    appointmentCards.innerHTML = "";

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
    const appointments = getAppointments().filter(app => app.id !== id);
    setAppointments(appointments);
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
    addAppointmentCard,
    updateAppointmentCount,
    reloadAppointmentList,
    showToast,
    deleteAppointment,
    updateAvailableSlots
};