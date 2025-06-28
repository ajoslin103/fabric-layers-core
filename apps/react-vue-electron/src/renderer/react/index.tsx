import '@assets/common/colors.css';
import '@assets/common/typog.css';
import '@assets/common/base.css';
import '@assets/common/tailwind.css';

import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(<App />);
