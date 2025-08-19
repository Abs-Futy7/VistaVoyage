from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
from src.config import Config
import jwt
import uuid
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from src.db.redis import redis_client

# Password hashing
password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

ACCESS_TOKEN_EXPIRY = 2 * 60 * 60  # 2 hours
OTP_EXPIRY = 300  # 5 minutes

def generate_hash_password(password: str) -> str:
    hash = password_context.hash(password)
    if not hash:
        raise ValueError("Password hashing failed")
    return hash

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)

def create_access_token(user_data: dict, expiry: timedelta = None, refresh: bool = False):
    payload = {}
    payload["id"] = str(user_data["uid"])   
    payload["email"] = user_data["email"]   
    payload["exp"] = datetime.now(timezone.utc) + (expiry or timedelta(seconds=ACCESS_TOKEN_EXPIRY))
    payload["jti"] = str(uuid.uuid4())
    payload["refresh"] = refresh
    
    token = jwt.encode(
        payload=payload,
        key=Config.JWT_SECRET_KEY,
        algorithm=Config.JWT_ALGORITHM
    )
    return token

def decode_token(token: str) -> dict:
    try:
        token_data = jwt.decode(
            jwt=token,
            key=Config.JWT_SECRET_KEY,
            algorithms=[Config.JWT_ALGORITHM]
       )
        return token_data
    except jwt.PyJWTError as e:
        logging.exception(e)
        return None

# OTP Functions
def generate_otp(length=6):
    return ''.join(str(random.randint(0, 9)) for _ in range(length))

async def store_otp(email: str, otp: str):
    await redis_client.set(name=f"otp:{email}", value=otp, ex=OTP_EXPIRY)

async def get_stored_otp(email: str):
    stored_otp = await redis_client.get(f"otp:{email}")
    if stored_otp:
        # Handle both bytes and string returns from Redis
        if isinstance(stored_otp, bytes):
            return stored_otp.decode('utf-8')
        return str(stored_otp)
    return None

async def delete_otp(email: str):
    await redis_client.delete(f"otp:{email}")

# Store password reset session
async def store_password_reset_session(email: str, session_id: str):
    """Store a password reset session that's valid for 10 minutes"""
    await redis_client.set(name=f"password_reset:{email}", value=session_id, ex=600)  # 10 minutes

async def verify_password_reset_session(email: str, session_id: str):
    """Verify if the password reset session is valid"""
    stored_session = await redis_client.get(f"password_reset:{email}")
    if stored_session:
        # Handle both bytes and string returns from Redis
        if isinstance(stored_session, bytes):
            stored_session = stored_session.decode('utf-8')
        return str(stored_session) == str(session_id)
    return False

async def delete_password_reset_session(email: str):
    """Delete the password reset session"""
    await redis_client.delete(f"password_reset:{email}")

# Email Functions
def send_otp_email(recipient_email: str, otp: str, user_name: str = "User"):
    """Send OTP email for password reset"""
    try:
        # Ensure all parameters are strings
        recipient_email = str(recipient_email)
        otp = str(otp)
        user_name = str(user_name) if user_name else "User"
        
        subject = "VistaVoyage - Password Reset OTP"
        
        # Create HTML email
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset OTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Password Reset</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0;">VistaVoyage</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
                <h2 style="color: #333; margin-top: 0;">Hello {user_name}!</h2>
                
                <p>We received a request to reset your password for your VistaVoyage account.</p>
                
                <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password (OTP) is:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 15px 0; font-family: 'Courier New', monospace;">
                        {otp}
                    </div>
                    <p style="margin: 0; color: #666; font-size: 12px;">⏰ Valid for 5 minutes only</p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>⚠️ Security Notice:</strong><br>
                        • This OTP will expire in 5 minutes<br>
                        • Do not share this code with anyone<br>
                        • If you didn't request this, please ignore this email
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
                
                <p style="color: #666; font-size: 14px; margin: 0;">
                    Thank you,<br>
                    <strong>The VistaVoyage Team</strong>
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_body = f"""
        VistaVoyage - Password Reset OTP
        
        Hello {user_name}!
        
        We received a request to reset your password for your VistaVoyage account.
        
        Your One-Time Password (OTP) is: {otp}
        
        Please enter this OTP in the app to proceed with resetting your password.
        
        ⚠️ This OTP is valid for 5 minutes only. If you do not enter it within this time, you will need to request a new OTP.
        
        If you did not request a password reset, please ignore this email or contact support.
        
        Thank you,
        The VistaVoyage Team
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{Config.SMTP_FROM_NAME} <{Config.SMTP_FROM_EMAIL}>"
        msg['To'] = recipient_email
        
        # Attach both plain text and HTML versions
        text_part = MIMEText(text_body, 'plain')
        html_part = MIMEText(html_body, 'html')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            server.send_message(msg)
            
        logging.info(f"OTP email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send OTP email to {recipient_email}: {str(e)}")
        return False

def send_password_reset_confirmation_email(recipient_email: str, user_name: str = "User"):
    """Send confirmation email after successful password reset"""
    try:
        # Ensure all parameters are strings
        recipient_email = str(recipient_email)
        user_name = str(user_name) if user_name else "User"
        
        subject = "VistaVoyage - Password Reset Successful"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ Password Updated</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0;">VistaVoyage</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
                <h2 style="color: #333; margin-top: 0;">Hello {user_name}!</h2>
                
                <p>Your password has been successfully reset for your VistaVoyage account.</p>
                
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #155724;">
                        <strong>🔐 Security Update:</strong><br>
                        Your account password was changed on {datetime.now().strftime('%B %d, %Y at %I:%M %p UTC')}
                    </p>
                </div>
                
                <p>You can now log in to your account using your new password.</p>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>⚠️ Security Notice:</strong><br>
                        If you did not initiate this password reset, please contact our support team immediately.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
                
                <p style="color: #666; font-size: 14px; margin: 0;">
                    Thank you,<br>
                    <strong>The VistaVoyage Team</strong>
                </p>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        VistaVoyage - Password Reset Successful
        
        Hello {user_name}!
        
        Your password has been successfully reset for your VistaVoyage account.
        
        Security Update: Your account password was changed on {datetime.now().strftime('%B %d, %Y at %I:%M %p UTC')}
        
        You can now log in to your account using your new password.
        
        If you did not initiate this password reset, please contact our support team immediately.
        
        Thank you,
        The VistaVoyage Team
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{Config.SMTP_FROM_NAME} <{Config.SMTP_FROM_EMAIL}>"
        msg['To'] = recipient_email
        
        # Attach both versions
        text_part = MIMEText(text_body, 'plain')
        html_part = MIMEText(html_body, 'html')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            server.send_message(msg)
            
        logging.info(f"Password reset confirmation email sent to {recipient_email}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send confirmation email to {recipient_email}: {str(e)}")
        return False