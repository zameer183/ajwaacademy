export default function WhatsAppFloating() {
  return (
    <a
      href="https://wa.me/923260054808"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 transition-transform hover:-translate-y-0.5"
      aria-label="Contact us on WhatsApp"
    >
      <div className="whatsapp-container flex items-center gap-2">
        <div className="whatsapp-icon h-12 w-12 rounded-full overflow-hidden">
          <img
            src="https://cdn-icons-png.flaticon.com/512/124/124034.png"
            alt="WhatsApp Icon"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </a>
  );
}
