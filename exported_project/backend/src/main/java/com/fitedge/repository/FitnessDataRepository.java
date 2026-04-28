package com.fitedge.repository;

import com.fitedge.entity.FitnessData;
import com.fitedge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FitnessDataRepository extends JpaRepository<FitnessData, Long> {
    Optional<FitnessData> findByUser(User user);
}
