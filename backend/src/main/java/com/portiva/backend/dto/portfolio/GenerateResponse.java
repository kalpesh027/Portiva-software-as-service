package com.portiva.backend.dto.portfolio;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GenerateResponse {
    private String portfolioId;
    private String liveUrl;
    private String templateName;
}
