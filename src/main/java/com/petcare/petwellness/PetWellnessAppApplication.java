package com.petcare.petwellness;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class PetWellnessAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(PetWellnessAppApplication.class, args);
	}

}
