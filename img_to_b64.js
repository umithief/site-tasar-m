
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'uploads', 'aero_speed_kask.png');
try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    console.log(`data:image/png;base64,${base64String}`);
} catch (err) {
    console.error('Error reading file:', err);
}
