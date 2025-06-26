import { appointmentListContainer, btnFull, btnHalf } from "./dom.service.js";
import state from "./states.js";


// other utility services
const utilService = () => ({
  selectList() {
      // appointmentCards.classList.add('full-width-view');
      appointmentListContainer.classList.add('hidden');
      btnFull.style.backgroundColor = "#c5c4c4";
      btnHalf.style.backgroundColor = "white";
      state.setGrid("false");
  },

selectGrid() {
    btnHalf.style.backgroundColor = "#c5c4c4";
    btnFull.style.backgroundColor = "white";
    appointmentListContainer.classList.remove('hidden');
    state.setGrid("true");
  },

  sortSetter(event) {
    state.sortAppointmentsBy = event.target.value;
    console.log("Sorting by:", state.sortAppointmentsBy);
    import("./dom.service.js").then(mod => mod.reloadAppointmentList());
    state.setGrid("false");
  },

});

export { utilService};
