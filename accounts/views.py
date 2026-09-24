from datetime import date, datetime

from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Patient, Doctor, Appointment
from .serializers import (
    PatientSerializer,
    DoctorSerializer,
    AppointmentSerializer
)


# Test API
@api_view(['GET'])
def test_api(request):
    return Response({
        "message": "Healthcare Appointment API is working!"
    })


# Get all patients
@api_view(['GET'])
def patient_list(request):
    patients = Patient.objects.all()
    serializer = PatientSerializer(patients, many=True)

    return Response(serializer.data)


# Get all doctors
@api_view(['GET'])
def doctor_list(request):
    doctors = Doctor.objects.all()
    serializer = DoctorSerializer(doctors, many=True)

    return Response(serializer.data)


# Get all appointments
@api_view(['GET'])
def appointment_list(request):
    appointments = Appointment.objects.all()
    serializer = AppointmentSerializer(
        appointments,
        many=True
    )

    return Response(serializer.data)


# Create appointment
@api_view(['POST'])
def create_appointment(request):

    doctor = request.data.get("doctor")
    appointment_date = request.data.get("appointment_date")
    appointment_time = request.data.get("appointment_time")

    # Check date format
    try:
        selected_date = date.fromisoformat(
            appointment_date
        )
    except (TypeError, ValueError):
        return Response(
            {
                "error": "Please enter a valid appointment date."
            },
            status=400
        )

    # Prevent past date
    if selected_date < date.today():
        return Response(
            {
                "error": "You cannot book an appointment for a past date."
            },
            status=400
        )

    # Prevent past time if appointment is today
    if selected_date == date.today():

        try:
            selected_time = datetime.strptime(
                appointment_time,
                "%H:%M"
            ).time()
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Please enter a valid appointment time."
                },
                status=400
            )

        current_time = datetime.now().time()

        if selected_time <= current_time:
            return Response(
                {
                    "error": "You cannot book an appointment for a past time."
                },
                status=400
            )

    # Prevent duplicate appointment
    existing_appointment = Appointment.objects.filter(
        doctor=doctor,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status="Scheduled"
    ).exists()

    if existing_appointment:
        return Response(
            {
                "error": "This doctor is already booked for this date and time."
            },
            status=400
        )

    serializer = AppointmentSerializer(
        data=request.data
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )


# Cancel appointment
@api_view(['PATCH'])
def cancel_appointment(request, appointment_id):

    try:
        appointment = Appointment.objects.get(
            id=appointment_id
        )

    except Appointment.DoesNotExist:
        return Response(
            {
                "error": "Appointment not found"
            },
            status=404
        )

    appointment.status = "Cancelled"
    appointment.save()

    serializer = AppointmentSerializer(
        appointment
    )

    return Response(serializer.data)


# Reschedule appointment
@api_view(['PATCH'])
def reschedule_appointment(request, appointment_id):

    try:
        appointment = Appointment.objects.get(
            id=appointment_id
        )

    except Appointment.DoesNotExist:
        return Response(
            {
                "error": "Appointment not found"
            },
            status=404
        )

    appointment_date = request.data.get(
        "appointment_date"
    )

    appointment_time = request.data.get(
        "appointment_time"
    )

    if not appointment_date or not appointment_time:
        return Response(
            {
                "error": "Date and time are required"
            },
            status=400
        )

    # Check date format
    try:
        selected_date = date.fromisoformat(
            appointment_date
        )
    except ValueError:
        return Response(
            {
                "error": "Please enter a valid appointment date."
            },
            status=400
        )

    # Prevent past date
    if selected_date < date.today():
        return Response(
            {
                "error": "You cannot reschedule to a past date."
            },
            status=400
        )

    # Prevent past time if rescheduling to today
    if selected_date == date.today():

        try:
            selected_time = datetime.strptime(
                appointment_time,
                "%H:%M"
            ).time()
        except ValueError:
            return Response(
                {
                    "error": "Please enter a valid appointment time."
                },
                status=400
            )

        current_time = datetime.now().time()

        if selected_time <= current_time:
            return Response(
                {
                    "error": "You cannot reschedule to a past time."
                },
                status=400
            )

    # Prevent duplicate appointment
    existing_appointment = Appointment.objects.filter(
        doctor=appointment.doctor,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status="Scheduled"
    ).exclude(
        id=appointment.id
    ).exists()

    if existing_appointment:
        return Response(
            {
                "error": "This doctor is already booked for this date and time."
            },
            status=400
        )

    appointment.appointment_date = appointment_date
    appointment.appointment_time = appointment_time
    appointment.status = "Scheduled"

    appointment.save()

    serializer = AppointmentSerializer(
        appointment
    )

    return Response(serializer.data)