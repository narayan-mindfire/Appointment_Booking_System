/**
 * Get data from localStorage.
 */
function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Saves data to localStorage.
 */
function saveData(key, data) {
    console.log("setting data for key: ", key, " with data: ", data);
    localStorage.setItem(key, JSON.stringify(data));
}

export { saveData, loadData }