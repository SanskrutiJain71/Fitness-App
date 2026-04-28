package com.fitedge.repository;

import com.fitedge.entity.SleepData;
import com.fitedge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SleepDataRepository extends JpaRepository<SleepData, Long> {
    List<SleepData> findByUserOrderByDateDesc(User user);
}
