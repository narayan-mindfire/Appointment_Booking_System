import state from "./states.js";
import { loadData, saveData } from "./storage.service.js";
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
    // first load must be grid in new device
    let initGridData = loadData("gridSelected") === "true" || loadData("gridSelected") === "false" ? loadData("gridSelected") : "true";
    state.setGrid(initGridData);
    const utils = utilService();
    const formModule = formService();
    formModule.setMinDateForInput("date");
    formModule.markRequiredFields();
    formModule.setDoctors();
    reloadAppointmentList();
    console.log("isgridselected", state.isGridSelected);
    state.isGridSelected == "true" ? utils.selectGrid() : utils.selectList()
}
// Initialize on load
initialize();