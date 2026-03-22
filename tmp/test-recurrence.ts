import axios from 'axios';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sh-admin-2024';
const BASE_URL = 'http://localhost:3000';

async function testRecurrence() {
  try {
    console.log('Testing recurring slot creation...');
    
    // 1. Create bulk recurring slots (2 weeks)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 1); // Tomorrow
    const dateStr = nextWeek.toISOString().split('T')[0];

    const response = await axios.post(`${BASE_URL}/api/admin/availability-bulk`, {
      slots: [{
        date: dateStr,
        startTime: '14:00',
        endTime: '14:30',
        capacity: 2,
        isActive: true
      }],
      recurrenceType: 'weekly',
      repeatCount: 1
    }, {
      headers: {
        'x-admin-password': ADMIN_PASSWORD,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response Status:', response.status);
    const createdSlots = response.data;
    console.log('Created Slots:', createdSlots.length);
    
    if (createdSlots.length === 2) {
      console.log('✅ Success: Created 2 slots (base + 1 week repetition)');
      console.log('Recurrence ID:', createdSlots[0].recurrenceId);
      
      const recId = createdSlots[0].recurrenceId;
      
      // 2. Test updating series
      console.log('Testing series update...');
      const updateRes = await axios.patch(`${BASE_URL}/api/admin/availability-series/${recId}`, {
        capacity: 5
      }, {
        headers: {
          'x-admin-password': ADMIN_PASSWORD
        }
      });
      console.log('Update Series Success:', updateRes.data.success);

      // 3. Test deleting series
      console.log('Testing series deletion...');
      const deleteRes = await axios.delete(`${BASE_URL}/api/admin/availability-series/${recId}`, {
        headers: {
          'x-admin-password': ADMIN_PASSWORD
        }
      });
      console.log('Delete Series Success:', deleteRes.data.success);
      
    } else {
      console.log('❌ Failure: Expected 2 slots, got', createdSlots.length);
    }

  } catch (error: any) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testRecurrence();
