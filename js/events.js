import { btnFull, btnHalf, dateEle, doctorEle, form, slotEle, slotOptionsEle, sortEle } from "./dom.service.js";
import state from "./states.js";
import { utilService } from "./logic.service.js";
import { formService } from "./form.manager.js";


const utils = utilService();
const formModule = formService();

// all the events in app
function registerEvents() {
  btnFull.addEventListener("click", () => {
    state.gridSelected = false;
    utils.selectList();
  });

  btnHalf.addEventListener("click", () => {
    state.gridSelected = false;
    utils.selectGrid();
  });

  form.addEventListener("submit", formModule.handleForm);
  doctorEle.addEventListener("change", formModule.updateAvailableSlots);
  dateEle.addEventListener("change", formModule.updateAvailableSlots);
  document.addEventListener("click", formModule.handleDoctorDropdownClick);
  doctorEle.addEventListener("click", formModule.handleDoctorInputFieldClick);
  sortEle.addEventListener("change", utils.sortSetter);
  slotEle.addEventListener("click", formModule.handleSlot);
  document.addEventListener("click", (e) => {
    if (!slotEle.contains(e.target) && !slotOptionsEle.contains(e.target)) {
      slotOptionsEle.classList.add("hidden");
    }
  });
}

export { registerEvents };
