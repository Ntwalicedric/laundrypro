import "./global.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root");

if (!container) {
  console.error("Unable to find app root element with id 'root'.");
} else {
  createRoot(container).render(<App />);
}
