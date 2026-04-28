package com.fitedge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "sleep_data")
@Data
public class SleepData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private LocalDate date;
    private double hours; 
    private int deepSleepMinutes;
    private int lightSleepMinutes;
}
