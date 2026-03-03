package com.petcare.petwellness.DTO.Response.Report;

public class HealthReportPdfDto {

    private final byte[] pdfBytes;
    private final String fileName;

    public HealthReportPdfDto(byte[] pdfBytes, String fileName) {
        this.pdfBytes = pdfBytes;
        this.fileName = fileName;
    }

    public byte[] getPdfBytes() {
        return pdfBytes;
    }

    public String getFileName() {
        return fileName;
    }
}
