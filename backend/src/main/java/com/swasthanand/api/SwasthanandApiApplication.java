package com.swasthanand.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@SpringBootApplication
@EnableR2dbcRepositories(basePackages = "com.swasthanand.api.repository")
@org.springframework.scheduling.annotation.EnableAsync
public class SwasthanandApiApplication {

  public static void main(String[] args) {
    System.setProperty("spring.devtools.restart.enabled", "false");
    SpringApplication.run(SwasthanandApiApplication.class, args);
  }

}
