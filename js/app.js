import state from "./states.js";
import { loadData } from "./storage.service.js";
import { utilService } from "./logic.service.js";
import { formService } from "./form.manager.js";
import { reloadAppointmentList} from "./dom.service.js";
import { registerEvents } from "./events.js";

// registering 
registerEvents();

/**
 * Initialize the application.
*/
function initialize() {
    state.setAppointments(loadData("appointments") || []);
    state.setGrid(loadData("gridSelected") || false);
    const utils = utilService();
    const formModule = formService();
    formModule.setMinDateForInput("date");
    formModule.markRequiredFields();
    formModule.setDoctors();
    reloadAppointmentList();
    debugger
    console.log("isgridselected", state.isGridSelected);
    state.isGridSelected === "true" ? utils.selectGrid() : utils.selectList()
}
// Initialize on load
initialize();