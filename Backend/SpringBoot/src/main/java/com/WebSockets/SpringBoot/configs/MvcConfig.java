package com.WebSockets.SpringBoot.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps requests for /photos/** to the directory specified by file.upload-dir
        registry.addResourceHandler("/photos/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
