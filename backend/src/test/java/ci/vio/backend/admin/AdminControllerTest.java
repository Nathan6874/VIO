package ci.vio.backend.admin;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyResponse;
import ci.vio.backend.property.PropertyStatus;
import ci.vio.backend.property.PropertyType;
import ci.vio.backend.security.JwtService;
import ci.vio.backend.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private PropertyResponse sampleResponse(PropertyStatus status) {
        return new PropertyResponse(
                10L,
                "Appartement Cocody",
                "Chez Koffi",
                "Abidjan",
                "Cocody",
                250000.0,
                PropertyType.APPARTEMENT,
                3,
                75.0,
                status,
                Instant.parse("2026-11-07T00:00:00Z"),
                new PropertyResponse.OwnerInfo(6L, "Koffi", "Jean", "+22501020304")
        );
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void approveShouldReturn200WhenAdmin() throws Exception {
        when(adminService.approve(10L)).thenReturn(sampleResponse(PropertyStatus.APPROVED));

        mockMvc.perform(put("/api/admin/properties/10/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.type").value("APPARTEMENT"));
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void rejectShouldReturn200WhenAdmin() throws Exception {
        when(adminService.reject(10L)).thenReturn(sampleResponse(PropertyStatus.REJECTED));

        mockMvc.perform(put("/api/admin/properties/10/reject"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @WithMockUser(username = "+22505060708", roles = "OWNER")
    void approveShouldReturn403WhenOwner() throws Exception {
        mockMvc.perform(put("/api/admin/properties/10/approve"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void approveShouldReturn404WhenPropertyNotFound() throws Exception {
        when(adminService.approve(99999L))
                .thenThrow(new PropertyNotFoundException(99999L));

        mockMvc.perform(put("/api/admin/properties/99999/approve"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("PropertyNotFound"));
    }
}