---

## MCP Integration

Yes, I have worked with **Model Context Protocol (MCP)**—specifically, the **Figma MCP** for design collaboration and prototyping. I used it to:
- **Streamline the design-to-development workflow** by extracting assets, styles, and components directly from Figma designs.
- **Automate repetitive tasks** like generating UI components, syncing design tokens, and ensuring pixel-perfect translations from design to code.
- **Collaborate in real-time** with designers, reducing miscommunication and speeding up iteration cycles.

**What I accomplished:**
- Reduced manual effort in translating Figma designs to React/Next.js components.
- Improved consistency in UI by auto-generating Tailwind CSS classes and shadcn/ui components.
- Saved hours of manual work by automating the extraction of design system elements.

---

## AI Tools for Development

I regularly use **AI-powered tools** to supercharge my frontend development workflow:

- **GitHub Copilot**: My go-to for writing boilerplate code, debugging, and generating React hooks, API calls etc.
- **ChatGPT + Codex**: Used for brainstorming, writing complex logic, and optimizing performance. For example, I’ve used it to:
  - Generate TypeScript interfaces for API responses.
  - Optimize Redux selectors and Redux Toolkit slices.

---

## Offline Mode for Exam Platform

Handling **offline mode** is critical for an exam platform, especially to ensure candidates aren’t penalized for losing connectivity. Here’s how I’d approach it:

### **1. Local Caching of Exam Data**
- Use **IndexedDB** or **Service Workers** to cache exam questions, instructions, and candidate progress locally.
- Store answers and attempt metadata in the browser’s IndexedDB, so they persist even if the user refreshes or loses connectivity.

### **2. Auto-Save and Queue Requests**
- Implement an **auto-save mechanism** that saves answers to IndexedDB every few seconds.
- Queue API requests (e.g., submitting answers) when offline and **sync them automatically** when the connection is restored.

### **3. Conflict Resolution**
- Use **versioning** or timestamps to handle conflicts if the same answer is saved both online and offline.
- Show a **clear notification** to the candidate when their answers have been synced.

### **4. Progress Tracking**
- Display a **synchronization status** (e.g., “Pending: 3 answers not yet synced”).
- Warn the candidate if they try to submit without a stable connection.

### **5. Progressive Web App (PWA) Approach**
- Convert the frontend into a **PWA** to leverage:
  - **Offline-first architecture**.
  - **Background sync** for queued requests.
  - **App-like experience** with installability.

---