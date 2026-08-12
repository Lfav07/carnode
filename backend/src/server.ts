import { App } from "./app.js";

const app = new App();

const PORT = process.env["PORT"] || 3000;
app.app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});