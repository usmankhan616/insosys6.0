package com.petcare.app.repository;

import com.petcare.app.model.BlockedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface BlockedSlotRepository extends JpaRepository<BlockedSlot, Long> {
    List<BlockedSlot> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    void deleteByDoctorIdAndDateAndSlotTime(Long doctorId, LocalDate date, String slotTime);
}