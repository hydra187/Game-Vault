# 🎮 Retro Game Vault

A modern web application to explore, search, and compare classic and modern video games using the RAWG API. Build your personal wishlist, filter by platforms, and discover games in a visually rich interface.

---

## 📌 Description

Retro Game Vault is a game discovery platform that allows users to search for video games in real-time, filter them by platform, and save their favorite titles locally in the browser.

It integrates with the RAWG Video Games Database API to fetch up-to-date game information including ratings, platforms, release dates, and more.

---

## 🚀 Core Features

### 🔍 Smart Game Search
- Real-time game search powered by RAWG API  
- Debounce logic implemented to reduce unnecessary API calls  
- Smooth and responsive search experience  

---

### 🎯 Platform Filtering
- Filter games by platform:
  - PC  
  - PlayStation  
  - Xbox  
  - Nintendo  
- Dynamic filtering using API query parameters  

---

### ⭐ Wishlist (Favorites Sidebar)
- Add/remove games to favorites  
- Persistent storage using LocalStorage  
- Sidebar for quick access to saved games  

---

### ⚖️ Compare Mode (Challenge Feature)
- Select two games to compare  
- Side-by-side comparison including:
  - Name  
  - Rating  
  - Release Date  
  - Platforms  
  - Genre  

---

### 🖼️ UI Design
- Responsive grid layout  
- Large game cover images (box art)  
- Star rating display  
- Clean and minimal interface  

---

## 🌐 API Used

- RAWG Video Games Database API  
  https://rawg.io/apidocs  

### Example Endpoint:
```bash
https://api.rawg.io/api/games?key=YOUR_API_KEY&search=game_name