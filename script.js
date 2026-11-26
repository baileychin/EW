const themeStorageKey = "ew-theme";
const themeRoot = document.documentElement;
const savedTheme = localStorage.getItem(themeStorageKey);
themeRoot.dataset.theme = savedTheme === "dark" ? "dark" : "light";

const themeToggle = document.querySelector(".theme-toggle");

if (themeToggle) {
    const updateThemeToggle = () => {
        const isDark = themeRoot.dataset.theme === "dark";
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    };

    updateThemeToggle();
    themeToggle.addEventListener("click", () => {
        const isDark = themeRoot.dataset.theme !== "dark";
        const theme = isDark ? "dark" : "light";
        themeRoot.dataset.theme = theme;
        localStorage.setItem(themeStorageKey, theme);
        updateThemeToggle();
    });
}

const continentMap = document.querySelector(".continent-map");

if (continentMap) {
    const continentLinks = [...continentMap.querySelectorAll(".continent-map__item")];
    let antarcticaLink;
    let isAntarcticaPixel;

    Promise.all(continentLinks.map(async link => {
        const image = link.querySelector("img");

        if (image.alt === "Antarctica") {
            await image.decode();

            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const context = canvas.getContext("2d", { willReadFrequently: true });

            if (!context) {
                throw new Error("Could not create an image context for Antarctica hit testing.");
            }

            context.drawImage(image, 0, 0);
            const alpha = context.getImageData(0, 0, canvas.width, canvas.height).data;
            antarcticaLink = link;
            isAntarcticaPixel = (clientX, clientY) => {
                const mapBounds = continentMap.getBoundingClientRect();
                const scale = Math.min(
                    link.offsetWidth / canvas.width,
                    link.offsetHeight / canvas.height
                );
                const imageWidth = canvas.width * scale;
                const imageHeight = canvas.height * scale;
                const left = mapBounds.left + link.offsetLeft + (link.offsetWidth - imageWidth) / 2;
                const top = mapBounds.top + link.offsetTop + (link.offsetHeight - imageHeight) / 2;
                const transformScale = new DOMMatrix(getComputedStyle(link).transform).a;
                const unscaledX = link.offsetWidth / 2
                    + (clientX - mapBounds.left - link.offsetLeft - link.offsetWidth / 2) / transformScale;
                const unscaledY = link.offsetHeight / 2
                    + (clientY - mapBounds.top - link.offsetTop - link.offsetHeight / 2) / transformScale;
                const x = Math.floor(
                    (unscaledX - (link.offsetWidth - imageWidth) / 2) / imageWidth * canvas.width
                );
                const y = Math.floor(
                    (unscaledY - (link.offsetHeight - imageHeight) / 2) / imageHeight * canvas.height
                );

                if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
                    return false;
                }

                return alpha[(y * canvas.width + x) * 4 + 3] > 16;
            };

            link.setAttribute("aria-label", image.alt);
            return;
        }

        const response = await fetch(image.src);

        if (!response.ok) {
            throw new Error(`Failed to load ${image.alt} SVG: ${response.status}`);
        }

        const svgText = await response.text();
        const svgDocument = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = svgDocument.documentElement;

        if (svg.localName !== "svg" || svgDocument.querySelector("parsererror")) {
            throw new Error(`Invalid SVG for ${image.alt}`);
        }

        if (!svg.hasAttribute("viewBox")) {
            const width = Number.parseFloat(svg.getAttribute("width"));
            const height = Number.parseFloat(svg.getAttribute("height"));

            if (!Number.isFinite(width) || !Number.isFinite(height)) {
                throw new Error(`SVG dimensions are missing for ${image.alt}`);
            }

            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        }

        svg.classList.add("continent-map__svg");
        svg.setAttribute("aria-hidden", "true");
        link.setAttribute("aria-label", image.alt);
        link.replaceChild(document.importNode(svg, true), image);
    }))
        .then(() => {
            continentMap.classList.add("is-ready");
            continentMap.addEventListener("pointermove", event => {
                const hoveredLink = event.target.closest(".continent-map__item");
                const isHoveringAntarctica = (!hoveredLink || hoveredLink === antarcticaLink)
                    && isAntarcticaPixel(event.clientX, event.clientY);

                antarcticaLink.classList.toggle("is-hovered", isHoveringAntarctica);
                continentMap.classList.toggle(
                    "is-antarctica-hovered",
                    isHoveringAntarctica
                );
            });
            continentMap.addEventListener("pointerleave", () => {
                antarcticaLink.classList.remove("is-hovered");
                continentMap.classList.remove("is-antarctica-hovered");
            });
            continentMap.addEventListener("click", event => {
                const clickedLink = event.target.closest(".continent-map__item");

                if (
                    (!clickedLink || clickedLink === antarcticaLink)
                    && isAntarcticaPixel(event.clientX, event.clientY)
                ) {
                    event.preventDefault();
                    window.location.assign(antarcticaLink.href);
                }
            });
        })
        .catch(error => {
            console.error("Could not enable precise continent hit targets.", error);
        });
}
