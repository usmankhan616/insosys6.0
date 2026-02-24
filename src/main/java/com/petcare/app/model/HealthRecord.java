package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
@Data // Generates getters and setters
public class HealthRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String details; // Must be exactly 'details'
    private String recordType; // e.g., "PRESCRIPTION"
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "pet_id")
    private Pet pet;
}