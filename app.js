// LocalStorage Helper Functions
function getLocalParcels() {
  return JSON.parse(localStorage.getItem('express_courier_parcels') || '[]');
}

function saveLocalParcel(parcel) {
  const parcels = getLocalParcels();
  parcels.push(parcel);
  localStorage.setItem('express_courier_parcels', JSON.stringify(parcels));
}

// Unique ID Generator
function generateTrackingID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Wait for DOM to load fully
document.addEventListener('DOMContentLoaded', () => {
  const parcelForm = document.getElementById('parcel-form');
  const adminParcelList = document.getElementById('admin-parcel-list');
  const trackForm = document.getElementById('track-form');

  // ================= 1. SMART CHATBOT WIDGET LOGIC =================
  const chatWidgetBtn = document.getElementById('chat-widget-btn');
  const chatBox = document.getElementById('chat-box');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  if (chatWidgetBtn && chatBox) {
    // Toggle Chat Window
    chatWidgetBtn.addEventListener('click', () => {
      chatBox.classList.toggle('show');
    });

    if (closeChatBtn) {
      closeChatBtn.addEventListener('click', () => {
        chatBox.classList.remove('show');
      });
    }

    // Smart Reply Handler
    const handleSendMessage = () => {
      const userText = chatInput.value.trim();
      if (!userText) return;

      // 1. Render User Message
      const userMsgDiv = document.createElement('div');
      userMsgDiv.style.cssText = 'background: #2563eb; color: #fff; padding: 10px 14px; border-radius: 12px; max-width: 85%; align-self: flex-end; margin-left: auto; word-break: break-word;';
      userMsgDiv.innerText = userText;
      chatMessages.appendChild(userMsgDiv);

      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // 2. Process Smart Reply
      setTimeout(() => {
        const botMsgDiv = document.createElement('div');
        botMsgDiv.style.cssText = 'background: rgba(30, 41, 59, 0.95); color: #e2e8f0; padding: 12px 14px; border-radius: 12px; max-width: 85%; border: 1px solid rgba(255, 255, 255, 0.1); line-height: 1.4;';

        const cleanQuery = userText.trim().toUpperCase();
        const parcels = getLocalParcels();

        // Check if query is a Tracking ID (TRK-...) or contains any tracking code
        const matchedParcel = parcels.find(p => p.trackingId.toUpperCase() === cleanQuery || cleanQuery.includes(p.trackingId.toUpperCase()));

        if (matchedParcel) {
          botMsgDiv.innerHTML = `
            <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">📦 Parcel Details Found:</div>
            <div><strong>ID:</strong> ${matchedParcel.trackingId}</div>
            <div><strong>Status:</strong> <span style="color: #4ade80; font-weight: 700;">${matchedParcel.status}</span></div>
            <div><strong>Receiver:</strong> ${matchedParcel.receiver}</div>
            <div><strong>Address:</strong> ${matchedParcel.address}</div>
          `;
        } else if (cleanQuery.startsWith("TRK-")) {
          botMsgDiv.innerText = `❌ No record found for ID: "${cleanQuery}". Please verify the tracking code.`;
        } else if (cleanQuery.includes("HI") || cleanQuery.includes("HELLO") || cleanQuery.includes("HEY")) {
          botMsgDiv.innerText = "Hello! 👋 Please send me your Tracking ID (e.g. TRK-XXXXXX) to get instant live status details.";
        } else if (cleanQuery.includes("HELP") || cleanQuery.includes("STATUS") || cleanQuery.includes("TRACK")) {
          botMsgDiv.innerText = "Simply type or paste your Tracking ID here (e.g. TRK-SHNMS7), and I will fetch the details for you.";
        } else {
          botMsgDiv.innerText = `Please enter a valid Tracking ID (e.g., TRK-XXXXXX) to view parcel status.`;
        }

        chatMessages.appendChild(botMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
    };

    if (sendChatBtn) sendChatBtn.addEventListener('click', handleSendMessage);
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
      });
    }
  }

  // ================= 2. REGISTER PARCEL PAGE =================
  if (parcelForm) {
    parcelForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const sender = document.getElementById('sender-name').value.trim();
      const receiver = document.getElementById('receiver-name').value.trim();
      const address = document.getElementById('delivery-address').value.trim();
      const weight = document.getElementById('parcel-weight').value.trim();
      const service = document.getElementById('service-type').value.trim();

      const trackingId = generateTrackingID();
      const createdAt = new Date().toISOString();

      const parcelData = {
        trackingId,
        sender,
        receiver,
        address,
        weight,
        service,
        status: 'Booked',
        createdAt
      };

      saveLocalParcel(parcelData);
      showSuccessCard(parcelData);
      parcelForm.reset();
    });
  }

  // ================= 3. ADMIN DASHBOARD PAGE =================
  if (adminParcelList) {
    loadAdminParcels();
  }

  // ================= 4. TRACK PARCEL PAGE =================
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('tracking-input').value.trim();
      const parcels = getLocalParcels();
      const found = parcels.find(p => p.trackingId.toLowerCase() === query.toLowerCase());

      const resultBox = document.getElementById('tracking-result');
      const errorMsg = document.getElementById('error-msg');

      if (found) {
        if (errorMsg) errorMsg.style.display = 'none';
        document.getElementById('display-id').innerText = found.trackingId;
        document.getElementById('current-status-badge').innerText = found.status;
        document.getElementById('meta-sender').innerText = found.sender;
        document.getElementById('meta-receiver').innerText = found.receiver;
        document.getElementById('meta-service').innerText = found.service;
        document.getElementById('meta-weight').innerText = `${found.weight} kg`;
        document.getElementById('meta-address').innerText = found.address;

        const statuses = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
        const currentIdx = statuses.indexOf(found.status);
        const progressPercent = (currentIdx / (statuses.length - 1)) * 100;
        
        const progressBar = document.getElementById('timeline-progress');
        if (progressBar) progressBar.style.width = `${progressPercent}%`;

        statuses.forEach((s, idx) => {
          const stepEl = document.getElementById(`step-${s}`);
          if (stepEl) {
            if (idx <= currentIdx) {
              stepEl.classList.add('active');
            } else {
              stepEl.classList.remove('active');
            }
          }
        });

        resultBox.classList.add('show');
      } else {
        if (resultBox) resultBox.classList.remove('show');
        if (errorMsg) {
          errorMsg.innerText = '❌ Tracking ID not found. Please check and try again.';
          errorMsg.style.display = 'block';
        }
      }
    });
  }
});

