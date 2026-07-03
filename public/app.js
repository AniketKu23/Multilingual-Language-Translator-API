// AuraTranslate Client JS

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileInfo = document.getElementById("file-info");
  const selectedFileName = document.getElementById("selected-file-name");
  const selectedFileSize = document.getElementById("selected-file-size");
  const btnRemoveFile = document.getElementById("btn-remove-file");
  
  const inputCode = document.getElementById("input-code");
  const selectLang = document.getElementById("select-lang");
  const btnSubmit = document.getElementById("btn-submit");
  const btnText = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  
  const authStatus = document.getElementById("auth-status");
  const authStatusText = document.getElementById("auth-status-text");
  const btnReauth = document.getElementById("btn-reauth");
  
  const resultEmpty = document.getElementById("result-empty");
  const resultProgress = document.getElementById("result-progress");
  const resultError = document.getElementById("result-error");
  const errorMessage = document.getElementById("error-message");
  const resultContent = document.getElementById("result-content");
  
  const statKeys = document.getElementById("stat-keys");
  const statLang = document.getElementById("stat-lang");
  const statCode = document.getElementById("stat-code");
  const codeOutput = document.getElementById("code-output");
  const codeFilename = document.getElementById("code-filename");
  
  const btnCopy = document.getElementById("btn-copy");
  const btnDownload = document.getElementById("btn-download");
  
  const demoButtons = document.querySelectorAll(".btn-demo-load");

  // Global variables
  let selectedFile = null;
  let translatedData = null;
  let translatedFileType = null;

  // 1. JWT Authentication Management
  async function fetchToken(force = false) {
    let token = localStorage.getItem("jwtToken");
    
    if (token && !force) {
      updateAuthUI("active", "Authenticated (Session Active)");
      return token;
    }
    
    updateAuthUI("checking", "Fetching session token...");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem("jwtToken", data.token);
        updateAuthUI("active", "Authenticated (Session Connected)");
        return data.token;
      } else {
        throw new Error(data.message || "Failed to generate token");
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      updateAuthUI("failed", "Auth Failed: Unable to retrieve token");
      return null;
    }
  }

  function updateAuthUI(state, text) {
    authStatus.className = `auth-badge auth-${state}`;
    authStatusText.textContent = text;
  }

  btnReauth.addEventListener("click", () => fetchToken(true));

  // Initialize Auth on page load
  fetchToken();

  // 2. Drag & Drop File Handling
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add("dragover"), false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove("dragover"), false);
  });

  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      handleFileSelection(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length) {
      handleFileSelection(e.target.files[0]);
    }
  });

  function handleFileSelection(file) {
    if (!file.name.endsWith(".json")) {
      alert("Invalid file format. Please upload a JSON language file.");
      return;
    }
    
    selectedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatBytes(file.size);
    
    // UI adjustment
    fileInfo.classList.remove("hidden");
    dropzone.querySelector(".drop-zone-content").classList.add("hidden");
    btnSubmit.removeAttribute("disabled");
  }

  function removeFile() {
    selectedFile = null;
    fileInput.value = "";
    fileInfo.classList.add("hidden");
    dropzone.querySelector(".drop-zone-content").classList.remove("hidden");
    btnSubmit.setAttribute("disabled", "true");
  }

  btnRemoveFile.addEventListener("click", (e) => {
    e.stopPropagation();
    removeFile();
  });

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  // 3. Loading Demo Files Instantly
  demoButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const filename = btn.getAttribute("data-file");
      
      try {
        const response = await fetch(`demo_inputs/${filename}`);
        if (!response.ok) throw new Error("Demo file could not be fetched");
        
        const data = await response.json();
        const jsonStr = JSON.stringify(data, null, 2);
        
        // Convert to virtual file object
        const blob = new Blob([jsonStr], { type: "application/json" });
        const file = new File([blob], filename, { type: "application/json" });
        
        handleFileSelection(file);
      } catch (err) {
        alert("Error loading demo file: " + err.message);
      }
    });
  });

  // 4. Submit Translation API Request
  btnSubmit.addEventListener("click", async () => {
    if (!selectedFile) return;

    // Get Auth Token (refresh if missing)
    let token = localStorage.getItem("jwtToken");
    if (!token) {
      token = await fetchToken(true);
      if (!token) {
        alert("Cannot execute translation without a valid API authentication token.");
        return;
      }
    }

    const code = inputCode.value.trim() || "shared";
    const targetLang = selectLang.value;
    const filetype = document.querySelector('input[name="filetype"]:checked').value;

    // Show Progress State
    resultEmpty.classList.add("hidden");
    resultError.classList.add("hidden");
    resultContent.classList.add("hidden");
    resultProgress.classList.remove("hidden");
    
    // Disable form controls
    btnSubmit.setAttribute("disabled", "true");
    btnText.textContent = "Translating...";
    btnLoader.classList.remove("hidden");

    // Prepare FormData
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("Code", code);
    formData.append("LanguageCode", targetLang);
    formData.append("filetype", filetype);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        // If unauthorized, retry once by generating a new token
        if (response.status === 401) {
          console.warn("Unauthorized request. Regenerating token...");
          token = await fetchToken(true);
          if (token) {
            // Re-run the fetch call
            return executeTranslation(formData, token, code, targetLang, filetype);
          }
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      await handleTranslationSuccess(response, code, targetLang, filetype);

    } catch (error) {
      showError(error.message);
    } finally {
      btnSubmit.removeAttribute("disabled");
      btnText.textContent = "Translate Document";
      btnLoader.classList.add("hidden");
      resultProgress.classList.add("hidden");
    }
  });

  // Retried execution helper
  async function executeTranslation(formData, token, code, targetLang, filetype) {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      await handleTranslationSuccess(response, code, targetLang, filetype);
    } catch (error) {
      showError(error.message);
    } finally {
      btnSubmit.removeAttribute("disabled");
      btnText.textContent = "Translate Document";
      btnLoader.classList.add("hidden");
      resultProgress.classList.add("hidden");
    }
  }

  // Handle successful API response
  async function handleTranslationSuccess(response, code, targetLang, filetype) {
    translatedFileType = filetype;
    
    if (filetype === "json") {
      const data = await response.json();
      translatedData = data.data; // Array of translations
      
      // Render JSON result in standard structured format
      const formattedJSON = JSON.stringify(translatedData, null, 2);
      codeOutput.textContent = formattedJSON;
      codeFilename.textContent = `translated_${targetLang}.json`;
      
      // Update stats
      statKeys.textContent = data.count || translatedData.length;
      statLang.textContent = targetLang.toUpperCase();
      statCode.textContent = code;
    } else {
      // CSV format text
      const csvText = await response.text();
      translatedData = csvText;
      
      codeOutput.textContent = csvText;
      codeFilename.textContent = `translated_${targetLang}.csv`;
      
      // Estimate count from CSV rows
      const rows = csvText.trim().split("\n").length - 1; // subtract header row
      statKeys.textContent = Math.max(0, rows);
      statLang.textContent = targetLang.toUpperCase();
      statCode.textContent = code;
    }

    // Toggle panels
    resultProgress.classList.add("hidden");
    resultContent.classList.remove("hidden");
    btnCopy.classList.remove("hidden");
    btnDownload.classList.remove("hidden");
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    resultProgress.classList.add("hidden");
    resultContent.classList.add("hidden");
    resultError.classList.remove("hidden");
  }

  // 5. Actions: Copy and Download
  btnCopy.addEventListener("click", () => {
    let contentToCopy = "";
    if (translatedFileType === "json") {
      contentToCopy = JSON.stringify(translatedData, null, 2);
    } else {
      contentToCopy = translatedData;
    }
    
    navigator.clipboard.writeText(contentToCopy).then(() => {
      const originalHTML = btnCopy.innerHTML;
      btnCopy.innerHTML = `
        <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        btnCopy.innerHTML = originalHTML;
      }, 2000);
    }).catch(err => {
      alert("Failed to copy content: " + err.message);
    });
  });

  btnDownload.addEventListener("click", () => {
    if (!translatedData) return;

    let blob, filename;
    if (translatedFileType === "json") {
      const jsonStr = JSON.stringify(translatedData, null, 2);
      blob = new Blob([jsonStr], { type: "application/json" });
      filename = codeFilename.textContent || "translated.json";
    } else {
      blob = new Blob([translatedData], { type: "text/csv" });
      filename = codeFilename.textContent || "translated.csv";
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // 6. Theme Toggle Logic
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const themeIconSun = document.getElementById("theme-icon-sun");
  const themeIconMoon = document.getElementById("theme-icon-moon");
  const themeToggleText = document.getElementById("theme-toggle-text");

  // Load saved theme or default to light
  const savedTheme = localStorage.getItem("auraTranslateTheme") || "light";
  applyTheme(savedTheme);

  btnThemeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const isDark = document.body.classList.contains("theme-dark");
    applyTheme(isDark ? "light" : "dark");
  });

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
      themeIconSun.classList.remove("hidden");
      themeIconMoon.classList.add("hidden");
      themeToggleText.textContent = "Light Mode";
      localStorage.setItem("auraTranslateTheme", "dark");
    } else {
      document.body.classList.remove("theme-dark");
      themeIconSun.classList.add("hidden");
      themeIconMoon.classList.remove("hidden");
      themeToggleText.textContent = "Dark Mode";
      localStorage.setItem("auraTranslateTheme", "light");
    }
  }
});
