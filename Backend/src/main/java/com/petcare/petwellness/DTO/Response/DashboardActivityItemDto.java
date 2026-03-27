package com.petcare.petwellness.DTO.Response;

public class DashboardActivityItemDto {

    private String id;
    private String text;
    private String time;
    private String tone;

    public DashboardActivityItemDto(String id, String text, String time, String tone) {
        this.id = id;
        this.text = text;
        this.time = time;
        this.tone = tone;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public String getTime() {
        return time;
    }

    public String getTone() {
        return tone;
    }
}
