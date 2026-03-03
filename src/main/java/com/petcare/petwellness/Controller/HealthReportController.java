package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Response.Report.HealthReportPdfDto;
import com.petcare.petwellness.Service.HealthReportService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@SecurityRequirement(name = "bearerAuth")
public class HealthReportController {

    private final HealthReportService healthReportService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public HealthReportController(HealthReportService healthReportService,
                                  AuthenticatedUserUtil authenticatedUserUtil) {
        this.healthReportService = healthReportService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @Operation(summary = "Download health report PDF for a pet owned by logged-in user")
    @GetMapping("/pet/{petId}/health-report")
    public ResponseEntity<byte[]> downloadHealthReport(
            Authentication authentication,
            @PathVariable Long petId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        HealthReportPdfDto report = healthReportService.generatePetHealthReport(petId, userId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(report.getPdfBytes().length)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + report.getFileName() + "\"")
                .body(report.getPdfBytes());
    }
}
