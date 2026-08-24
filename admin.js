import { db } from "./firebase-config.js";
import { collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tableBody = document.getElementById("parcels-table-body");
const milestones = ["Booked", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];

onSnapshot(collection(db, "parcels"), (snapshot) => {
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #9ca3af;">No parcels registered yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = "";
  
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";

    const optionsHtml = milestones.map(m => `<option value="${m}" ${data.status === m ? "selected" : ""}>${m}</option>`).join("");

    tr.innerHTML = `
      <td style="padding: 12px; font-weight: bold; color: #60a5fa;">${data.trackingId}</td>
      <td style="padding: 12px;">${data.senderName}</td>
      <td style="padding: 12px;">${data.receiverName}</td>
      <td style="padding: 12px;">${data.service}</td>
      <td style="padding: 12px;"><span style="color: #4ade80;">${data.status}</span></td>
      <td style="padding: 12px;">
        <select class="status-select" data-id="${data.trackingId}" style="padding: 4px 8px; font-size: 0.8rem; background: #1e293b; color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
          ${optionsHtml}
        </select>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", async (e) => {
      const id = e.target.getAttribute("data-id");
      const newStatus = e.target.value;
      try {
        await updateDoc(doc(db, "parcels", id), { status: newStatus });
      } catch (error) {
        alert("Error updating status: " + error.message);
      }
    });
  });
});