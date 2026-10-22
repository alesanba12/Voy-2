package com.grupo12.Voy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VoyApplication {

	public static void main(String[] args) {
		SpringApplication.run(VoyApplication.class, args);
	}

}
