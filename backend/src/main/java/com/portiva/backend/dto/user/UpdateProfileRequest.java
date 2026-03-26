package com.portiva.backend.dto.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String title;
    private String avatar;
    private String location;
    private String website;
}
