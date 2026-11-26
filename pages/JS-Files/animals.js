const randomAnimalCount = Math.floor(Math.random() * 8_000_000_000) + 1;
const animalCountDisplay = document.querySelector("[data-random-count]");

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
    animalCountDisplay.textContent = formatAnimalCount(randomAnimalCount);
    animalCountDisplay.setAttribute(
        "aria-label",
        `${randomAnimalCount.toLocaleString()} random supporters`
    );
}