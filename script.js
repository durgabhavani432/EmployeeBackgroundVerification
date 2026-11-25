
// 1. Get saved data from localStorage

let users = JSON.parse(localStorage.getItem("users")) || [];

let employees = JSON.parse(localStorage.getItem("employees")) || [];

let currentUser = null;


// 2. Select HTML elements

const registerSection = document.getElementById("registerSection");
const loginSection = document.getElementById("loginSection");
const systemSection = document.getElementById("systemSection");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const employeeForm = document.getElementById("employeeForm");

const tableBody = document.querySelector("#employeeTable tbody");


// 3. Show Login Page

function showLogin() {
    registerSection.style.display = "none";
    loginSection.style.display = "block";
    systemSection.style.display = "none";
}


// 4. Show Registration Page

function showRegister() {
    registerSection.style.display = "block";
    loginSection.style.display = "none";
    systemSection.style.display = "none";
}


// 5. Logout

function logout() {
    currentUser = null;
    showLogin();
}


// 6. User Registration

registerForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("regName").value.trim();

    const email = document.getElementById("regEmail").value.trim().toLowerCase();

    const password = document.getElementById("regPassword").value;

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        alert("Email already registered!");
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful!");

    registerForm.reset();

    showLogin();

});


// 7. User Login

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const user = users.find(
        user => user.email === email && user.password === password
    );

    if (user) {

        currentUser = user;

        loginSection.style.display = "none";
        registerSection.style.display = "none";
        systemSection.style.display = "block";

        renderEmployees();

        loginForm.reset();

        alert("Login successful!");

    } else {

        alert("Invalid email or password!");

    }

});


// 8. Add Employee

employeeForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    const employee = {

        id: Date.now(),

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        position: document.getElementById("position").value.trim(),

        company: document.getElementById("company").value.trim(),

        education: document.getElementById("education").value.trim(),

        status: "Pending"

    };

    employees.push(employee);

    // Save employee records

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );

    renderEmployees();

    employeeForm.reset();

    alert("Employee added successfully!");

});


// 9. Display Employees

function renderEmployees() {

    tableBody.innerHTML = "";

    employees.forEach(function(employee) {

        const row = document.createElement("tr");

        const values = [
            employee.id,
            "👤",
            employee.name,
            employee.email
        ];

        values.forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className = "badge " + employee.status;

        statusBadge.textContent = employee.status;

        statusCell.appendChild(statusBadge);

        row.appendChild(statusCell);


        // Action buttons

        const actionCell = document.createElement("td");

        const actions = [
            { text: "Verify", status: "Verified", className: "verify" },
            { text: "Fail", status: "Failed", className: "fail" },
            { text: "Delete", status: "Delete", className: "delete" }
        ];

        actions.forEach(function(action) {

            const button = document.createElement("button");

            button.textContent = action.text;

            button.className = "action " + action.className;

            button.addEventListener("click", function() {

                if (action.status === "Delete") {
                    deleteEmployee(employee.id);
                } else {
                    updateStatus(employee.id, action.status);
                }

            });

            actionCell.appendChild(button);

        });

        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}


// 10. Update Employee Status

function updateStatus(id, status) {

    const employee = employees.find(function(emp) {
        return emp.id === id;
    });

    if (employee) {

        employee.status = status;

        localStorage.setItem(
            "employees",
            JSON.stringify(employees)
        );

        renderEmployees();

    }

}


// 11. Delete Employee

function deleteEmployee(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
        return;
    }

    employees = employees.filter(function(employee) {
        return employee.id !== id;
    });

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );

    renderEmployees();

    alert("Employee deleted successfully!");

}
