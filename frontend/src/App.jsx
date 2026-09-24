import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  // Reschedule states
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Get patients, doctors and appointments
  useEffect(() => {
    fetch("https://healthcare-appointment-system-vxr9.onrender.com/api/patients/")
      .then((response) => response.json())
      .then((data) => {
        setPatients(data);
      })
      .catch((error) => {
        console.error("Patient Error:", error);
      });

    fetch("https://healthcare-appointment-system-vxr9.onrender.com/api/doctors/")
      .then((response) => response.json())
      .then((data) => {
        setDoctors(data);
      })
      .catch((error) => {
        console.error("Doctor Error:", error);
      });

    fetch("https://healthcare-appointment-system-vxr9.onrender.com/api/appointments/")
      .then((response) => response.json())
      .then((data) => {
        setAppointments(data);
      })
      .catch((error) => {
        console.error("Appointment Error:", error);
      });
  }, []);

  // Book appointment
  const handleBookAppointment = () => {
    if (
      !selectedPatient ||
      !selectedDoctor ||
      !appointmentDate ||
      !appointmentTime
    ) {
      alert("Please fill all appointment details.");
      return;
    }

    const appointmentData = {
      patient: Number(selectedPatient),
      doctor: Number(selectedDoctor),
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: "Scheduled",
    };

    fetch("https://healthcare-appointment-system-vxr9.onrender.com/api/appointments/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(JSON.stringify(error));
          });
        }

        return response.json();
      })
      .then((data) => {
        alert("Appointment booked successfully!");

        setAppointments((previousAppointments) => [
          ...previousAppointments,
          data,
        ]);

        setSelectedPatient("");
        setSelectedDoctor("");
        setAppointmentDate("");
        setAppointmentTime("");

        setShowForm(false);
      })
      .catch((error) => {
        console.error("Booking Error:", error);
        alert("Failed to book appointment.");
      });
  };

  // Cancel appointment
  const handleCancelAppointment = (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) {
      return;
    }

    fetch(
      `https://healthcare-appointment-system-vxr9.onrender.com/api/appointments/${appointmentId}/cancel/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(JSON.stringify(error));
          });
        }

        return response.json();
      })
      .then((updatedAppointment) => {
        alert("Appointment cancelled successfully!");

        setAppointments((previousAppointments) =>
          previousAppointments.map((appointment) =>
            appointment.id === updatedAppointment.id
              ? updatedAppointment
              : appointment
          )
        );
      })
      .catch((error) => {
        console.error("Cancel Error:", error);
        alert("Failed to cancel appointment.");
      });
  };

  // Open reschedule form
  const handleOpenReschedule = (appointment) => {
    setRescheduleId(appointment.id);
    setRescheduleDate(appointment.appointment_date);
    setRescheduleTime(appointment.appointment_time);
  };

  // Reschedule appointment
  const handleRescheduleAppointment = () => {
    if (!rescheduleDate || !rescheduleTime) {
      alert("Please select date and time.");
      return;
    }

    fetch(
      `https://healthcare-appointment-system-vxr9.onrender.com/api/appointments/${rescheduleId}/reschedule/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment_date: rescheduleDate,
          appointment_time: rescheduleTime,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(JSON.stringify(error));
          });
        }

        return response.json();
      })
      .then((updatedAppointment) => {
        alert("Appointment rescheduled successfully!");

        setAppointments((previousAppointments) =>
          previousAppointments.map((appointment) =>
            appointment.id === updatedAppointment.id
              ? updatedAppointment
              : appointment
          )
        );

        setRescheduleId(null);
        setRescheduleDate("");
        setRescheduleTime("");
      })
      .catch((error) => {
        console.error("Reschedule Error:", error);
        alert("Failed to reschedule appointment.");
      });
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h2>HealthCare</h2>

        <div>
          <button>Home</button>
          <button>Doctors</button>
          <button>Patients</button>
          <button>Appointments</button>
        </div>
      </nav>

      {/* Heading */}
      <h1>Healthcare Appointment System</h1>

      <p className="welcome">
        Welcome to our Healthcare Appointment System
      </p>

      {/* Book Appointment Button */}
      <button onClick={() => setShowForm(true)}>
        Book Appointment
      </button>

      {/* Book Appointment Form */}
      {showForm && (
        <div className="section">

          <h2>Book an Appointment</h2>

          <label>Patient</label>

          <select
            value={selectedPatient}
            onChange={(e) =>
              setSelectedPatient(e.target.value)
            }
          >
            <option value="">
              Select Patient
            </option>

            {patients.map((patient) => (
              <option
                key={patient.id}
                value={patient.id}
              >
                {patient.name}
              </option>
            ))}
          </select>

          <br />
          <br />

          <label>Doctor</label>

          <select
            value={selectedDoctor}
            onChange={(e) =>
              setSelectedDoctor(e.target.value)
            }
          >
            <option value="">
              Select Doctor
            </option>

            {doctors.map((doctor) => (
              <option
                key={doctor.id}
                value={doctor.id}
              >
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>

          <br />
          <br />

          <label>Date</label>

          <input
            type="date"
            value={appointmentDate}
            onChange={(e) =>
              setAppointmentDate(e.target.value)
            }
          />

          <br />
          <br />

          <label>Time</label>

          <input
            type="time"
            value={appointmentTime}
            onChange={(e) =>
              setAppointmentTime(e.target.value)
            }
          />

          <br />
          <br />

          <button onClick={handleBookAppointment}>
            Book Appointment
          </button>

          <button
            onClick={() => setShowForm(false)}
          >
            Close
          </button>

        </div>
      )}

      {/* Doctors */}
      <div className="section">

        <h2>Our Doctors</h2>

        {doctors.length === 0 ? (
          <p>No doctors found.</p>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id}>

              <p className="doctor-name">
                {doctor.name}
              </p>

              <p className="doctor-specialization">
                {doctor.specialization}
              </p>

              <p>
                Email: {doctor.email}
              </p>

              <p>
                Phone: {doctor.phone}
              </p>

            </div>
          ))
        )}

      </div>

      {/* Patients */}
      <div className="section">

        <h2>Our Patients</h2>

        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          patients.map((patient) => (
            <div key={patient.id}>

              <p>
                <strong>
                  {patient.name}
                </strong>
              </p>

              <p>
                Email: {patient.email}
              </p>

              <p>
                Phone: {patient.phone}
              </p>

            </div>
          ))
        )}

      </div>

      {/* Appointments */}
      <div className="section">

        <h2>Appointments</h2>

        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          appointments.map((appointment) => (

            <div
              key={appointment.id}
              className="appointment-card"
            >

              <p>
                <strong>Patient:</strong>{" "}
                {appointment.patient_name}
              </p>

              <p>
                <strong>Doctor:</strong>{" "}
                {appointment.doctor_name}
              </p>

              <p>
                <strong>Specialization:</strong>{" "}
                {appointment.doctor_specialization}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {appointment.appointment_date}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {appointment.appointment_time}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="status-badge">
                  {appointment.status}
                </span>
              </p>

              {/* Reschedule Form */}
              {rescheduleId === appointment.id && (
                <div className="section">

                  <h3>Reschedule Appointment</h3>

                  <label>New Date</label>

                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) =>
                      setRescheduleDate(e.target.value)
                    }
                  />

                  <br />
                  <br />

                  <label>New Time</label>

                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) =>
                      setRescheduleTime(e.target.value)
                    }
                  />

                  <br />
                  <br />

                  <button
                    onClick={
                      handleRescheduleAppointment
                    }
                  >
                    Save Reschedule
                  </button>

                  <button
                    onClick={() => {
                      setRescheduleId(null);
                      setRescheduleDate("");
                      setRescheduleTime("");
                    }}
                  >
                    Close
                  </button>

                </div>
              )}

              {/* Appointment Buttons */}
              {appointment.status !== "Cancelled" && (
                <>
                  <button
                    onClick={() =>
                      handleOpenReschedule(appointment)
                    }
                  >
                    Reschedule Appointment
                  </button>

                  <button
                    onClick={() =>
                      handleCancelAppointment(
                        appointment.id
                      )
                    }
                  >
                    Cancel Appointment
                  </button>
                </>
              )}

              {/* Cancelled Message */}
              {appointment.status === "Cancelled" && (
                <p>
                  <strong>
                    This appointment has been cancelled.
                  </strong>
                </p>
              )}

            </div>

          ))
        )}

      </div>

      {/* Footer */}
      <footer>

        <p>
          © 2026 Healthcare Appointment System
        </p>

        <p>
          All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default App;