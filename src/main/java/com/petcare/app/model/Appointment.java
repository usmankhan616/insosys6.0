package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime appointmentTime;
    private String type;
    private String status;
    private String rejectionReason;

    @Column(length = 500)
    private String meetingLink;

    @ManyToOne(fetch = FetchType.EAGER) // Added Eager fetching to prevent null data
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @ManyToOne(fetch = FetchType.EAGER) // Added Eager fetching to prevent null data
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne(fetch = FetchType.EAGER) // Added Eager fetching to prevent null data
    @JoinColumn(name = "pet_id")
    private Pet pet;
}