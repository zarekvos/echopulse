import socket
import qrcode
import sys
from io import BytesIO
import base64

def get_local_ip():
    """Get local IP address"""
    try:
        # Connect to a remote server to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.1.100"  # Fallback IP

def generate_qr_code(url):
    """Generate QR code for URL"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR code image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save as PNG
    img.save("mobile-qr.png")
    
    return "mobile-qr.png"

def create_mobile_access_page():
    """Create HTML page with QR code and instructions"""
    ip = get_local_ip()
    game_url = f"http://{ip}:8080"
    mobile_test_url = f"http://{ip}:8080/mobile-test.html"
    
    # Generate QR codes
    try:
        qr_file = generate_qr_code(mobile_test_url)
        print(f"✅ QR Code generated: {qr_file}")
    except ImportError:
        print("❌ qrcode library not installed. Run: pip install qrcode[pil]")
        qr_file = None
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Echo Pulse - Mobile Access</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #000428, #004e92);
            color: white;
            text-align: center;
        }}
        
        .container {{
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }}
        
        .qr-section {{
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
            color: black;
        }}
        
        .url-box {{
            background: rgba(0, 255, 255, 0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: monospace;
            font-size: 18px;
            border: 2px solid #00ffff;
        }}
        
        .step {{
            text-align: left;
            margin: 15px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }}
        
        .feature {{
            display: inline-block;
            margin: 5px;
            padding: 8px 15px;
            background: #00ff00;
            color: black;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 Echo Pulse Mobile Access 🌊</h1>
        <p>Revolutionary Echo-Detection Game - Mobile Optimized</p>
        
        <div class="qr-section">
            <h2>📱 Quick Access via QR Code</h2>
            {f'<img src="mobile-qr.png" alt="QR Code" style="max-width: 200px;">' if qr_file else '<p>QR Code not available - install qrcode library</p>'}
            <p><strong>Scan with your mobile camera app</strong></p>
        </div>
        
        <div class="url-box">
            <strong>Mobile Test URL:</strong><br>
            <a href="{mobile_test_url}" target="_blank">{mobile_test_url}</a>
        </div>
        
        <div class="url-box">
            <strong>Direct Game URL:</strong><br>
            <a href="{game_url}" target="_blank">{game_url}</a>
        </div>
        
        <h3>📋 Mobile Setup Instructions:</h3>
        
        <div class="step">
            <strong>1. Network Setup:</strong><br>
            • Ensure mobile and PC are on same WiFi<br>
            • Your PC IP: <code>{ip}</code><br>
            • Server running on port 8080
        </div>
        
        <div class="step">
            <strong>2. Mobile Access:</strong><br>
            • Scan QR code above, OR<br>
            • Type URL manually in mobile browser<br>
            • Start with mobile-test.html for diagnostics
        </div>
        
        <div class="step">
            <strong>3. Game Controls (Mobile):</strong><br>
            • 👆 <strong>Tap anywhere:</strong> Shoot echo wave<br>
            • 👆 <strong>Touch near player:</strong> Virtual joystick movement<br>
            • 👆 <strong>Long press (3s):</strong> Pulse blast<br>
            • 📱 <strong>Auto-aim:</strong> Player faces touch direction
        </div>
        
        <h3>🎮 Mobile Features:</h3>
        <div style="margin: 20px 0;">
            <span class="feature">Touch Controls</span>
            <span class="feature">Haptic Feedback</span>
            <span class="feature">Virtual Joystick</span>
            <span class="feature">Responsive UI</span>
            <span class="feature">Auto Orientation</span>
            <span class="feature">PWA Support</span>
        </div>
        
        <h3>🔧 Troubleshooting:</h3>
        
        <div class="step">
            <strong>Can't Access?</strong><br>
            • Check firewall settings<br>
            • Try different IP (run <code>ipconfig</code>)<br>
            • Restart server: <code>python -m http.server 8080</code>
        </div>
        
        <div class="step">
            <strong>Touch Not Working?</strong><br>
            • Try mobile-test.html first<br>
            • Check browser console for errors<br>
            • Use Chrome/Safari for best compatibility
        </div>
        
        <div class="step">
            <strong>Performance Issues?</strong><br>
            • Close other browser tabs<br>
            • Try landscape orientation<br>
            • Reduce browser zoom to 100%
        </div>
        
        <p style="margin-top: 30px;">
            <a href="{game_url}" style="background: #00ff00; color: black; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                🎮 Launch Echo Pulse Now!
            </a>
        </p>
    </div>
</body>
</html>"""
    
    with open("mobile-access.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"""
🌊 ECHO PULSE MOBILE ACCESS SETUP COMPLETE! 🌊

📱 Mobile URLs:
   • Mobile Test: {mobile_test_url}
   • Direct Game: {game_url}
   • Access Guide: http://{ip}:8080/mobile-access.html

📋 Next Steps:
   1. Ensure server is running: python -m http.server 8080
   2. Open mobile-access.html on your PC
   3. Scan QR code with mobile camera
   4. Start testing!

🔧 Your PC IP: {ip}
📡 Server Port: 8080
""")

if __name__ == "__main__":
    create_mobile_access_page()
