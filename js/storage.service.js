/**
 * Get appointments from localStorage.
 * @returns {Object[]} appointments
 */
function getAppointments() {
    const data = localStorage.getItem("appointments");
    return data ? JSON.parse(data) : [];
}

/**
 * Saves appointments to localStorage.
 * @param {Object[]} appointments 
 */
function setAppointments(appointments) {
    localStorage.setItem("appointments", JSON.stringify(appointments));
}

/**
 * gets saved grid data
 * @returns 
 */
function getGrid() {
  const data = localStorage.getItem("state.gridSelected");
  return data ? JSON.parse(data) : false;
}

/**
 * sets grid data in local storages
 * @param {boolean} value 
 */
function setGrid(value){
    console.log("setting grid to : ", value)
    localStorage.setItem("state.gridSelected", value);
}

export {setAppointments, getAppointments, getGrid, setGrid}