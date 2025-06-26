import { saveData } from "./storage.service.js";

//global app state variables
const state = {
    editingAppointmentId : null,
    sortAppointmentsBy : null,
    isGridSelected : false,
    appointments: [],
    setAppointments(appointments){
        this.appointments = appointments;
        saveData("appointments", appointments);
    },  
    setGrid(isGrid){
        console.log("Set Grid called with value: ", isGrid);
        this.isGridSelected = isGrid;
        saveData("gridSelected", isGrid);
    }
}

export  default state;