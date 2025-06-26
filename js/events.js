import { btnFull, btnHalf, dateEle, doctorEle, form, sortEle } from "./dom.service.js";
import state from "./states.js";
import { utilService } from "./logic.service.js";
import { formService } from "./form.manager.js";


const utils = utilService();
const formModule = formService();

/**
 * all application events are registered here
 */
function registerEvents() {
  btnFull.addEventListener("click", () => {
    state.isGridSelected = false;
    utils.selectList();
  });

  btnHalf.addEventListener("click", () => {
    state.isGridSelected = true;
    utils.selectGrid();
  });

  form.addEventListener("submit", formModule.handleForm);
  doctorEle.addEventListener("change", formModule.updateAvailableSlots);
  dateEle.addEventListener("change", formModule.updateAvailableSlots);
  document.addEventListener("click", formModule.handleDoctorDropdownClick);
  doctorEle.addEventListener("click", formModule.handleDoctorInputFieldClick);
  sortEle.addEventListener("change", utils.sortSetter);
}

export { registerEvents };
