import state from "./states.js";
import { setGrid } from "./storage.service.js";

// other utility services
const utilService = () => ({
  selectList() {
    console.log("selecting list");
    document.getElementById("appointment-cards").classList.add('full-width-view');
    document.getElementById("btn-full").style.backgroundColor = "#c5c4c4";
    document.getElementById("btn-half").style.backgroundColor = "white";
    setGrid("false");
},

selectGrid() {
    console.log("selecting grid");
    document.getElementById("btn-half").style.backgroundColor = "#c5c4c4";
    document.getElementById("btn-full").style.backgroundColor = "white";
    document.getElementById("appointment-cards").classList.remove('full-width-view');
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
