from django.urls import path

from .views import (
    test_api,
    patient_list,
    doctor_list,
    appointment_list,
    create_appointment,
    cancel_appointment,
    reschedule_appointment,
)


urlpatterns = [
    path('test/', test_api),

    path('patients/', patient_list),

    path('doctors/', doctor_list),

    path('appointments/', appointment_list),

    path(
        'appointments/create/',
        create_appointment
    ),

    path(
        'appointments/<int:appointment_id>/cancel/',
        cancel_appointment
    ),

    path(
        'appointments/<int:appointment_id>/reschedule/',
        reschedule_appointment
    ),
]