const form = document.getElementById('myForm');

const appointments = []

const handleForm = (event) => {
    event.preventDefault(); 

    const name = document.getElementById("name")
    const date = document.getElementById("date")
    const doctor = document.getElementById("doctor")
    const slot = document.getElementById("slot")
    const purpose = document.getElementById("purpose")
    
    let appointment = {
        name : name.value,
        date : date.value,
        doctor : doctor.value,
        slot : slot.value,
        purpose : purpose.value,
    }
    appointments.push(appointment)
    console.log(appointment)
}