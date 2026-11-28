const randomAnimalCount = Math.floor(Math.random() * 8_000_000_000) + 1;
const animalCountDisplay = document.querySelector("[data-random-count]");
const animalLikeButton = document.querySelector("[data-animal-like]");
const animalDonationImage = document.querySelector(".animal-donation");
const animalHeading = document.querySelector("h1");

if (animalDonationImage && animalHeading) {
    const animalName = animalHeading.textContent.trim();
    const recipient = animalName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const donationUrl = new URL("../../donate.html", window.location.href);
    donationUrl.searchParams.set("recipient", recipient);

    const donationLink = document.createElement("a");
    donationLink.className = "animal-donation-link";
    donationLink.href = donationUrl.href;
    donationLink.setAttribute("aria-label", `Donate to ${animalName}`);
    animalDonationImage.replaceWith(donationLink);
    donationLink.append(animalDonationImage);
}

const formatAnimalCount = count => {
    if (count < 1_000) {
        return String(count);
    }

    const units = [
        { value: 1_000, suffix: "K" },
        { value: 1_000_000, suffix: "M" },
        { value: 1_000_000_000, suffix: "B" }
    ];
    let unitIndex = 0;
    for (let index = 1; index < units.length; index += 1) {
        if (count >= units[index].value) {
            unitIndex = index;
        }
    }

    let roundedCount = Number((count / units[unitIndex].value).toPrecision(3));

    if (roundedCount >= 1_000 && unitIndex < units.length - 1) {
        unitIndex += 1;
        roundedCount = Number((count / units[unitIndex].value).toPrecision(3));
    }

    return `${roundedCount}${units[unitIndex].suffix}`;
};

if (animalCountDisplay) {
    const updateAnimalCount = liked => {
        const count = randomAnimalCount + Number(liked);
        animalCountDisplay.textContent = formatAnimalCount(count);
        animalCountDisplay.setAttribute(
            "aria-label",
            `${count.toLocaleString()} supporters`
        );
    };

    updateAnimalCount(false);

    if (animalLikeButton) {
        animalLikeButton.addEventListener("click", () => {
            const liked = animalLikeButton.getAttribute("aria-pressed") !== "true";
            animalLikeButton.setAttribute("aria-pressed", String(liked));
            animalLikeButton.setAttribute(
                "aria-label",
                liked ? "Unlike this animal" : "Like this animal"
            );
            animalLikeButton.classList.toggle("is-liked", liked);
            updateAnimalCount(liked);
        });
    }
}

const animalShareButtons = document.querySelectorAll(".animal-share-button");

if (animalShareButtons.length > 0) {
    const shareDialog = document.createElement("dialog");
    shareDialog.className = "animal-share-dialog";
    shareDialog.setAttribute("aria-labelledby", "animal-share-title");
    shareDialog.innerHTML = `
        <form method="dialog" class="animal-share-dialog__form">
            <button class="animal-share-dialog__close" type="submit" aria-label="Close">×</button>
        </form>
        <h2 id="animal-share-title">Share this page</h2>
        <label class="animal-share-dialog__label" for="animal-share-url">Page URL</label>
        <div class="animal-share-dialog__controls">
            <input id="animal-share-url" class="animal-share-dialog__url" type="text" readonly>
            <button class="animal-share-dialog__copy" type="button">Copy</button>
        </div>
        <p class="animal-share-dialog__status" aria-live="polite"></p>
    `;
    document.body.append(shareDialog);

    const shareUrlInput = shareDialog.querySelector(".animal-share-dialog__url");
    const copyButton = shareDialog.querySelector(".animal-share-dialog__copy");
    const shareStatus = shareDialog.querySelector(".animal-share-dialog__status");

    animalShareButtons.forEach(button => {
        button.addEventListener("click", () => {
            shareUrlInput.value = window.location.href;
            shareStatus.textContent = "";
            shareDialog.showModal();
            copyButton.focus();
        });
    });

    copyButton.addEventListener("click", async () => {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error("Clipboard access is unavailable.");
            }

            await navigator.clipboard.writeText(shareUrlInput.value);
            shareStatus.textContent = "Link copied.";
        } catch (error) {
            console.error("Could not copy the page URL to the clipboard.", error);
            shareUrlInput.focus();
            shareUrlInput.select();
            shareStatus.textContent = "Could not copy automatically. The URL is selected; copy it with Ctrl+C or Command+C.";
        }
    });
}