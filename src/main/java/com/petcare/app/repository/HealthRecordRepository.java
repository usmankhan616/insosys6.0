package com.petcare.app.repository;

import com.petcare.app.model.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
    // This method allows the controller to fetch records for a specific pet
    List<HealthRecord> findByPetId(Long petId);
}