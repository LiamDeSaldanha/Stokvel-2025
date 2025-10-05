# Emergency Withdrawal Feature

## Overview

The emergency withdrawal feature allows stokvel members to exit a stokvel early and withdraw their contributions with a penalty. This feature is designed to provide financial flexibility for members who face unexpected circumstances.

## How It Works

### 1. Penalty Structure
- **Penalty Rate**: 10% of total contributions
- **Calculation**: `withdrawal_amount = total_contributions - (total_contributions * 0.10)`

### 2. Eligibility Requirements
- User must be enrolled in the stokvel
- User must have made at least one contribution
- Stokvel must have sufficient funds to cover the withdrawal

### 3. Process
1. User requests emergency withdrawal
2. System calculates total contributions by the user
3. System applies 10% penalty
4. System checks if stokvel has sufficient funds
5. If approved:
   - Updates stokvel net value
   - Records negative payment (withdrawal)
   - Removes user from stokvel enrollment
   - Returns withdrawal details

## API Endpoints

### Emergency Withdrawal
```http
POST /emergency-withdrawal
```

**Request Body:**
```json
{
  "user_id": 1,
  "stokvel_id": 2
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Emergency withdrawal successful",
  "total_contributions": 1550.0,
  "penalty_amount": 155.0,
  "withdrawal_amount": 1395.0,
  "remaining_stokvel_value": 3605
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "User is not enrolled in this stokvel",
  "withdrawal_amount": 0
}
```

## AI Agent Integration

The AI chatbot can help users understand and calculate emergency withdrawals:

### Example Queries:
- "How much would I get if I do an emergency withdrawal?"
- "Calculate emergency withdrawal for user 1 from stokvel 2"
- "What's the penalty for early withdrawal?"
- "Explain how emergency withdrawals work"

### AI Agent Tool: `calculate_emergency_withdrawal`
This tool provides a simulation of what a user would receive without actually performing the withdrawal.

## Database Changes

### New Method: `User.emergency_withdraw()`
Added to the User model to handle the withdrawal logic:
- Validates user enrollment
- Calculates contributions and penalties
- Updates stokvel balance
- Records withdrawal transaction
- Handles database transactions with rollback on errors

## Usage Examples

### 1. Using cURL
```bash
curl -X POST "http://localhost:8000/emergency-withdrawal" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "stokvel_id": 2
  }'
```

### 2. Using Python requests
```python
import requests

withdrawal_data = {
    "user_id": 1,
    "stokvel_id": 2
}

response = requests.post(
    "http://localhost:8000/emergency-withdrawal",
    json=withdrawal_data
)

result = response.json()
print(f"Withdrawal amount: R{result['withdrawal_amount']}")
```

### 3. Using the AI Chat
```
User: "I need to make an emergency withdrawal from stokvel 2. I'm user 1. How much would I get?"

AI: "Let me calculate your emergency withdrawal amount..."
```

## Error Handling

The system handles several error scenarios:

1. **User not found**: Returns 404 error
2. **User not enrolled**: Returns appropriate error message
3. **No contributions**: Returns error for zero contributions
4. **Insufficient funds**: Returns error with available amount
5. **Database errors**: Rolls back transaction and returns error

## Security Considerations

- Ensure proper user authentication before allowing withdrawals
- Log all withdrawal transactions for audit purposes
- Consider implementing additional verification steps for large withdrawals
- Monitor for potential abuse of the emergency withdrawal system

## Testing

Use the provided test script `test_emergency_withdrawal.py` to test the complete workflow:

```bash
python test_emergency_withdrawal.py
```

This script will:
1. Create a test stokvel and user
2. Enroll the user and make payments
3. Test the AI calculation feature
4. Perform an actual emergency withdrawal
5. Display all results

## Future Enhancements

Potential improvements to consider:

1. **Variable penalty rates** based on time in stokvel
2. **Approval process** requiring admin consent
3. **Partial withdrawals** instead of full exit
4. **Cooling-off period** to prevent immediate re-enrollment
5. **Email notifications** to all stokvel members
6. **Detailed withdrawal history** and reporting