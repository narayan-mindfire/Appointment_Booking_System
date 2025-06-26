import { VALIDATION_CONFIG, DOCS } from "./constants.js";
import state from "./states.js";
import { setAppointments, getAppointments} from "./storage.service.js";
import {reloadAppointmentList, doctorEle, form, dateEle, slotEle, emailEle, docList, nameEle, purposeEle, slotOptionsEle, showToast, updateAvailableSlots} from "./dom.service.js";
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
        Object.keys(VALIDATION_CONFIG).forEach(field => {
            if (VALIDATION_CONFIG[field].includes("present")) {
                const label = document.getElementById(`required-${field}`);
                if (label) label.textContent = '*';
            }
        });
    }
    
    /**
     * Handles doctor dropdown toggle visibility.
     */
    function handleDoctorDropdownClick(event) {
        // doctorSelectedRecently = false;
        if (!doctorEle.contains(event.target)) {
            docList.style.display = "none";
        }
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
        event.preventDefault();

        const fields = _getFormFields();
        _resetErrorMessages();

        let isValid = true;

        for (let key in fields) {
            const validations = VALIDATION_CONFIG[key] || [];
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
                console.log(fields)
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
        console.log("get form fields called")
        console.log(doctorEle.value)
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
    
    // /**
    //  * Populates available time slots based on selected date and doctor.
    //  */
    // function updateAvailableSlots() {
    //     const date = dateEle.value;
    //     const doctorVal = doctorEle.value;

    //     slotEle.innerHTML = `<option value="">Select a time slot</option>`;

    //     if (!date || !doctorVal) return;

    //     const appointments = getAppointments();
    //     const bookedSlots = appointments
    //         .filter(appointment => appointment.date === date && appointment.doctor === doctorVal && appointment.id !== state.editingAppointmentId)
    //         .map(appointment => appointment.slot);

    //     const today = new Date();
    //     const selectedDate = new Date(date);
    //     const isToday = today.toDateString() === selectedDate.toDateString();

    //     slots.forEach(slot => {
    //         const slotHour = Number(slot.split(":")[0]);
    //         const isDisabled = bookedSlots.includes(slot) || (isToday && slotHour <= today.getHours());

    //         if (!isDisabled) {
    //             const option = document.createElement("option");
    //             option.value = slot;
    //             option.textContent = slot;
    //             slotEle.appendChild(option);
    //         }
    //     });
    // }

    function handleOutsideClick(e){
        doctorSelectedRecently = true;
        if (!slotEle.contains(e.target) && !slotOptionsEle.contains(e.target)) {
            slotOptionsEle.classList.add("hidden");
        }
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
        _renderDoctorOptions(DOCS);
    
        doctor.addEventListener("input", function () {
            const filteredDocs = docs.filter(doc =>
                doc.toLowerCase().includes(this.value.toLowerCase())
            );
            docList.style.display = "block"
            _renderDoctorOptions(filteredDocs);
        });
    
        docList.addEventListener("click", function (event) {
            debugger
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

    return {
        setMinDateForInput,
        markRequiredFields,
        handleDoctorDropdownClick,
        handleDoctorInputFieldClick,
        handleForm,
        setDoctors,
        handleOutsideClick
    }
})

export {formService};
