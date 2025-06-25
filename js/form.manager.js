import { validationConfig, docs, slots } from "./constants.js";
import state from "./states.js";
import { setAppointments, getAppointments} from "./storage.service.js";
import {addAppointmentCard, updateAppointmentCount, doctorEle, form, dateEle, slotEle, emailEle, docList, nameEle, purposeEle, slotOptionsEle, appointmentCards, showToast} from "./dom.service.js";
import { validationService } from "./validation.service.js";

const validators = validationService();

const formService = (function(){
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
            if (validationConfig[field].includes("present")) {
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
        if (!doctor.contains(event.target)) {
            docList.style.display = "none";
        }
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
     * Handles the toggling of search results for doctors 
     */
    function handleDoctorInputFieldClick(){
        if(!doctorSelectedRecently) {
            docList.style.display = "block"   
        }
    }
    
    /**
     * Handles form submission, including validation, creating and updating appointments.
     * @param {Event} event 
     */
    function handleForm(event) {
        if(state.dontSubmit === true) return;
        event.preventDefault();

        const fields = _getFormFields();
        _resetErrorMessages();

        let isValid = true;

        for (let key in fields) {
            const validations = validationConfig[key] || [];
            for (let validation of validations) {
                const validatorFn = validators[validation];
                console.log()
                if (validatorFn && !validatorFn(fields[key], key)) {
                    isValid = false;
                    break;
                }
            }
        }

        if (!isValid){
            showToast("Please input correct data and try again", "error")
            return;
        }

        let appointments = getAppointments();

        if (state.editingAppointmentId) {
            const index = appointments.findIndex(app => app.id === state.editingAppointmentId);
            if (index !== -1) {
                appointments[index] = { id: state.editingAppointmentId, ...fields };
                state.editingAppointmentId = null;
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
        showToast("Appointment successfully booked!", "success");
    }

    
    /**
     * Returns form field values as an object.
     */
    function _getFormFields() {
        return {
            name: nameEle.value,
            email: emailEle.value,
            date: dateEle.value,
            doctor: doctorEle.value,
            slot: slotEle.value,
            purpose: purposeEle.value
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
        const date = dateEle.value;
        const doctorVal = doctor.value;
        const slotInput = slotEle;
        slotOptionsEle.innerHTML = ""; 
        slotOptionsEle.classList.remove("hidden");

        if (!date || !doctorVal) return;
    
        const appointments = getAppointments();
        const bookedSlots = appointments
            .filter(appointment => appointment.date === date && appointment.doctor === doctorVal && appointment.id !== state.editingAppointmentId)
            .map(appointment => appointment.slot);
    
        slots.forEach(slot => {
            const button = document.createElement("button");
            button.className = "slot-button";
            button.textContent = slot;
            const today = new Date();
            const selectedDate = new Date(date);
            const isToday = today.toDateString() === selectedDate.toDateString();

            button.disabled = bookedSlots.includes(slot) || (isToday && !_isSlotAvailable(slot));
            
            if (!button.disabled) {
                button.addEventListener("click", () => {
                    slotInput.value = slot;
                    slotOptionsEle.classList.add("hidden");
                });
            }
            slotOptionsEle.appendChild(button);
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
        _renderDoctorOptions(docs);
    
        doctor.addEventListener("input", function () {
            const filteredDocs = docs.filter(doc =>
                doc.toLowerCase().includes(this.value.toLowerCase())
            );
            docList.style.display = "block"
            _renderDoctorOptions(filteredDocs);
        });
    
        docList.addEventListener("click", function (event) {
            event.stopPropagation()
            if (event.target.classList.contains("doctor-option")) {
                doctor.value = event.target.textContent;
                updateAvailableSlots();
                docList.style.display = "none";
                doctorSelectedRecently = true;
            }
        });
    }
    
    /**
     * Renders a list of doctor options.
     * @param {string[]} list 
     */
    function _renderDoctorOptions(list) {
        docList.innerHTML = "";
        list.forEach(doc => {
            const div = document.createElement("div");
            div.textContent = doc;
            div.className = "doctor-option";
            div.style.borderBottom = "1px solid black";
            docList.appendChild(div);
        });
    }

    function handleSlot() {
        const date = dateEle.value;
        const doctor = doctorEle.value;
        if (date && doctor) {
            updateAvailableSlots();
        } else {
            showToast("Please select doctor and date first.", "warning");
        }
    }

    return {
        setMinDateForInput,
        markRequiredFields,
        handleDoctorDropdownClick,
        handleDoctorInputFieldClick,
        updateAvailableSlots,
        handleForm,
        setDoctors,
        handleSlot
    }
})

export {formService};
