document.addEventListener("DOMContentLoaded", function () {

    const navItems = document.querySelectorAll(".nav-links li");
    const pages = document.querySelectorAll(".page");

    navItems.forEach(item => {
        item.addEventListener("click", function () {
            navItems.forEach(nav => nav.classList.remove("active"));
            pages.forEach(page => page.classList.remove("active-page"));

            this.classList.add("active");
            const sectionId = this.getAttribute("data-section");
            document.getElementById(sectionId).classList.add("active-page");
        });
    });

    const form = document.getElementById("jobForm");
    const applicationTable = document.getElementById("applicationTable");
    const interviewTable = document.getElementById("interviewTable");
    const offerTable = document.getElementById("offerTable");

    const totalApplied = document.getElementById("totalApplied");
    const totalInterviews = document.getElementById("totalInterviews");
    const totalOffers = document.getElementById("totalOffers");
    const totalRejected = document.getElementById("totalRejected");

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    const darkModeBtn = document.getElementById("darkModeBtn");
    const clearBtn = document.getElementById("clearBtn");

    let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    let editIndex = -1;

    let statusChart = null;
    let barChart = null;

    function saveJobs() {
        localStorage.setItem("jobs", JSON.stringify(jobs));
    }

    function renderJobs() {

        applicationTable.innerHTML = "";
        interviewTable.innerHTML = "";
        offerTable.innerHTML = "";

        let applied = 0;
        let interviews = 0;
        let offers = 0;
        let rejected = 0;

        const searchText = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        jobs.forEach((job, index) => {

            if (
                job.company.toLowerCase().includes(searchText) &&
                (selectedStatus === "All" || job.status === selectedStatus)
            ) {

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${job.company}</td>
                    <td>${job.role}</td>
                    <td>${job.location}</td>
                    <td>${job.date}</td>
                    <td>${job.status}</td>
                    <td>
                        <button onclick="editJob(${index})">Edit</button>
                        <button onclick="deleteJob(${index})">Delete</button>
                    </td>
                `;
                applicationTable.appendChild(row);
            }

            applied++;

            if (job.status === "Interview") {
                interviews++;
                interviewTable.innerHTML += `
                    <tr>
                        <td>${job.company}</td>
                        <td>${job.role}</td>
                        <td>${job.date}</td>
                        <td>${job.notes}</td>
                    </tr>
                `;
            }

            if (job.status === "Offer") {
                offers++;
                offerTable.innerHTML += `
                    <tr>
                        <td>${job.company}</td>
                        <td>${job.role}</td>
                        <td>${job.date}</td>
                    </tr>
                `;
            }

            if (job.status === "Rejected") {
                rejected++;
            }
        });

        totalApplied.textContent = applied;
        totalInterviews.textContent = interviews;
        totalOffers.textContent = offers;
        totalRejected.textContent = rejected;

        updateCharts(applied, interviews, offers, rejected);
    }

    window.deleteJob = function (index) {
        if (confirm("Are you sure you want to delete this application?")) {
            jobs.splice(index, 1);
            saveJobs();
            renderJobs();
        }
    };

    window.editJob = function (index) {

        const job = jobs[index];

        document.getElementById("company").value = job.company;
        document.getElementById("role").value = job.role;
        document.getElementById("location").value = job.location;
        document.getElementById("date").value = job.date;
        document.getElementById("status").value = job.status;
        document.getElementById("notes").value = job.notes;

        editIndex = index;

        document.querySelector("#jobForm button").textContent = "Update Application";
    };

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const newJob = {
            company: document.getElementById("company").value,
            role: document.getElementById("role").value,
            location: document.getElementById("location").value,
            date: document.getElementById("date").value,
            status: document.getElementById("status").value,
            notes: document.getElementById("notes").value
        };

        if (editIndex === -1) {
            jobs.push(newJob);
        } else {
            jobs[editIndex] = newJob;
            editIndex = -1;
            document.querySelector("#jobForm button").textContent = "Add Application";
        }

        saveJobs();
        renderJobs();
        form.reset();
    });

    searchInput.addEventListener("input", renderJobs);
    statusFilter.addEventListener("change", renderJobs);

    darkModeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    clearBtn.addEventListener("click", function () {
        if (confirm("This will delete ALL data. Continue?")) {
            localStorage.removeItem("jobs");
            jobs = [];
            renderJobs();
        }
    });

    function updateCharts(applied, interviews, offers, rejected) {

        const ctx1 = document.getElementById("statusChart").getContext("2d");
        const ctx2 = document.getElementById("barChart").getContext("2d");

        if (statusChart) statusChart.destroy();
        if (barChart) barChart.destroy();

        statusChart = new Chart(ctx1, {
            type: "pie",
            data: {
                labels: ["Applied", "Interview", "Offer", "Rejected"],
                datasets: [{
                    data: [applied, interviews, offers, rejected],
                    backgroundColor: ["#007bff", "#ff9800", "#28a745", "#dc3545"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        barChart = new Chart(ctx2, {
            type: "bar",
            data: {
                labels: ["Applied", "Interview", "Offer", "Rejected"],
                datasets: [{
                    label: "Applications Count",
                    data: [applied, interviews, offers, rejected],
                    backgroundColor: ["#007bff", "#ff9800", "#28a745", "#dc3545"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderJobs();

});