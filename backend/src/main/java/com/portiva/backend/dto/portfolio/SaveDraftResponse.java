package com.portiva.backend.dto.portfolio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveDraftResponse {
    private String portfolioId;
    private int currentStep;
    private String slug;
}
