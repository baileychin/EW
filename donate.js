const donationForm = document.querySelector(".donation-form");
// Add the second Venmo username here when it is available.
const venmoRecipients = ["Bailey-chin","Juliet-Gichuhi"];

if (donationForm) {
    const recipientSelect = donationForm.querySelector("#donation-recipient");
    const requestedRecipient = new URLSearchParams(window.location.search).get("recipient");

    if (
        requestedRecipient &&
        Array.from(recipientSelect.options).some(option => option.value === requestedRecipient)
    ) {
        recipientSelect.value = requestedRecipient;
    }

    donationForm.addEventListener("submit", event => {
        event.preventDefault();
        const amount = Number(donationForm.querySelector("#donation-amount").value);
        const recipient = recipientSelect.selectedOptions[0].textContent.trim();
        const venmoRecipient =
            venmoRecipients[Math.floor(Math.random() * venmoRecipients.length)];
        const paymentUrl = new URL("https://account.venmo.com/payment-link");

        paymentUrl.searchParams.set("amount", amount.toFixed(2));
        paymentUrl.searchParams.set("recipients", venmoRecipient);
        paymentUrl.searchParams.set("txn", "pay");
        paymentUrl.searchParams.set("note", `Donation for the ${recipient}s`);

        window.location.assign(paymentUrl.href);
    });
}
