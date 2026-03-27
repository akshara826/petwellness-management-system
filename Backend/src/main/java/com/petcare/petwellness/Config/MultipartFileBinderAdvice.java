package com.petcare.petwellness.Config;

import java.beans.PropertyEditorSupport;

import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.multipart.MultipartFile;

@ControllerAdvice
public class MultipartFileBinderAdvice {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        registerMultipartBinder(binder, "image");
        registerMultipartBinder(binder, "prescriptionFile");
        registerMultipartBinder(binder, "profileImage");
        registerMultipartBinder(binder, "idProof");
    }

    private void registerMultipartBinder(WebDataBinder binder, String fieldName) {
        binder.registerCustomEditor(MultipartFile.class, fieldName, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                setValue(null);
            }
        });
    }
}
