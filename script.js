const form = document.getElementById('myForm');
const appointments = [];

//handling form data
const handleForm = (event) => {
    event.preventDefault(); 

    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const doctor = document.getElementById("doctor").value;
    const slot = document.getElementById("slot").value;
    const purpose = document.getElementById("purpose").value;

    const appointment = {
        name,
        date,
        doctor,
        slot,
        purpose
    };
    if( name && date && doctor && slot && purpose){
        appointments.push(appointment);
        console.log(appointment);
        
        // Add to the table
        const table = document.querySelector(".appointment-list table");
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${appointment.name}</td>
        <td>${appointment.doctor}</td>
        <td>${appointment.date}</td>
        <td>${appointment.slot}</td>
        <td>
        <button class="edit">✏️</button>
        </td>
        <td>
        <button class="delete">❌</button>
        </td>
        `;
        table.appendChild(row);
        
        document.getElementById("myForm").reset();
        
        document.getElementById("total-appointments").textContent = appointments.length;
    }
    else{
        alert("please enter all the data")
    }
};
