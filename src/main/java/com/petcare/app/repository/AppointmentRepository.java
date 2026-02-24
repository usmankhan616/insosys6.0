package com.petcare.app.repository;

import com.petcare.app.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Finds appointments for a doctor at a specific time that are NOT completed
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentTime = :time AND a.status != 'COMPLETED'")
    List<Appointment> findActiveAppointmentsBySlot(Long doctorId, LocalDateTime time);

    List<Appointment> findByDoctorIdAndStatus(Long doctorId, String status);
}