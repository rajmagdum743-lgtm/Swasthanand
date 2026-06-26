# 📱 Swasthanand Mobile Development Guide

This guide covers how to update your IP address and how to deploy any UI changes (like the new logo) to your mobile APK.

---

## 🛠️ Case 1: IP Address Change (Products not loading)
If your products are not loading, your PC's IP address has likely changed.

### 1. Get New IP
Run `ipconfig` in your terminal and copy the **IPv4 Address**.

### 2. Update these 4 Files
1.  **`frontend/.env`**: `VITE_API_BASE_URL=http://<YOUR_IP>:8081`
2.  **`frontend/src/config/api.ts`**: Change fallback URL: `'http://<YOUR_IP>:8081'`
3.  **`backend/.../WebConfig.java`**: Update `.allowedOrigins("http://<YOUR_IP>:5173", ...)`
4.  **`backend/.../SecurityConfig.java`**: Update `config.setAllowedOrigins(List.of("http://<YOUR_IP>:5173", ...))`

---

## 🎨 Case 2: UI Changes (Logo, Profile, Text, etc.)
If you change anything in the React code (like the `Header.tsx` logo size changes we just did), you **must** follow the Deployment Steps below to see them on your phone.

---

## 🚀 Deployment Steps (Required for ALL changes)

1.  **Restart Backend** (If you changed the Java files):
    *   Stop and Start your Spring Boot application in IntelliJ.

2.  **Sync Frontend to Android**:
    Run these commands in the `frontend` folder:
    ```bash
    npm run build
    npx cap copy
    ```

3.  **Run APK**:
    *   Open Android Studio.
    *   Click the **Run** button (Green Arrow) to install the updated app on your phone.

> **Important**: 
> - Both Phone and PC must be on the **same Wi-Fi**.
> - For UI changes, `npx cap copy` is the most important step!
