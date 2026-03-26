package com.portiva.backend.dto.portfolio;

import lombok.Data;
import java.util.Map;

@Data
public class SaveDraftRequest {
    private Map<String, Object> formData;
    private int currentStep;
}
