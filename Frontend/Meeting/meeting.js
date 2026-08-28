   
   
   
         tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "secondary-fixed": "#e3e0f8",
              "surface-container": "#eeedf5",
              "on-tertiary-container": "#fff4ea",
              "surface-variant": "#e2e2e9",
              "on-surface": "#1a1b21",
              tertiary: "#7a4f00",
              "outline-variant": "#c9c4d7",
              "surface-dim": "#dad9e1",
              "inverse-surface": "#2f3036",
              "tertiary-fixed-dim": "#ffb955",
              primary: "#593bce",
              "inverse-primary": "#cabeff",
              "secondary-container": "#e0ddf5",
              outline: "#797586",
              surface: "#faf8ff",
              "surface-tint": "#6043d5",
              "on-primary-fixed-variant": "#4723bc",
              error: "#ba1a1a",
              "primary-container": "#7257e8",
              "primary-fixed": "#e6deff",
              secondary: "#5e5c70",
              "on-secondary-fixed-variant": "#464558",
              background: "#faf8ff",
              "on-background": "#1a1b21",
              "surface-container-lowest": "#ffffff",
              "inverse-on-surface": "#f1f0f8",
              "surface-container-high": "#e8e7ef",
              "surface-container-highest": "#e2e2e9",
              "error-container": "#ffdad6",
              "on-tertiary-fixed": "#291800",
              "on-primary-container": "#f9f3ff",
              "tertiary-container": "#9b6500",
              "primary-fixed-dim": "#cabeff",
              "on-error": "#ffffff",
              "on-primary": "#ffffff",
              "surface-container-low": "#f4f3fb",
              "tertiary-fixed": "#ffddb4",
              "on-secondary-container": "#626075",
              "secondary-fixed-dim": "#c7c4db",
              "on-tertiary-fixed-variant": "#633f00",
              "on-tertiary": "#ffffff",
              "on-secondary": "#ffffff",
              "on-primary-fixed": "#1c0062",
              "on-error-container": "#93000a",
              "on-surface-variant": "#484554",
              "on-secondary-fixed": "#1a1a2b",
              "surface-bright": "#faf8ff",
            },
            borderRadius: {
              DEFAULT: "0.25rem",
              lg: "0.5rem",
              xl: "0.75rem",
              full: "9999px",
              neumorphic: "20px",
            },
            spacing: {
              md: "24px",
              lg: "40px",
              "container-margin": "32px",
              xs: "4px",
              base: "8px",
              sm: "12px",
              gutter: "24px",
              xl: "64px",
            },
            fontFamily: {
              "display-lg": ["Inter"],
              "headline-lg": ["Inter"],
              "headline-lg-mobile": ["Inter"],
              "body-sm": ["Inter"],
              "headline-md": ["Inter"],
              "label-sm": ["Inter"],
              "headline-sm": ["Inter"],
              "label-md": ["Inter"],
              "body-md": ["Inter"],
              "body-lg": ["Inter"],
            },
            fontSize: {
              "display-lg": [
                "48px",
                {
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  fontWeight: "700",
                },
              ],
              "headline-lg": [
                "32px",
                {
                  lineHeight: "1.2",
                  letterSpacing: "-0.01em",
                  fontWeight: "700",
                },
              ],
              "headline-lg-mobile": [
                "28px",
                { lineHeight: "1.2", fontWeight: "700" },
              ],
              "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
              "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
              "label-sm": [
                "12px",
                {
                  lineHeight: "1.2",
                  letterSpacing: "0.02em",
                  fontWeight: "500",
                },
              ],
              "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
              "label-md": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
              "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
              "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
            },
            boxShadow: {
              "neumorphic-raised":
                "-4px -4px 12px rgba(255, 255, 255, 0.8), 0 8px 24px rgba(70, 60, 120, 0.08)",
              "neumorphic-pressed":
                "inset 4px 4px 8px rgba(70, 60, 120, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
              "neumorphic-floating":
                "-4px -4px 12px rgba(255, 255, 255, 0.8), 0 16px 48px rgba(70, 60, 120, 0.12)",
            },
          },
        },
      };
   
   
   (function () {
                const btn = document.getElementById("new-meeting-btn");
                const menu = document.getElementById("new-meeting-dropdown");

                btn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  const isHidden = menu.classList.contains("hidden");

                  if (isHidden) {
                    menu.classList.remove("hidden");
                    // Trigger animation
                    setTimeout(() => {
                      menu.classList.remove("scale-95", "opacity-0");
                      menu.classList.add("scale-100", "opacity-100");
                    }, 10);
                    btn.classList.remove("shadow-neumorphic-raised");
                    btn.classList.add("shadow-neumorphic-pressed");
                  } else {
                    closeMenu();
                  }
                });

                function closeMenu() {
                  menu.classList.remove("scale-100", "opacity-100");
                  menu.classList.add("scale-95", "opacity-0");
                  btn.classList.remove("shadow-neumorphic-pressed");
                  btn.classList.add("shadow-neumorphic-raised");
                  setTimeout(() => {
                    menu.classList.add("hidden");
                  }, 200);
                }

                document.addEventListener("click", (e) => {
                  if (!menu.contains(e.target) && !btn.contains(e.target)) {
                    closeMenu();
                  }
                });
              })();
   
   
   
   
   
   (function () {
        const btn = document.getElementById("profile-menu-btn");
        const menu = document.getElementById("profile-menu-dropdown");
        const overlay = document.getElementById("profile-menu-overlay");
        function openMenu() {
          menu.classList.remove("hidden");
          overlay.classList.remove("hidden");
          setTimeout(() => {
            menu.classList.remove("scale-95", "opacity-0");
            menu.classList.add("scale-100", "opacity-100");
            overlay.classList.remove("opacity-0");
            overlay.classList.add("opacity-100");
          }, 10);
        }
        function closeMenu() {
          menu.classList.remove("scale-100", "opacity-100");
          menu.classList.add("scale-95", "opacity-0");
          overlay.classList.remove("opacity-100");
          overlay.classList.add("opacity-0");
          setTimeout(() => {
            menu.classList.add("hidden");
            overlay.classList.add("hidden");
          }, 200);
        }
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (menu.classList.contains("hidden")) {
            openMenu();
          } else {
            closeMenu();
          }
        });
        overlay.addEventListener("click", closeMenu);
        document.addEventListener("click", (e) => {
          if (!menu.contains(e.target) && !btn.contains(e.target)) {
            closeMenu();
          }
        });
      })();