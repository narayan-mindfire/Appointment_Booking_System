import { appointmentCards, btnFull, btnHalf } from "./dom.service.js";
import state from "./states.js";
import { setGrid } from "./storage.service.js";

// other utility services
const utilService = () => ({
  selectList() {
      appointmentCards.classList.add('full-width-view');
      btnFull.style.backgroundColor = "#c5c4c4";
      btnHalf.style.backgroundColor = "white";
      setGrid("false");
  },

selectGrid() {
    btnHalf.style.backgroundColor = "#c5c4c4";
    btnFull.style.backgroundColor = "white";
    appointmentCards.classList.remove('full-width-view');
    setGrid("true");
  },

  sortSetter(event) {
    state.sortAppointmentsBy = event.target.value;
    console.log("Sorting by:", state.sortAppointmentsBy);
    import("./dom.service.js").then(mod => mod.reloadAppointmentList());
    setGrid("false");
  },

});

export { utilService};
