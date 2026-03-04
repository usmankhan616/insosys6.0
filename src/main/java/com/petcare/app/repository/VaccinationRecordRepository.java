package com.petcare.app.repository;

import com.petcare.app.model.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {
    List<VaccinationRecord> findByPetId(Long petId);
    List<VaccinationRecord> findByPetOwnerId(Long ownerId);
}
