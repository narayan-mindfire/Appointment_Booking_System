import { appointmentListContainer, appointmentTable, btnFull, btnHalf, appointmentCards} from "./dom.service.js";
import state from "./states.js";


// other utility services
const utilService = () => ({
    selectGrid() {
      appointmentCards.classList.remove("hidden");
      appointmentTable.classList.add("hidden");
      appointmentListContainer.classList.remove("hidden")
      btnHalf.style.backgroundColor = "#c5c4c4";
      btnFull.style.backgroundColor = "white";
      state.setGrid("true");
    },
    
    selectList() {
      appointmentCards.classList.add("hidden");
      appointmentTable.classList.remove("hidden");
      appointmentListContainer.classList.add("hidden")
      btnFull.style.backgroundColor = "#c5c4c4";
      btnHalf.style.backgroundColor = "white";
      state.setGrid("false");
    },


  sortSetter(event) {
    state.sortAppointmentsBy = event.target.value;
    console.log("Sorting by:", state.sortAppointmentsBy);
    import("./dom.service.js").then(mod => mod.reloadAppointmentList());
    state.setGrid("false");
  },

});

export { utilService};
