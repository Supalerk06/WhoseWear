# WhoseWear 👕👗

A modern, highly accessible clothing management web application designed to help family members effortlessly track and identify clothing ownership within the household. This project is specifically optimized with large touch targets, making it extremely friendly for elderly users.

---

## 📸 Preview

![Home Page](./docs/home.png)

---

## ✨ Features

- **Frontend Image Compression:** Automatically compresses and resizes heavy images (handling complex PNG transparency and background issues) before uploading, optimizing both server storage and loading speeds.
- **Family Ownership Tracking:** Clear visual cues and dedicated color tags to identify who owns which piece of clothing.
- **Smart Filtering:** Quickly browse clothing by category, owner, patterns, or solid colors.
- **Elderly-Friendly UI:** Large buttons and high-contrast elements customized for seniors and touch targets.
- **Dark Mode Support:** Smooth transition between light and dark themes based on preference.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Styling:** Tailwind CSS (with Dark Mode support)
- **Build Tool:** Vite

### Backend & Database
- **Backend as a Service:** Supabase (Database & Storage buckets)
- **Database:** PostgreSQL (with Real-time Subscription support)

---

## 💾 Database Schema

The application communicates with a single PostgreSQL table named `clothes` via Supabase Client:

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique identifier for each item |
| `name` | `text` | Name or description of the clothing |
| `pattern_type`| `text` | Pattern type (e.g., `solid`, `striped`, `polka-dot`) |
| `colors` | `text[]` | Array of colors associated with the item |
| `category` | `text` | Category (e.g., Shirt, T-Shirt, Pants) |
| `owner` | `text` | The family member who owns this item |
| `image_url` | `text` | Public URL link of the image hosted on Supabase Storage |
| `created_at` | `timestamp` | Timestamp when the record was created |

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Installation

Clone the repository and navigate into the project directory:

```bash
git clone [https://github.com/username/WhoseWear.git](https://github.com/username/WhoseWear.git)
cd WhoseWear