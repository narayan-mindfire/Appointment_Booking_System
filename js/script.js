// configuration for form validation: true-> for required fields, otherwise optional
const validationConfig = {
    "name": true,
    "date": true,
    "doctor": true,
    "slot": true,
    "purpose": true,
}

// doctor list
const docs = [
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

// global variables
const slots = ["10:00", "11:00", "12:00", "1:00"];
let editingAppointmentId = null;
let sortAppointmentsBy = null;
let gridSelected = false;
const form = document.getElementById('myForm');
const doctor = document.getElementById('doctor');

/**
 * Initialize the application.
 */
function initialize() {
    formModule.setMinDateForInput("date");
    formModule.markRequiredFields();
    formModule.setDoctors();
    appointmentModule.reloadAppointmentList();
    let gridSelected = localStorage.getItem("gridSelected");
    if(gridSelected === "true"){
        utils.selectGrid()
    }
    else if(gridSelected === "false"){
        utils.selectList()
    }
}

// utils module is used for functions like selection of list and grid view of cards
var utils = (function(){
    /**
     * Sets list view for appointments 
     */
    function selectList(){
        const appointmentCards = document.getElementById('appointment-cards');
        appointmentCards.classList.remove('full-width-view');
        document.getElementById('btn-half').style.backgroundColor = "#c5c4c4"
        document.getElementById('btn-full').style.backgroundColor = "white"
        localStorage.setItem("gridSelected", "false")
    }

    /**
     * Sets grid view for appointments
     */
    function selectGrid(){
        const appointmentCards = document.getElementById('appointment-cards');
        appointmentCards.classList.add('full-width-view');
        document.getElementById('btn-full').style.backgroundColor = "#c5c4c4"
        document.getElementById('btn-half').style.backgroundColor = "white"
        localStorage.setItem("gridSelected", "true")
    }

    /**
     * util function to reload appointment list with sorting
     * @param {event} event - carries sort parameter
     */
    function sortSetter(event){
        sortAppointmentsBy = event.target.value;
        console.log("sortAppointmentsBy: ", sortAppointmentsBy);
        appointmentModule.reloadAppointmentList();
    }

    return {
        selectGrid,
        selectList,
        sortSetter
    }
})();

// form module is used for functions related to the form
var formModule = (function(){

    // local variable
    let doctorSelectedRecently = false;

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

    /**
     * Handles the toggling of search results for doctors 
     */
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
    
        const fields = _getFormFields();
        _resetErrorMessages();
    
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
    
        let appointments = appointmentModule.getAppointments();
    
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
    
        appointmentModule.setAppointments(appointments);
        form.reset();
        updateAvailableSlots();
        appointmentModule.reloadAppointmentList();
    }
    
    /**
     * Returns form field values as an object.
     */
    function _getFormFields() {
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
    function _resetErrorMessages() {
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
    
        const appointments = appointmentModule.getAppointments();
        const bookedSlots = appointments
            .filter(appointment => appointment.date === date && appointment.doctor === doctor && appointment.id !== editingAppointmentId)
            .map(appointment => appointment.slot);
    
        const todayStr = new Date().toISOString().split('T')[0];
    
        const availableSlots = slots.filter(slot => {
            const isBooked = bookedSlots.includes(slot);
            const isToday = date === todayStr;
            return !isBooked && (!isToday || _isSlotAvailable(slot));
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
    function _isSlotAvailable(slot) {
        const slotHour = Number(slot.split(":")[0]);
        return slotHour > new Date().getHours();
    }
    
    /**
     * Load doctors into dropdown with search filter.
     */
    function setDoctors() {
        const doctorInput = document.getElementById("doctor");
        const docOptions = document.getElementById("doc-options");
    
        _renderDoctorOptions(docs);
    
        doctorInput.addEventListener("input", function () {
            const filteredDocs = docs.filter(doc =>
                doc.toLowerCase().includes(this.value.toLowerCase())
            );
            docOptions.style.display = "block"
            _renderDoctorOptions(filteredDocs);
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
    function _renderDoctorOptions(list) {
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

    return {
        setMinDateForInput,
        markRequiredFields,
        handleDoctorDropdownClick,
        handleDoctorInputFieldClick,
        updateAvailableSlots,
        handleForm,
        setDoctors
    }
})();

// appointmentModule is used for functions related to the appointment listing and other processes
var appointmentModule = (function(){
    /**
     * Load and render all appointments.
     */
    function reloadAppointmentList() {
        const appointments = getAppointments();
        console.log("at reload app list")
        const cardContainer = document.getElementById("appointment-cards");
        cardContainer.innerHTML = "";

        if(sortAppointmentsBy){
            // all comparisions are done among strings for now
            console.log("sorting by: ", sortAppointmentsBy)
            
            switch(sortAppointmentsBy){
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
            _addAppointmentCard(app);
        });

        _updateAppointmentCount();
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
    function _updateAppointmentCount() {
        document.getElementById("total-appointments").textContent = getAppointments().length;
    }
    
    /**
     * Add appointment entry to the card view.
     * @param {Object} appointment 
     */
    function _addAppointmentCard(appointment) {
        const cardContainer = document.getElementById("appointment-cards");
        const card = document.createElement("div");
        card.className = "appointment-card";
    
        card.innerHTML = `
            <div class="card-content">
                <div class="header-section">
                    <h3 class="patient-name">${appointment.name}</h3>
                    <p class="doctor-info"><span class="doctor-name"><i class="fa-solid fa-stethoscope"></i> ${appointment.doctor}</span></p>
                </div>
    
                <p class="purpose-info">${appointment.purpose}</p>
    
                <div class="details-section">
                    <div class="detail-item">
                        <span class="detail-label"> <i class="fa-solid fa-calendar-days"></i> DATE</span>
                        <span class="detail-value">${appointment.date}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><i class="fa-solid fa-clock"></i> TIME</span>
                        <span class="detail-value">${appointment.slot}</span>
                    </div>
                </div>
            </div>
    
            <div class="card-buttons">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </div>
        `;
    
        card.querySelector(".edit").addEventListener("click", () => _editAppointment(appointment.id));
        card.querySelector(".delete").addEventListener("click", () => _deleteAppointment(appointment.id));
    
        cardContainer.appendChild(card);
    }

    /**
     * Deletes an appointment by ID after confirmation.
     * @param {number} id - Appointment ID
     */
    function _deleteAppointment(id) {
        if (!confirm("Are you sure you want to delete this appointment?")) return;
    
        const appointments = getAppointments().filter(app => app.id !== id);
        setAppointments(appointments);
        reloadAppointmentList();
    }
    
    /**
     * Loads appointment data into form for editing.
     * @param {number} id - Appointment ID
     */
    function _editAppointment(id) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        const appointments = getAppointments();
        const appointment = appointments.find(app => app.id === id);
    
        if (!appointment) return;
    
        editingAppointmentId = id;
    
        document.getElementById("name").value = appointment.name;
        document.getElementById("date").value = appointment.date;
        document.getElementById("doctor").value = appointment.doctor;
        formModule.updateAvailableSlots(); // Updating before setting slot to reflect correct availability
        document.getElementById("slot").value = appointment.slot;
        document.getElementById("purpose").value = appointment.purpose;
    
        form.querySelector("#submit").value = "Update Appointment";
    }

    return {
        reloadAppointmentList,
        getAppointments,
        setAppointments,
    }

})();

// Initialize on load
initialize();

// event listeners 
document.getElementById('btn-half').addEventListener('click', () => {gridSelected = false; utils.selectList()} )
document.getElementById('btn-full').addEventListener('click', () => {gridSelected = true; utils.selectGrid()})
form.addEventListener('submit', formModule.handleForm);
doctor.addEventListener("change", formModule.updateAvailableSlots);
document.getElementById("date").addEventListener("change", formModule.updateAvailableSlots);
document.addEventListener('click', formModule.handleDoctorDropdownClick);
doctor.addEventListener('click', formModule.handleDoctorInputFieldClick);
document.getElementById('sort').addEventListener('change', utils.sortSetter);