package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "blocked_slots")
@Data
public class BlockedSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String slotTime; // e.g., "10:00"

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;
}