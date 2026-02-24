package com.petcare.app.repository;

import com.petcare.app.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    // This allows PetService to find pets by owner ID
    List<Pet> findByOwnerId(Long ownerId);

    // Also ensures HealthRecordController can find pets by name
    java.util.Optional<Pet> findByName(String name);
}