package ci.vio.backend.media;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.security.JwtService;
import ci.vio.backend.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MediaController.class)
@Import(SecurityConfig.class)
class MediaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MediaService mediaService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser
    void postMediaShouldReturn201() throws Exception {
        MediaResponse response = new MediaResponse(
                1L,
                "https://example.com/photo1.jpg",
                "PHOTO",
                10L,
                Instant.parse("2026-11-07T00:00:00Z")
        );

        when(mediaService.addMedia(eq(10L), anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(post("/api/properties/10/media")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"https://example.com/photo1.jpg\",\"type\":\"PHOTO\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.url").value("https://example.com/photo1.jpg"))
                .andExpect(jsonPath("$.type").value("PHOTO"))
                .andExpect(jsonPath("$.propertyId").value(10));
    }

    @Test
    @WithMockUser
    void getMediaListShouldReturn200() throws Exception {
        MediaResponse m1 = new MediaResponse(
                1L, "https://example.com/photo1.jpg", "PHOTO", 10L,
                Instant.parse("2026-11-07T00:00:00Z")
        );
        MediaResponse m2 = new MediaResponse(
                2L, "https://example.com/pano1.jpg", "PANORAMA_360", 10L,
                Instant.parse("2026-11-07T00:01:00Z")
        );

        when(mediaService.findAllByPropertyId(10L)).thenReturn(List.of(m1, m2));

        mockMvc.perform(get("/api/properties/10/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].url").value("https://example.com/photo1.jpg"))
                .andExpect(jsonPath("$[1].type").value("PANORAMA_360"));
    }

    @Test
    @WithMockUser
    void postMediaOnUnknownPropertyShouldReturn404() throws Exception {
        when(mediaService.addMedia(eq(99999L), anyString(), anyString()))
                .thenThrow(new PropertyNotFoundException(99999L));

        mockMvc.perform(post("/api/properties/99999/media")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"https://example.com/x.jpg\",\"type\":\"PHOTO\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("PropertyNotFound"));
    }
}