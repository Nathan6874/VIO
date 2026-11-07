package ci.vio.backend.user;

public class DuplicateWhatsappException extends RuntimeException {

    public DuplicateWhatsappException(String whatsapp) {
        super("Un utilisateur avec le WhatsApp " + whatsapp + " existe déjà");
    }
}