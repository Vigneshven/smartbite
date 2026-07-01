function confirmDialog(message) {
  return new Promise((resolve) => {
    // create modal
    const existing = document.getElementById("confirmDialog");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "confirmDialog";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.zIndex = 9999;

    const box = document.createElement("div");
    box.style.background = "var(--card-bg, #fff)";
    box.style.padding = "18px";
    box.style.borderRadius = "10px";
    box.style.width = "320px";
    box.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";

    box.innerHTML = `
      <p style="margin:0 0 12px">${message}</p>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="confirmNo">Cancel</button>
        <button id="confirmYes" class="btn-primary">Confirm</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document.getElementById("confirmNo").onclick = () => {
      overlay.remove();
      resolve(false);
    };
    document.getElementById("confirmYes").onclick = () => {
      overlay.remove();
      resolve(true);
    };
  });
}

function showLoading(message = "Loading...") {
  if (document.getElementById("adminLoading")) return;
  const overlay = document.createElement("div");
  overlay.id = "adminLoading";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(255,255,255,0.6)";
  overlay.style.zIndex = 9998;
  overlay.innerHTML = `<div style="padding:12px 14px;border-radius:8px;background:var(--card-bg,#fff);box-shadow:0 4px 12px rgba(0,0,0,0.08)">${message}</div>`;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const el = document.getElementById("adminLoading");
  if (el) el.remove();
}
