import { db } from "./firebase-config.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const registerForm = document.getElementById("register-form");
const submitBtn = document.getElementById("submit-btn");
const resultBox = document.getElementById("result-box");
const generatedTrackingId = document.getElementById("generated-tracking-id");
const qrContainer = document.getElementById("qrcode");
const whatsappBtn = document.getElementById("whatsapp-share-btn");

function generateTrackingId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "TRK-";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  submitBtn.disabled = true;
  submitBtn.innerText = "Registering Parcel...";

  const trackingId = generateTrackingId();
  const senderName = document.getElementById("sender-name").value.trim();
  const receiverName = document.getElementById("receiver-name").value.trim();
  const address = document.getElementById("address").value.trim();
  const weight = document.getElementById("weight").value.trim();
  const service = document.getElementById("service").value;

  try {
    await setDoc(doc(db, "parcels", trackingId), {
      trackingId,
      senderName,
      receiverName,
      address,
      weight,
      service,
      status: "Booked",
      createdAt: serverTimestamp()
    });

    generatedTrackingId.innerText = trackingId;
    qrContainer.innerHTML = "";

    const trackingUrl = `${window.location.origin}/track.html?id=${trackingId}`;

    new QRCode(qrContainer, {
      text: trackingUrl,
      width: 128,
      height: 128,
      colorDark: "#ffffff",
      colorLight: "#111827",
      correctLevel: QRCode.CorrectLevel.H
    });

    whatsappBtn.onclick = () => {
      const msg = `Hi ${receiverName}, your parcel from ${senderName} is registered! Track live updates here: ${trackingUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    resultBox.style.display = "block";
    registerForm.reset();

    // ANIMATION 5: Confetti Burst Trigger
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

  } catch (error) {
    alert("Error registering parcel: " + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Register Parcel & Generate ID";
  }
});