// Show Success Box Function
function showSuccessCard(data) {
  const parcelForm = document.getElementById('parcel-form');
  let card = document.getElementById('registration-result');
  
  if (!card) {
    card = document.createElement('div');
    card.id = 'registration-result';
    card.style.marginTop = '30px';
    card.style.padding = '24px';
    card.style.background = 'rgba(30, 41, 59, 0.85)';
    card.style.borderRadius = '16px';
    card.style.border = '1px solid rgba(59, 130, 246, 0.4)';
    card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    parcelForm.after(card);
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.trackingId)}`;
  const whatsappMsg = `Hello ${data.receiver}, your parcel has been registered with Express Courier.\nTracking ID: ${data.trackingId}\nTrack status here: ${window.location.origin}/track.html`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

  card.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
        ✓ Parcel Registered Successfully
      </span>
      <h3 style="margin-top: 15px; color: #fff; font-size: 1.5rem;">Tracking ID: <span style="color: #60a5fa;">${data.trackingId}</span></h3>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-around;">
      <div style="text-align: center; background: #fff; padding: 12px; border-radius: 12px;">
        <img src="${qrCodeUrl}" alt="QR Code" style="width: 140px; height: 140px; display: block;">
        <a href="${qrCodeUrl}" target="_blank" download="${data.trackingId}_QR.png" style="display: inline-block; margin-top: 8px; font-size: 0.75rem; color: #2563eb; font-weight: 700; text-decoration: none;">View / Download QR</a>
      </div>

      <div style="flex: 1; min-width: 220px; font-size: 0.9rem; color: #cbd5e1;">
        <p style="margin-bottom: 6px;"><strong>Sender:</strong> ${data.sender}</p>
        <p style="margin-bottom: 6px;"><strong>Receiver:</strong> ${data.receiver}</p>
        <p style="margin-bottom: 6px;"><strong>Address:</strong> ${data.address}</p>
        <p style="margin-bottom: 6px;"><strong>Status:</strong> <span style="color: #60a5fa; font-weight: 700;">${data.status}</span></p>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 12px;">
      <a href="${whatsappUrl}" target="_blank" style="flex: 1; text-align: center; background: #25D366; color: #fff; padding: 12px; border-radius: 10px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
        📲 Share via WhatsApp
      </a>
      <a href="track.html" style="flex: 1; text-align: center; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); padding: 12px; border-radius: 10px; font-weight: 700; text-decoration: none;">
        🔍 Track Parcel Now
      </a>
    </div>
  `;

  card.scrollIntoView({ behavior: 'smooth' });
}

// Load Admin Parcels
function loadAdminParcels() {
  const adminParcelList = document.getElementById('admin-parcel-list');
  const parcels = getLocalParcels();

  if (!adminParcelList) return;

  if (parcels.length === 0) {
    adminParcelList.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No parcels registered yet.</td></tr>`;
    return;
  }

  adminParcelList.innerHTML = parcels.map(p => `
    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
      <td style="padding: 14px; font-weight: 700; color: #60a5fa;">${p.trackingId}</td>
      <td style="padding: 14px; color: #cbd5e1;">${p.sender}</td>
      <td style="padding: 14px; color: #cbd5e1;">${p.receiver}</td>
      <td style="padding: 14px;">
        <select onchange="updateParcelStatus('${p.trackingId}', this.value)" style="background: #0f172a; color: #60a5fa; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; font-weight: 600;">
          <option value="Booked" ${p.status === 'Booked' ? 'selected' : ''}>Booked</option>
          <option value="Picked Up" ${p.status === 'Picked Up' ? 'selected' : ''}>Picked Up</option>
          <option value="In Transit" ${p.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
          <option value="Out for Delivery" ${p.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
          <option value="Delivered" ${p.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td style="padding: 14px;">
        <button onclick="deleteParcel('${p.trackingId}')" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Global scope functions for admin actions
window.updateParcelStatus = (trackingId, newStatus) => {
  const parcels = getLocalParcels();
  const parcel = parcels.find(p => p.trackingId === trackingId);
  if (parcel) {
    parcel.status = newStatus;
    localStorage.setItem('express_courier_parcels', JSON.stringify(parcels));
    alert(`Status updated to: ${newStatus}`);
  }
};

window.deleteParcel = (trackingId) => {
  if (confirm(`Are you sure you want to delete ${trackingId}?`)) {
    let parcels = getLocalParcels();
    parcels = parcels.filter(p => p.trackingId !== trackingId);
    localStorage.setItem('express_courier_parcels', JSON.stringify(parcels));
    loadAdminParcels();
  }
};