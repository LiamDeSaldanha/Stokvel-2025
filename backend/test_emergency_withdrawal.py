"""
Test script for emergency withdrawal functionality

This script demonstrates how to use the emergency withdrawal feature.
"""

import asyncio
import requests
import json

# Base URL for the API (adjust if your backend is running on a different port)
BASE_URL = "http://localhost:8000"

def create_test_stokvel():
    """Create a test stokvel"""
    stokvel_data = {
        "name": "Emergency Test Stokvel",
        "number_people": 5,
        "goal": "Test emergency withdrawal functionality",
        "monthly_contribution": 1000,
        "net_value": 5000,  # Start with some money in the stokvel
        "interest_rate": 3
    }
    
    response = requests.post(f"{BASE_URL}/stokvels/", json=stokvel_data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error creating stokvel: {response.text}")
        return None

def create_test_user():
    """Create a test user"""
    user_data = {
        "name": "John",
        "surname": "Doe", 
        "password": "testpass123",
        "email": "john.doe@example.com",
        "id_number": "1234567890123"
    }
    
    response = requests.post(f"{BASE_URL}/users/", json=user_data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error creating user: {response.text}")
        return None

def enroll_user_in_stokvel(user_id, stokvel_id):
    """Enroll user in stokvel"""
    enrollment_data = {
        "userId": user_id,
        "stokvelId": stokvel_id,
        "isAdmin": False
    }
    
    response = requests.post(f"{BASE_URL}/enrollments/", json=enrollment_data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error enrolling user: {response.text}")
        return None

def make_payment(user_id, stokvel_id, amount):
    """Make a payment to the stokvel"""
    payment_data = {
        "userId": user_id,
        "stokvelId": stokvel_id,
        "amount": amount
    }
    
    response = requests.post(f"{BASE_URL}/payments/", json=payment_data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error making payment: {response.text}")
        return None

def emergency_withdrawal(user_id, stokvel_id):
    """Perform emergency withdrawal"""
    withdrawal_data = {
        "user_id": user_id,
        "stokvel_id": stokvel_id
    }
    
    response = requests.post(f"{BASE_URL}/emergency-withdrawal", json=withdrawal_data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error during withdrawal: {response.text}")
        return None

def test_chat_emergency_calculation(user_id, stokvel_id):
    """Test the AI agent's emergency withdrawal calculation"""
    message = f"Calculate emergency withdrawal for user {user_id} from stokvel {stokvel_id}"
    
    chat_data = {"message": message}
    response = requests.post(f"{BASE_URL}/chat", json=chat_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error in chat: {response.text}")
        return None

def main():
    """Main test function"""
    print("🏦 Testing Emergency Withdrawal Functionality")
    print("=" * 50)
    
    # Step 1: Create test stokvel
    print("1. Creating test stokvel...")
    stokvel = create_test_stokvel()
    if not stokvel:
        return
    print(f"   ✅ Created stokvel: {stokvel['name']} (ID: {stokvel['id']})")
    
    # Step 2: Create test user
    print("\n2. Creating test user...")
    user = create_test_user()
    if not user:
        return
    print(f"   ✅ Created user: {user['name']} {user['surname']} (ID: {user['id']})")
    
    # Step 3: Enroll user in stokvel
    print("\n3. Enrolling user in stokvel...")
    enrollment = enroll_user_in_stokvel(user['id'], stokvel['id'])
    if not enrollment:
        return
    print(f"   ✅ User enrolled successfully")
    
    # Step 4: Make some payments
    print("\n4. Making payments...")
    payments = [
        make_payment(user['id'], stokvel['id'], 500),
        make_payment(user['id'], stokvel['id'], 750),
        make_payment(user['id'], stokvel['id'], 300)
    ]
    total_paid = sum([p['amount'] for p in payments if p])
    print(f"   ✅ Made 3 payments totaling: R{total_paid}")
    
    # Step 5: Test AI agent calculation
    print("\n5. Testing AI agent emergency withdrawal calculation...")
    chat_response = test_chat_emergency_calculation(user['id'], stokvel['id'])
    if chat_response:
        print(f"   🤖 AI Response: {chat_response['response']}")
    
    # Step 6: Perform emergency withdrawal
    print("\n6. Performing emergency withdrawal...")
    withdrawal_result = emergency_withdrawal(user['id'], stokvel['id'])
    if withdrawal_result:
        print("   ✅ Emergency withdrawal successful!")
        print(f"   💰 Total contributions: R{withdrawal_result['total_contributions']}")
        print(f"   ⚠️  Penalty amount: R{withdrawal_result['penalty_amount']}")
        print(f"   💵 Withdrawal amount: R{withdrawal_result['withdrawal_amount']}")
        print(f"   🏦 Remaining stokvel value: R{withdrawal_result['remaining_stokvel_value']}")
    
    print("\n" + "=" * 50)
    print("✅ Emergency withdrawal test completed!")

if __name__ == "__main__":
    main()