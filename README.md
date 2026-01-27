
## Overview

This project is a **full-stack e-commerce application** built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) with an **LLM-based Voice Assistant** and an **AI-powered Virtual Try-On system**.

The platform allows users to browse products and virtually try clothing items using a webcam, improving user confidence and reducing return rates.

---

## Features

### User-Facing Features

- User authentication and profile management  
- Browse products by category, color, tags, and price  
- Add products to cart  
- Place orders with multiple payment options (COD, UPI, Card, Wallet)  
- View past orders and order status updates  
- AI-based Virtual Try-On using OpenCV  
- LLM-based search and product navigation using voice  

### Admin Features

- Manage products and categories  
- View all orders and order statistics  

---

## AI-Based Virtual Try-On System

The Virtual Try-On module enables users to preview clothing items in real time using **computer vision and deep learning techniques**.

### Workflow

1. User clicks **Try On** from the product page  
2. Product image is dynamically extracted  
3. Background is removed using a deep learning model  
4. Webcam captures live video  
5. Body landmarks are detected  
6. Garment is resized and aligned  
7. Clothing is overlaid using canvas rendering  

### Technologies Used (Virtual Try-On)

- **MediaPipe Pose** – Real-time body landmark detection  
- **OpenCV** – Frame processing and alignment  
- **Python (Flask)** – AI processing backend  
- **rembg (U²-Net)** – Background removal  
- **HTML5 Canvas & Webcam API** – Live rendering  

---

## AI-Powered Multilingual Voice Assistant

The application includes a **hands-free multilingual voice assistant** that allows users to interact with the website using **natural speech**.

### Key Capabilities

- Voice-based product search and filtering  
- Automatic language detection  
- Internal translation to English for intent processing  
- Voice-controlled cart actions  
- Voice navigation across pages  
- Browser back/forward control via voice  
- Voice-based sorting  

---

### Supported Voice Commands (Examples)

| Voice Command | Action |
|--------------|--------|
| Men’s topwear under 500 | Filters products |
| Sort by price | Sorts low to high |
| Go to cart | Navigates to cart |
| Checkout | Opens checkout page |
| Go back | Browser back |
| Go forward | Browser forward |

---

## Technology Stack

| Layer | Technology |
|------|-----------|
| Database | MongoDB |
| Backend | Node.js, Express.js |
| Frontend | React.js (Vite) |
| Styling | Tailwind CSS |
| API | Axios |
| Authentication | JWT, bcryptjs |
| Computer Vision | MediaPipe, OpenCV |
| AI Processing | Python, Flask, rembg |
| Voice Assistant | Web Speech API, Ollama (Mistral)|

---

## Future Enhancements

- AI size recommendation  
- AR mirror integration  
- Advanced LLM search improvements  
