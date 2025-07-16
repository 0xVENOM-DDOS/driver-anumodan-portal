# 🚗 Driver Anumodan Portal

The **Driver Anumodan Portal** is a responsive web application designed to streamline the process of collecting and verifying driver information. The platform allows users to submit detailed records—along with supporting documents—and securely stores everything in a PostgreSQL database hosted on [Supabase](https://supabase.com/).

🔗 **Live Site**: [https://driver-anumodan-portal.netlify.app](https://driver-anumodan-portal.netlify.app)

---

## 📌 Features

- 📄 Collects driver info (name, DOB, license, vehicle number, etc.)
- 📷 Uploads and stores license, photo, and certificate images
- 🧾 Tracks fetched status of DL and Anumodan info
- ☁️ Stores all metadata on Supabase (PostgreSQL)
- 💡 Built with HTML, CSS, and JS (no frameworks)
- 🚀 Hosted on Netlify for high availability and performance

---

## 🧰 Tech Stack

| Layer       | Technology             |
|-------------|------------------------|
| Frontend    | HTML, CSS, JavaScript  |
| Backend DB  | Supabase (PostgreSQL)  |
| Hosting     | Netlify                |
| UI Design   | Vercel's [v0.dev](https://v0.dev) |

---

## 🗃️ Supabase Database Schema: `drivers` Table

| Column               | Type       | Description                                     |
|----------------------|------------|-------------------------------------------------|
| `id`                 | UUID       | Primary Key (auto-generated)                   |
| `driver_name`        | Text       | Driver's full name                              |
| `date_of_birth`      | Date       | Driver's date of birth                          |
| `valid_from`         | Date       | License or certificate validity start date      |
| `valid_upto`         | Date       | Validity end date                               |
| `vehicle_number`     | Text       | Vehicle registration number                     |
| `license_number`     | Text       | Driving license number                          |
| `dl_fetched`         | Boolean    | Whether DL info has been fetched                |
| `anumodan_fetched`   | Boolean    | Whether approval info has been fetched          |
| `certificate_file`   | Text       | File identifier or reference                    |
| `certificate_url`    | Text       | URL to the uploaded certificate file            |
| `certificate_size`   | Int8       | Size of the certificate file in bytes           |
| `driver_photo_file`  | Text       | File identifier for driver's photo              |
| `driver_photo_url`   | Text       | URL to driver's photo                           |
| `driver_photo_size`  | Int8       | Size of driver's photo                          |
| `license_photo_file` | Text       | License photo file reference                    |
| `license_photo_url`  | Text       | URL to license image                            |
| `license_photo_size` | Int8       | Size of license photo                           |
| `date_added`         | TimestampZ | Auto-stamped timestamp of record creation       |

> 💡 This schema is designed for scalability, supporting document uploads and verification tracking.

---
<img width="1346" height="677" alt="Screenshot 2025-07-17 010144" src="https://github.com/user-attachments/assets/c8a852d4-8361-4e85-8799-feffda6ceeb8" />
<img width="1347" height="681" alt="Screenshot 2025-07-17 010156" src="https://github.com/user-attachments/assets/9ccc3eb8-11c5-4262-950c-eeb228923621" />
<img width="1349" height="681" alt="Screenshot 2025-07-17 010206" src="https://github.com/user-attachments/assets/342105c5-6143-424a-8af0-b12410e07441" />
<img width="1348" height="678" alt="Screenshot 2025-07-17 010233" src="https://github.com/user-attachments/assets/4dec2d85-752e-4c21-9ac7-5c444cc234d8" />


