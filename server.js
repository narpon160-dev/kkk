// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 1. ตั้งค่าการเชื่อมต่อ MongoDB
const MONGO_URI =
  "mongodb+srv://narponmax55_db_user:kingnoon55@noon.zglqzrg.mongodb.net/rental_db?retryWrites=true&w=majority&appName=Noon";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ เชื่อมต่อ MongoDB สำเร็จเรียบร้อย!"))
  .catch((err) => console.error("❌ เชื่อมต่อ MongoDB ล้มเหลว:", err));

// 2. กำหนดโครงสร้างข้อมูลบิล (Schema)
const billSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  billDate: { type: String, required: true },
  roomRent: { type: Number, default: 0 },
  electricity: {
    current: Number,
    previous: Number,
    units: Number,
    rate: Number,
    cost: Number,
  },
  water: {
    current: Number,
    previous: Number,
    units: Number,
    rate: Number,
    cost: Number,
  },

  // 👉 เพิ่มบรรทัดนี้ เพื่อให้ฐานข้อมูลรู้จักรายการเสริม (ค่าขยะ, ค่าส่วนกลาง ฯลฯ)
  extraItems: [{ name: String, cost: Number }],

  totalCost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Bill = mongoose.model("Bill", billSchema);

// 3. API บันทึกข้อมูลบิลใหม่ (POST)
app.post("/api/bills", async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    await newBill.save();
    res.status(201).json({ message: "บันทึกสำเร็จ!", bill: newBill });
  } catch (error) {
    res.status(500).json({ error: "บันทึกข้อมูลไม่สำเร็จ" });
  }
});

// 4. API ดึงประวัติบิลทั้งหมด (GET)
app.get("/api/bills", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: "ดึงข้อมูลไม่สำเร็จ" });
  }
});

// 5. API ลบบิล (DELETE)
app.delete("/api/bills/:id", async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    res.status(500).json({ error: "ลบข้อมูลไม่สำเร็จ" });
  }
});

// 6. 👉 API อัปเดต/แก้ไขข้อมูลบิล (PUT) - เพิ่มใหม่!
app.put("/api/bills/:id", async (req, res) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // ให้ส่งข้อมูลตัวใหม่ที่เพิ่งอัปเดตกลับไป
    );

    if (!updatedBill) {
      return res.status(404).json({ error: "ไม่พบบิลที่ต้องการแก้ไข" });
    }

    res.json({ message: "อัปเดตข้อมูลสำเร็จ!", bill: updatedBill });
  } catch (error) {
    res.status(500).json({ error: "อัปเดตข้อมูลไม่สำเร็จ" });
  }
});

// เริ่มต้นรันเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server กำลังรันอยู่ที่พอร์ต ${PORT}`);
});
