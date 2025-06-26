// This service provides validation methods for form inputs.
const validationService = () => ({
  present(value, key) {
    let res = (value.trim() !== "");
    if (!res) {
      const errorElement = document.getElementById(`${key}-error`);
      if (errorElement) errorElement.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
    }
    return res;
  },

  emailFormat(value, key) {
    const res = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!res) {
      const errorElement = document.getElementById(`${key}-error`);
      if (errorElement) errorElement.textContent = `Invalid email format`;
    }
    return res;
  }
});

export { validationService };
