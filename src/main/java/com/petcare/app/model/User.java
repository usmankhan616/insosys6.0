package com.petcare.app.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(unique = true)
    private String email;

    @Column(name = "is_available")
    private int isAvailable; // Use int for 0/1 database compatibility

    private String password;
    private String role;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Explicitly define the setter to resolve the "cannot find symbol" error
    public void setAvailable(int available) {
        this.isAvailable = available;
    }
}