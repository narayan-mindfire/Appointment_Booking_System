import state from "./states.js";
import { getGrid } from "./storage.service.js";
import { utilService } from "./logic.service.js";
import { formService } from "./form.manager.js";
import { reloadAppointmentList} from "./dom.service.js";
import { registerEvents } from "./events.js";

// registering 
registerEvents();
const utils = utilService();
const formModule = formService();

/**
 * Initialize the application.
 */
function initialize() {
    state.dontSubmit = false;
    formModule.setMinDateForInput("date");
    formModule.markRequiredFields();
    formModule.setDoctors();
    reloadAppointmentList();
    state.isGridSelected = getGrid();
    state.isGridSelected === true ? utils.selectGrid() : utils.selectList()
}
// Initialize on load
initialize();