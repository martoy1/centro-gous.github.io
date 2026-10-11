
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Carregar els partials HTML
  const includeElements = document.querySelectorAll("[data-include]");

  const loadPartials = Array.from(includeElements).map(async (el) => {
    const file = el.getAttribute("data-include");

    try {
      const response = await fetch(file);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${file}`);
      }

      el.innerHTML = await response.text();
    } catch (error) {
      console.error("Error carregant el partial:", file, error);
    }
  });

  await Promise.all(loadPartials);

  // 2. Carregar les imatges de la galeria
  const gallery = document.getElementById("gousGalleryCarousel");

  if (gallery) {
    const indicators = gallery.querySelector(".carousel-indicators");
    const slides = gallery.querySelector(".carousel-inner");

    try {
      const jsonURL = new URL("gallery.json", document.baseURI);
      const response = await fetch(jsonURL, { cache: "no-cache" });

      if (!response.ok) {
        throw new Error(`No es pot carregar gallery.json (${response.status})`);
      }

      const images = await response.json();

      if (!Array.isArray(images)) {
        throw new Error("gallery.json no conté una llista vàlida.");
      }

      indicators.innerHTML = "";
      slides.innerHTML = "";

      images.forEach((src, index) => {
        // Crear indicador
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.bsTarget = "#gousGalleryCarousel";
        button.dataset.bsSlideTo = index;
        button.setAttribute("aria-label", `Foto ${index + 1}`);

        if (index === 0) {
          button.classList.add("active");
          button.setAttribute("aria-current", "true");
        }

        indicators.appendChild(button);

        // Crear diapositiva
        const slide = document.createElement("div");
        slide.className =
            `carousel-item${index === 0 ? " active" : ""}`;

        const ratio = document.createElement("div");
        ratio.className = "ratio ratio-16x9";

        const img = document.createElement("img");
        img.src = new URL(src, document.baseURI).href;
        img.alt = `Instal·lacions del Dojo Gous - Foto ${index + 1}`;
        img.className = "d-block w-100 object-fit-cover";
        img.loading = index === 0 ? "eager" : "lazy";
        img.decoding = "async";

        img.addEventListener("error", () => {
          console.error("No s'ha pogut carregar la imatge:", img.src);
        });

        ratio.appendChild(img);
        slide.appendChild(ratio);
        slides.appendChild(slide);
      });

      if (images.length === 0) {
        slides.innerHTML = `
          <div class="carousel-item active">
            <div class="ratio ratio-16x9 d-flex align-items-center justify-content-center">
              <p class="text-white">No hi ha imatges disponibles.</p>
            </div>
          </div>`;
      } else if (window.bootstrap?.Carousel) {
        bootstrap.Carousel.getOrCreateInstance(gallery, {
          interval: 5000,
          ride: "carousel",
          pause: "hover",
          wrap: true
        });
      } else {
        console.error("Bootstrap Carousel no està carregat.");
      }

      console.log(`Galeria carregada: ${images.length} imatges.`);

    } catch (error) {
      console.error("Error carregant la galeria:", error);
    }
  } else {
    console.warn("No s'ha trobat el carrusel gousGalleryCarousel.");
  }

  // 3. ScrollSpy
  if (window.bootstrap?.ScrollSpy) {
    const scrollSpy = bootstrap.ScrollSpy.getOrCreateInstance(
        document.body,
        {
          target: "#mainNav",
          smoothScroll: true,
          offset: 100
        }
    );

    scrollSpy.refresh();
  }

  // 4. Tancar el menú mòbil en clicar un enllaç
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const navbarCollapse = document.getElementById("mainNav");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (
          navbarCollapse &&
          navbarCollapse.classList.contains("show") &&
          window.bootstrap?.Collapse
      ) {
        bootstrap.Collapse
            .getOrCreateInstance(navbarCollapse)
            .hide();
      }
    });
  });

  // 5. Any actual al footer
  const yearSpan = document.querySelector("[data-current-year]");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
